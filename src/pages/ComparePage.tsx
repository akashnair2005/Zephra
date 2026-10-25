import React from 'react';
import { Plus, X, Layers, AlertCircle, ArrowUpRight } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { LocationAirQualityState, GeoLocationItem, AddLocationResult } from '../types';
import { LocationSearch } from '../components/LocationSearch';
import { ForecastChart } from '../components/ForecastChart';
import { formatPollutantValue } from '../utils/formatting';

interface ComparePageProps {
  locations: LocationAirQualityState[];
  onAddLocation: (loc: GeoLocationItem) => AddLocationResult | Promise<AddLocationResult>;
  onRemoveLocation: (id: number) => void;
  onNavigateToPlanner: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  locations,
  onAddLocation,
  onRemoveLocation,
  onNavigateToPlanner
}) => {
  const canAddMore = locations.length < APP_CONFIG.maxLocations;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="panel-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Multi-Location Comparison</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Multi-Location Pollution Comparison
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Compare up to {APP_CONFIG.maxLocations} distinct cities or micro-regions to observe differing atmospheric dispersion patterns.
            </p>
          </div>

          <button
            onClick={onNavigateToPlanner}
            className="flex items-center self-start rounded-md bg-emerald-950 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-800 sm:self-auto"
          >
            <span>Run Activity Planner with these</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {canAddMore && (
          <div className="mt-6 pt-6 border-t border-slate-100 max-w-xl">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Add comparison location ({locations.length}/{APP_CONFIG.maxLocations}):
            </span>
            <LocationSearch onSelectLocation={onAddLocation} />
          </div>
        )}
      </div>

      {/* Comparison Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {locations.map((loc, idx) => (
          <div
            key={loc.location.id}
            className="panel-card flex flex-col justify-between border-t-2 border-t-emerald-500 p-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Location {idx + 1}
                </span>
                {locations.length > 1 && (
                  <button
                    onClick={() => onRemoveLocation(loc.location.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove location"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h3 className="mt-2 text-lg font-bold text-slate-900">{loc.location.name}</h3>
              <p className="text-xs text-slate-500">
                {[loc.location.admin1, loc.location.country].filter(Boolean).join(", ")}
              </p>

              {loc.error ? (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loc.error}</span>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Modelled Concentrations
                  </h4>
                  <div className="divide-y divide-slate-100 text-xs font-mono">
                    {APP_CONFIG.pollutants.map(p => (
                      <div key={p.key} className="py-2 flex justify-between items-center">
                        <span className="font-sans text-slate-600">{p.label} ({p.name.split(" ")[0]}):</span>
                        <span className="font-bold text-slate-900">
                          {formatPollutantValue(loc.currentSlot ? loc.currentSlot[p.key] : null, p.unit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Timezone: {loc.timezone}
            </div>
          </div>
        ))}

        {/* Empty Add Slot Placeholder */}
        {canAddMore && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <Plus className="w-8 h-8 text-slate-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">Add Another Location</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Add up to {APP_CONFIG.maxLocations} places to compare micro-climatic pollution variances.
            </p>
          </div>
        )}
      </div>

      {/* Synchronized Forecast Comparison Chart */}
      <ForecastChart locations={locations} />
    </div>
  );
};
