import { APP_CONFIG, PollutantKey } from "../config/appConfig";

export function formatPollutantValue(value: number | null | undefined, unit: string = "µg/m³"): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "Unavailable";
  }
  return `${value.toFixed(1)} ${unit}`;
}

export function getPollutantLabel(key: PollutantKey): string {
  const p = APP_CONFIG.pollutants.find(item => item.key === key);
  return p ? p.label : key;
}

export function getPollutantFullName(key: PollutantKey): string {
  const p = APP_CONFIG.pollutants.find(item => item.key === key);
  return p ? p.name : key;
}

export function getPollutantUnit(key: PollutantKey, unitsMap?: Record<string, string>): string {
  if (unitsMap && unitsMap[key]) {
    return unitsMap[key];
  }
  const p = APP_CONFIG.pollutants.find(item => item.key === key);
  return p ? p.unit : "µg/m³";
}

/**
 * Computes difference and trend string compared to previous hour.
 */
export function computeTrend(current: number | null, previous: number | null): {
  direction: "up" | "down" | "flat" | "unknown";
  diffText: string;
} {
  if (current === null || previous === null) {
    return { direction: "unknown", diffText: "No prior hour" };
  }
  const diff = current - previous;
  if (Math.abs(diff) < 0.2) {
    return { direction: "flat", diffText: "Stable vs last hour" };
  }
  if (diff > 0) {
    return { direction: "up", diffText: `+${diff.toFixed(1)} vs last hr` };
  }
  return { direction: "down", diffText: `${diff.toFixed(1)} vs last hr` };
}

/**
 * Returns color category for Relative Score badge.
 */
export function getScoreBadgeClass(score: number): { bg: string; text: string; border: string; label: string } {
  if (score <= 25) {
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Comparatively Lowest" };
  }
  if (score <= 50) {
    return { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", label: "Comparatively Moderate" };
  }
  if (score <= 75) {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Comparatively Elevated" };
  }
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Comparatively Highest" };
}
