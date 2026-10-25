import { APP_CONFIG, PollutantKey, ActivityId } from "../config/appConfig";
import { LocationAirQualityState, CandidateSlot, RankedRecommendation } from "../types";
import { getCurrentTimeKey, getTimeKey, getTimeKeyAfterHours } from "./time";

/**
 * Extracts candidate future time slots within the chosen window (6, 12, or 24 hours).
 * Excludes past timestamps.
 */
export function extractCandidateSlots(
  locations: LocationAirQualityState[],
  windowHours: 6 | 12 | 24
): CandidateSlot[] {
  const candidates: CandidateSlot[] = [];

  for (const loc of locations) {
    if (loc.error || loc.isLoading || loc.hourlySlots.length === 0) continue;

    const nowKey = getCurrentTimeKey(loc.timezone);
    const cutoffKey = getTimeKeyAfterHours(windowHours, loc.timezone);
    for (const slot of loc.hourlySlots) {
      // Strictly future within [now, now + window]
      const slotKey = getTimeKey(slot.isoTime);
      if (slotKey >= nowKey && slotKey <= cutoffKey) {
        const pollutantsMap: Record<PollutantKey, number | null> = {
          pm2_5: slot.pm2_5,
          pm10: slot.pm10,
          nitrogen_dioxide: slot.nitrogen_dioxide,
          ozone: slot.ozone,
          sulphur_dioxide: slot.sulphur_dioxide,
          carbon_monoxide: slot.carbon_monoxide
        };

        candidates.push({
          locationId: loc.location.id,
          locationName: loc.location.name,
          adminRegion: [loc.location.admin1, loc.location.country].filter(Boolean).join(", "),
          timezone: loc.timezone,
          isoTime: slot.isoTime,
          formattedTime: slot.localTimeLabel,
          formattedDate: slot.dateLabel,
          pollutants: pollutantsMap,
          units: loc.hourlyUnits,
          rawValues: { ...pollutantsMap }
        });
      }
    }
  }

  return candidates;
}

/**
 * Filters candidates to ensure minimum data integrity:
 * - PM2.5 MUST be valid numeric.
 * - At least minValidPollutants must be present.
 * Never silently assigns 0 to missing values!
 */
export function validateCandidateCompleteness(candidate: CandidateSlot): boolean {
  const { requirePm25, minValidPollutants } = APP_CONFIG.minDataRequirements;

  if (requirePm25) {
    if (candidate.pollutants.pm2_5 === null || isNaN(candidate.pollutants.pm2_5) || candidate.pollutants.pm2_5 < 0) {
      return false;
    }
  }

  let validCount = 0;
  for (const key of Object.keys(candidate.pollutants) as PollutantKey[]) {
    const val = candidate.pollutants[key];
    if (val !== null && !isNaN(val) && val >= 0) {
      validCount++;
    }
  }

  return validCount >= minValidPollutants;
}

/**
 * Transparent Rule-Based Ranking Engine:
 * 1. Checks minimum data requirement.
 * 2. Calculates relative ranking [0..1] for each pollutant across all candidates in set.
 * 3. Applies configurable weights only over available pollutants.
 * 4. Produces normalized Relative Pollution Score [0..100] (Lower is comparatively cleaner).
 * 5. Deterministic tie-breaking: Score -> PM2.5 -> Earliest Time -> Alphabetical.
 * 6. Generates human-understandable explanation grounded in the actual figures.
 */
