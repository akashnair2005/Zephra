import React, { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Award, Bike, Clock, Compass, Dumbbell, Flame, Footprints, Info } from "lucide-react";
import { APP_CONFIG, ActivityId } from "../config/appConfig";
import { LocationAirQualityState, PlannerMode, RankedRecommendation } from "../types";
import { extractCandidateSlots, getPlannerLocations, groupRankedRecommendations, rankOutdoorCandidates } from "../utils/scoring";
import { formatPollutantValue, getScoreBadgeClass } from "../utils/formatting";
import { CandidateBreakdownModal } from "./CandidateBreakdownModal";

interface ActivityPlannerProps {
  locations: LocationAirQualityState[];
}

export const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ locations }) => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityId>("walking");
  const [planningWindow, setPlanningWindow] = useState<6 | 12 | 24>(12);
  const [plannerMode, setPlannerMode] = useState<PlannerMode>("primary");
  const [inspectedCandidate, setInspectedCandidate] = useState<RankedRecommendation | null>(null);
  const primaryLocation = locations[0];

  const recommendations = useMemo(() => {
    const candidates = extractCandidateSlots(getPlannerLocations(locations, plannerMode), planningWindow);
    return rankOutdoorCandidates(candidates, selectedActivity);
  }, [locations, plannerMode, planningWindow, selectedActivity]);

  const topRecommendations = recommendations.slice(0, 5);
  const recommendationGroups = useMemo(
    () => groupRankedRecommendations(recommendations).map(group => ({
      ...group,
      recommendations: group.recommendations.slice(0, 5)
    })),
    [recommendations]
  );
  const hasAnyLocation = locations.some(location => !location.error && location.hourlySlots.length > 0);

  const getActivityIcon = (id: ActivityId) => {
    switch (id) {
      case "walking": return <Footprints className="h-4 w-4" />;
      case "cycling": return <Bike className="h-4 w-4" />;
      case "jogging": return <Flame className="h-4 w-4" />;
      case "exercise": return <Dumbbell className="h-4 w-4" />;
      default: return <Compass className="h-4 w-4" />;
    }
  };

  const renderRecommendation = (rec: RankedRecommendation) => {
    const badge = getScoreBadgeClass(rec.relativeScore);
    const isBest = rec === recommendations[0];
    return (
      <article key={`${rec.candidate.locationId}-${rec.candidate.isoTime}`} className={`panel-card border-t-2 p-4 ${isBest ? "border-emerald-400 ring-2 ring-emerald-500/20" : "border-slate-200"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${isBest ? "bg-emerald-900 text-white" : "bg-slate-100 text-slate-700"}`}>#{rec.rank}</span>
              <h4 className="text-sm font-bold text-slate-900">{rec.candidate.locationName}</h4>
            </div>
            <p className="mt-2 flex items-center text-xs text-slate-500"><Clock className="mr-1 h-3.5 w-3.5 text-teal-600" />{rec.candidate.formattedDate} at {rec.candidate.formattedTime}</p>
          </div>
          {isBest && <Award className="h-5 w-5 text-emerald-700" />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-indigo-50 p-3 text-center">
          <span><small className="block text-[9px] uppercase text-slate-500">PM2.5</small><strong className="text-sm">{formatPollutantValue(rec.candidate.pollutants.pm2_5)}</strong></span>
          <span><small className="block text-[9px] uppercase text-slate-500">PM10</small><strong className="text-sm">{formatPollutantValue(rec.candidate.pollutants.pm10)}</strong></span>
          <span><small className="block text-[9px] uppercase text-slate-500">NO₂</small><strong className="text-sm">{formatPollutantValue(rec.candidate.pollutants.nitrogen_dioxide)}</strong></span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${badge.bg} ${badge.text} ${badge.border}`}>{rec.relativeScore} / 100</span>
          <button type="button" onClick={() => setInspectedCandidate(rec)} className="inline-flex items-center rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
            Inspect Data <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-600">{rec.explanation}</p>
      </article>
    );
  };

  return (
    <div className="space-y-5">
      <section className="panel-card space-y-5 p-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Planner parameters setup</h2>
          <p className="mt-1 text-xs text-slate-500">Choose an activity, forecast window, and location scope. Scores remain project-defined relative comparisons.</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Planning location</p>
              <p className="mt-1 text-sm font-bold text-emerald-950">{primaryLocation ? `${primaryLocation.location.name}${primaryLocation.location.admin1 ? `, ${primaryLocation.location.admin1}` : ""}` : "No location selected"}</p>
              <p className="mt-1 text-xs text-emerald-900/70">{plannerMode === "primary" ? "Recommendations use this primary location only." : "Recommendations compare the locations currently selected in Zephra."}</p>
            </div>
            <div className="flex rounded-md border border-emerald-200 bg-white p-1" role="group" aria-label="Planner location scope">
              <button type="button" onClick={() => setPlannerMode("primary")} className={`rounded px-3 py-2 text-xs font-bold ${plannerMode === "primary" ? "bg-emerald-950 text-white" : "text-emerald-900 hover:bg-emerald-50"}`}>My Location</button>
              <button type="button" onClick={() => setPlannerMode("compare")} disabled={locations.length < 2} className={`rounded px-3 py-2 text-xs font-bold ${plannerMode === "compare" ? "bg-emerald-950 text-white" : "text-emerald-900 hover:bg-emerald-50"} disabled:cursor-not-allowed disabled:opacity-50`}>Compare Selected Locations</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-4 md:grid-cols-2">
          <div>
            <label className="eyebrow mb-2 block">1. Choose Activity</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {APP_CONFIG.activities.map(activity => (
                <button key={activity.id} type="button" onClick={() => setSelectedActivity(activity.id)} className={`flex flex-col items-start rounded-xl border p-3 text-left ${selectedActivity === activity.id ? "border-teal-500 bg-teal-50 text-teal-900 ring-1 ring-teal-500" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  <span className="mb-2 rounded-lg bg-slate-100 p-1.5">{getActivityIcon(activity.id)}</span>
                  <span className="text-xs font-bold">{activity.label}</span>
                  <span className="mt-1 text-[10px] text-slate-500">{activity.metabolicIntensity} intensity</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="eyebrow mb-2 block">2. Planning Window</label>
            <div className="grid grid-cols-3 gap-2">
              {APP_CONFIG.windows.map(windowHours => (
                <button key={windowHours} type="button" onClick={() => setPlanningWindow(windowHours)} className={`rounded-xl border px-3 py-3 text-center ${planningWindow === windowHours ? "border-emerald-500 bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-500" : "border-slate-200 bg-white text-slate-700"}`}>
                  <div className="text-sm">Next {windowHours}h</div><div className="mt-0.5 text-[10px] text-slate-500">Forecast horizon</div>
                </button>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><Info className="h-4 w-4 shrink-0 text-teal-600" />{plannerMode === "primary" ? `Evaluating ${primaryLocation?.location.name || "your primary location"} only.` : `Comparing ${locations.length} selected locations.`} Past hours are excluded.</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">{plannerMode === "primary" ? `Best available times in ${primaryLocation?.location.name || "your location"}` : "Best available times across selected locations"} ({topRecommendations.length} options)</h3>
          <p className="text-xs text-slate-500">Lower Relative Pollution Score means comparatively lower pollution within the selected candidate set.</p>
        </div>
        {!hasAnyLocation ? (
          <div className="panel-card p-10 text-center"><Compass className="mx-auto mb-3 h-10 w-10 text-slate-300" /><h4 className="font-semibold text-slate-800">No Location Selected</h4><p className="mt-1 text-xs text-slate-500">Search for a location or use device location before planning.</p></div>
        ) : topRecommendations.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"><AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-600" /><h4 className="text-sm font-bold text-amber-900">No Valid Candidate Windows Found</h4><p className="mx-auto mt-1 max-w-lg text-xs text-amber-700">This location does not have enough valid PM2.5 plus two other pollutant readings in the next {planningWindow} hours.</p></div>
        ) : plannerMode === "compare" ? (
          <div className="space-y-5">{recommendationGroups.map(group => <section key={group.locationId} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"><div className="mb-3 flex items-center justify-between gap-3"><h4 className="text-sm font-bold text-slate-900">{group.locationName} — best forecast time slots</h4>{group.recommendations.includes(recommendations[0]) && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">Overall leading option</span>}</div><div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{group.recommendations.slice(0, 3).map(renderRecommendation)}</div></section>)}</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{topRecommendations.map(renderRecommendation)}</div>
        )}
      </section>
      <CandidateBreakdownModal rec={inspectedCandidate} onClose={() => setInspectedCandidate(null)} />
    </div>
  );
};
