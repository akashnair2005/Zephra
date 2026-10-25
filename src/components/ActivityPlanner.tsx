import React, { useState, useMemo } from 'react';
import { Footprints, Bike, Flame, Dumbbell, Compass, Clock, Award, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { APP_CONFIG, ActivityId } from '../config/appConfig';
import { LocationAirQualityState, RankedRecommendation } from '../types';
import { extractCandidateSlots, rankOutdoorCandidates } from '../utils/scoring';
import { getScoreBadgeClass, formatPollutantValue } from '../utils/formatting';
import { CandidateBreakdownModal } from './CandidateBreakdownModal';

interface ActivityPlannerProps {
  locations: LocationAirQualityState[];
}

export const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ locations }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>("walking");
  const [planningWindow, setPlanningWindow] = useState<6 | 12 | 24>(12);
  const [inspectedCandidate, setInspectedCandidate] = useState<RankedRecommendation | null>(null);

  // Extract valid future candidates & rank them transparently
  const recommendations = useMemo(() => {
    const candidates = extractCandidateSlots(locations, planningWindow);
    return rankOutdoorCandidates(candidates, selectedActivity);
  }, [locations, planningWindow, selectedActivity]);

  const topRecommendations = recommendations.slice(0, 5);

  const getActivityIcon = (id: ActivityId) => {
    switch (id) {
      case "walking": return <Footprints className="w-4 h-4" />;
      case "cycling": return <Bike className="w-4 h-4" />;
      case "jogging": return <Flame className="w-4 h-4" />;
      case "exercise": return <Dumbbell className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  const hasAnyLocation = locations.some(l => !l.error && l.hourlySlots.length > 0);

  return (
    <div className="space-y-6">
      {/* Configuration Controls Bar */}
      <div className="panel-card space-y-6 p-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Planner parameters setup</h2>
          <p className="text-xs text-slate-500 mt-1">
            Select your intended outdoor activity and look-ahead planning window. The engine ranks candidate hours across your selected locations using multi-pollutant relative scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Activity Selector */}
          <div>
            <label className="eyebrow mb-2 block">
              1. Choose Activity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {APP_CONFIG.activities.map(act => (
                <button
                  key={act.id}
                  onClick={() => setSelectedActivity(act.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    selectedActivity === act.id
                      ? "border-teal-500 bg-teal-50/70 text-teal-900 shadow-sm ring-1 ring-teal-500"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mb-2 ${selectedActivity === act.id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {getActivityIcon(act.id)}
                  </div>
                  <span className="text-xs font-bold leading-tight">{act.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{act.metabolicIntensity} intensity</span>
                </button>
              ))}
            </div>
          </div>

          {/* Window Selector */}
          <div>
            <label className="eyebrow mb-2 block">
              2. Planning Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {APP_CONFIG.windows.map(w => (
                <button
                  key={w}
                  onClick={() => setPlanningWindow(w)}
                  className={`py-3 px-4 rounded-xl border text-center transition-all ${
                    planningWindow === w
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 shadow-sm ring-1 ring-emerald-500 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <div className="text-sm">Next {w}h</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Forecast horizon</div>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Comparing candidate hours against the selected {locations.length} active location{locations.length > 1 ? "s" : ""}. Past hours are automatically excluded.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ranked Location & Time Windows ({topRecommendations.length} Options)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated using transparent Relative Pollution Scores (Lower = comparatively lower pollution).
            </p>
          </div>
        </div>

        {!hasAnyLocation ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-800">No Location Selected</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Add at least one location from the search bar to inspect forecasts and receive outdoor activity recommendations.
            </p>
          </div>
        ) : topRecommendations.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-amber-900">No Valid Candidate Windows Found</h4>
            <p className="text-xs text-amber-700 max-w-lg mx-auto mt-1">
              Available forecast data for your selected location(s) did not satisfy the minimum data requirements (valid PM2.5 + at least 2 other pollutants) in the next {planningWindow} hours.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {topRecommendations.map((rec) => {
              const badge = getScoreBadgeClass(rec.relativeScore);
              const isBest = rec.rank === 1;

              return (
                <div
                  key={`${rec.candidate.locationId}-${rec.candidate.isoTime}`}
                  className={`panel-card border-t-2 p-4 transition-all hover:shadow-md ${
                    isBest ? "border-emerald-400 ring-2 ring-emerald-500/20" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Location, Rank, and Timing */}
                    <div className="flex items-start space-x-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isBest ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "bg-slate-100 text-slate-700"
                      }`}>
                        #{rec.rank}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-slate-900">
                            {rec.candidate.locationName}
                          </h4>
                          {isBest && (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <Award className="w-3 h-3 mr-1" /> Top Choice
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="flex items-center font-medium text-slate-700">
                            <Clock className="w-3.5 h-3.5 mr-1 text-teal-600" />
                            {rec.candidate.formattedDate} at {rec.candidate.formattedTime}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>Timezone: {rec.candidate.timezone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Pollutant Concentrations */}
                    <div className="flex flex-wrap items-center gap-4 py-2 lg:py-0 border-y lg:border-none border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">PM2.5</span>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {formatPollutantValue(rec.candidate.pollutants.pm2_5)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">PM10</span>
                        <span className="text-sm font-mono font-medium text-slate-700">
                          {formatPollutantValue(rec.candidate.pollutants.pm10)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">NO₂</span>
                        <span className="text-sm font-mono font-medium text-slate-700">
                          {formatPollutantValue(rec.candidate.pollutants.nitrogen_dioxide)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">O₃</span>
                        <span className="text-sm font-mono font-medium text-slate-700">
                          {formatPollutantValue(rec.candidate.pollutants.ozone)}
                        </span>
                      </div>
                    </div>

                    {/* Score Badge and Inspect Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Relative Score</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {rec.relativeScore} / 100
                        </span>
                      </div>

                      <button
                        onClick={() => setInspectedCandidate(rec)}
                        className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <span>Inspect Data</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Explainable Text */}
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{rec.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inspect Forecast Breakdown Modal */}
      <CandidateBreakdownModal
        rec={inspectedCandidate}
        onClose={() => setInspectedCandidate(null)}
      />
    </div>
  );
};