export function rankOutdoorCandidates(
  candidates: CandidateSlot[],
  activityId: ActivityId = "walking"
): RankedRecommendation[] {
  // 1. Strict filtering
  const validCandidates = candidates.filter(validateCandidateCompleteness);
  if (validCandidates.length === 0) {
    return [];
  }

  // Activity-specific weight modifier for respiratory intensity
  const activity = APP_CONFIG.activities.find(a => a.id === activityId) || APP_CONFIG.activities[0];
  const isHighIntensity = activity.metabolicIntensity === "High";

  // 2. Compute min and max for each pollutant across candidate pool
  const minMax: Record<PollutantKey, { min: number; max: number; count: number }> = {
    pm2_5: { min: Infinity, max: -Infinity, count: 0 },
    pm10: { min: Infinity, max: -Infinity, count: 0 },
    nitrogen_dioxide: { min: Infinity, max: -Infinity, count: 0 },
    ozone: { min: Infinity, max: -Infinity, count: 0 },
    sulphur_dioxide: { min: Infinity, max: -Infinity, count: 0 },
    carbon_monoxide: { min: Infinity, max: -Infinity, count: 0 }
  };

  validCandidates.forEach(c => {
    (Object.keys(c.pollutants) as PollutantKey[]).forEach(k => {
      const v = c.pollutants[k];
      if (v !== null && !isNaN(v)) {
        if (v < minMax[k].min) minMax[k].min = v;
        if (v > minMax[k].max) minMax[k].max = v;
        minMax[k].count++;
      }
    });
  });

  // 3. Score each candidate
  const intermediate = validCandidates.map(c => {
    let weightedRankSum = 0;
    let effectiveWeightSum = 0;
    const normalizedRanks: Record<PollutantKey, number | null> = {
      pm2_5: null,
      pm10: null,
      nitrogen_dioxide: null,
      ozone: null,
      sulphur_dioxide: null,
      carbon_monoxide: null
    };
    const usedWeights: Record<PollutantKey, number> = {
      pm2_5: 0,
      pm10: 0,
      nitrogen_dioxide: 0,
      ozone: 0,
      sulphur_dioxide: 0,
      carbon_monoxide: 0
    };

    APP_CONFIG.pollutants.forEach(p => {
      const val = c.pollutants[p.key];
      if (val !== null && !isNaN(val)) {
        const range = minMax[p.key].max - minMax[p.key].min;
        // Relative rank: 0 if lowest concentration in set, 1 if highest. If uniform, 0.5.
        const normRank = range > 0.0001 ? (val - minMax[p.key].min) / range : 0.5;
        normalizedRanks[p.key] = normRank;

        // Base weight from config
        let w = p.weight;
        // Adjust for high respiratory activities: heighten PM2.5 and Ozone sensitivity
        if (isHighIntensity) {
          if (p.key === "pm2_5") w *= 1.3;
          if (p.key === "ozone") w *= 1.2;
        }

        usedWeights[p.key] = w;
        weightedRankSum += normRank * w;
        effectiveWeightSum += w;
      }
    });

    const finalScore = effectiveWeightSum > 0 ? (weightedRankSum / effectiveWeightSum) * 100 : 50;

    const completeness =
      (Object.values(c.pollutants).filter(v => v !== null && !isNaN(v)).length /
        APP_CONFIG.pollutants.length) *
      100;

    return {
      candidate: c,
      relativeScore: parseFloat(finalScore.toFixed(1)),
      normalizedPollutantRanks: normalizedRanks,
      usedWeights,
      totalEffectiveWeight: effectiveWeightSum,
      dataCompletenessPercentage: Math.round(completeness)
    };
  });

  // 4. Deterministic Sort:
  // - Ascending score (lower is comparatively cleaner)
  // - Tie 1: Lowest PM2.5
  // - Tie 2: Earliest ISO time
  // - Tie 3: Location Name alphabetical
  intermediate.sort((a, b) => {
    if (Math.abs(a.relativeScore - b.relativeScore) > 0.05) {
      return a.relativeScore - b.relativeScore;
    }
    const pmA = a.candidate.pollutants.pm2_5 ?? 9999;
    const pmB = b.candidate.pollutants.pm2_5 ?? 9999;
    if (Math.abs(pmA - pmB) > 0.1) {
      return pmA - pmB;
    }
    const timeA = getTimeKey(a.candidate.isoTime);
    const timeB = getTimeKey(b.candidate.isoTime);
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return a.candidate.locationName.localeCompare(b.candidate.locationName);
  });

  // 5. Generate transparent explanations based on actual pollutant figures
  return intermediate.map((item, idx) => {
    const rank = idx + 1;
    const { candidate, normalizedPollutantRanks, relativeScore } = item;

    // Find standout pollutants (lowest and highest relative ranks)
    const availablePollutantRanks: Array<{ key: PollutantKey; rank: number }> = [];
    for (const key of Object.keys(normalizedPollutantRanks) as PollutantKey[]) {
      const value = normalizedPollutantRanks[key];
      if (value !== null) availablePollutantRanks.push({ key, rank: value });
    }
    availablePollutantRanks.sort((a, b) => a.rank - b.rank);
    const bestPollutant = availablePollutantRanks[0] ?? null;
    const worstPollutant = availablePollutantRanks[availablePollutantRanks.length - 1] ?? null;

    const pmVal = candidate.pollutants.pm2_5 !== null ? `${candidate.pollutants.pm2_5.toFixed(1)} µg/m³` : "N/A";
    let explanation = `Ranked #${rank} among ${intermediate.length} candidate slots with a Relative Score of ${relativeScore}/100. `;

    if (rank === 1) {
      explanation += `This slot presents the comparatively cleanest overall profile in your window, featuring low PM2.5 (${pmVal})`;
      if (bestPollutant && bestPollutant.key !== "pm2_5") {
        const bestKey = bestPollutant.key;
        const bestLabel = APP_CONFIG.pollutants.find(p => p.key === bestKey)?.label || bestKey;
        explanation += ` and optimal ${bestLabel} levels across compared slots.`;
      } else {
        explanation += ` across all candidate hours.`;
      }
    } else {
      explanation += `PM2.5 is at ${pmVal}. `;
      if (worstPollutant && worstPollutant.rank > 0.6) {
        const worstKey = worstPollutant.key;
        const worstLabel = APP_CONFIG.pollutants.find(p => p.key === worstKey)?.label || worstKey;
        explanation += `Higher comparative concentrations of ${worstLabel} contributed to a lower ranking.`;
      } else {
        explanation += `Balanced concentrations across secondary pollutants.`;
      }
    }

    return {
      rank,
      candidate: item.candidate,
      relativeScore: item.relativeScore,
      normalizedPollutantRanks: item.normalizedPollutantRanks,
      usedWeights: item.usedWeights,
      totalEffectiveWeight: item.totalEffectiveWeight,
      explanation,
      topContributingFavourablePollutant: bestPollutant?.key,
      topContributingUnfavourablePollutant: worstPollutant?.key,
      dataCompletenessPercentage: item.dataCompletenessPercentage
    };
  });
}
