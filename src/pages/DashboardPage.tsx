import React from 'react';
import { Wind, MapPin, AlertCircle, RefreshCw, Layers, ArrowUpRight, Clock3, MapPinned } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { LocationAirQualityState, GeoLocationItem, AddLocationResult } from '../types';
import { LocationSearch } from '../components/LocationSearch';
import { PollutantCard } from '../components/PollutantCard';
import { ForecastChart } from '../components/ForecastChart';
import { AirQualityMap } from '../components/AirQualityMap';
import { extractCandidateSlots, rankOutdoorCandidates } from '../utils/scoring';
import { formatPollutantValue } from '../utils/formatting';
import { DefaultLocationModal } from '../components/DefaultLocationModal';

interface DashboardPageProps {
  locations: LocationAirQualityState[];
  onAddLocation: (loc: GeoLocationItem) => AddLocationResult | Promise<AddLocationResult>;
  onRefresh: () => void;
  onNavigateToPlanner: () => void;
  onNavigateToCompare: () => void;
  onChangeDefaultLocation: (loc: GeoLocationItem) => AddLocationResult | Promise<AddLocationResult>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  locations,
  onAddLocation,
  onRefresh,
  onNavigateToPlanner,
  onNavigateToCompare,
  onChangeDefaultLocation
}) => {
  const primary = locations[0];
  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [isSavingDefault, setIsSavingDefault] = React.useState(false);
  const [defaultLocationError, setDefaultLocationError] = React.useState<string | null>(null);
  const recommendations = rankOutdoorCandidates(extractCandidateSlots(locations, 12));
  const validForecastHours = locations.reduce((total, location) => total + location.hourlySlots.length, 0);

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-lg bg-[#faf8ff] p-2 text-slate-900 sm:p-3">
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full text-[9px] font-semibold uppercase tracking-wider text-emerald-800">
            <Wind className="w-3.5 h-3.5" />
            <span>Hyperlocal Environmental Intelligence</span>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {APP_CONFIG.tagline}
          </h1>

          <p className="max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {APP_CONFIG.subTagline}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToPlanner}
              className="rounded-md bg-emerald-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-800"
            >
              Launch Activity Planner
            </button>
            <button
              onClick={onNavigateToCompare}
              className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Compare Up To 3 Locations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location Search Bar */}
      <div className="panel-card p-5 sm:p-6">
        <div className="max-w-3xl">
          <label className="eyebrow mb-2 block">
            Search Location or Use Device GPS
          </label>
          <LocationSearch onSelectLocation={onAddLocation} />
        </div>

        {primary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="metric-card">
              <p className="eyebrow">PM2.5 now</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{formatPollutantValue(primary.currentSlot?.pm2_5, primary.hourlyUnits.pm2_5)}</p>
              <p className="mt-2 text-xs text-stone-500">Modelled concentration at {primary.location.name}</p>
            </div>
            <div className="metric-card">
              <p className="eyebrow">PM10 now</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{formatPollutantValue(primary.currentSlot?.pm10, primary.hourlyUnits.pm10)}</p>
              <p className="mt-2 text-xs text-stone-500">Updated for the current local forecast slot</p>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Forecast coverage</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-stone-900">{validForecastHours || "—"} <span className="text-base font-medium text-stone-500">hours</span></p>
              <p className="mt-2 flex items-center gap-1 text-xs text-stone-500"><Clock3 className="h-3.5 w-3.5" /> Across selected locations</p>
            </div>
            <div className="metric-card">
              <p className="eyebrow">Best next window</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900">{recommendations[0]?.relativeScore ?? "—"}<span className="text-base font-medium text-stone-500"> / 100</span></p>
              <p className="mt-2 text-xs text-stone-500">{recommendations[0] ? `${recommendations[0].candidate.locationName} · ${recommendations[0].candidate.formattedTime}` : "Insufficient valid forecast data"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Location Overview */}
      {primary && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Primary Location</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {primary.location.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-emerald-800">
                My Location: {primary.location.name}, {primary.location.admin1 || primary.location.country || "Selected area"}
              </p>
              <p className="text-xs text-slate-500">
                {[primary.location.admin1, primary.location.country].filter(Boolean).join(", ")} • Coordinates: {primary.location.latitude.toFixed(2)}°, {primary.location.longitude.toFixed(2)}° • Timezone: {primary.timezone}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setDefaultLocationError(null);
                  setIsLocationModalOpen(true);
                }}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
              >
                Change
              </button>
              <button
                onClick={onRefresh}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Refresh API</span>
              </button>
            </div>
          </div>

          {isLocationModalOpen && (
            <DefaultLocationModal
              currentLocation={primary.location}
              isSaving={isSavingDefault}
              errorMessage={defaultLocationError}
              onClose={() => {
                if (!isSavingDefault) setIsLocationModalOpen(false);
              }}
              onConfirm={async location => {
                setIsSavingDefault(true);
                setDefaultLocationError(null);
                const result = await onChangeDefaultLocation(location);
                setIsSavingDefault(false);
                if (typeof result === "string") {
                  setDefaultLocationError(result);
                  return;
                }
                setIsLocationModalOpen(false);
              }}
            />
          )}

          {/* Error Message if primary failed */}
          {primary.error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Failed to retrieve data for {primary.location.name}:</strong>
                <p className="text-xs mt-1">{primary.error}</p>
              </div>
            </div>
          )}

          {/* Pollutant Overview Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Current Modelled Concentrations
              </h3>
              <span className="text-xs text-slate-400">
                Observed slot: {primary.currentSlot ? primary.currentSlot.localTimeLabel : "Latest"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {APP_CONFIG.pollutants.map(p => (
                <PollutantCard
                  key={p.key}
                  pollutantKey={p.key}
                  label={p.label}
                  name={p.name}
                  currentValue={primary.currentSlot ? primary.currentSlot[p.key] : null}
                  previousValue={primary.previousSlot ? primary.previousSlot[p.key] : null}
                  unit={primary.hourlyUnits[p.key] || p.unit}
                  description={p.description}
                  timestamp={primary.currentSlot?.localTimeLabel || ""}
                />
              ))}
            </div>
          </div>

          {/* Forecast Chart */}
          <ForecastChart locations={locations} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.85fr]">
            <AirQualityMap locations={locations} />
            <section className="panel-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Quick comparison</p>
                  <h3 className="section-title">Selected locations</h3>
                </div>
                <MapPinned className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="mt-5 space-y-3">
                {locations.map(location => (
                  <div key={location.location.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-stone-800">{location.location.name}</span>
                      <span className="text-xs text-stone-500">{location.timezone}</span>
                    </div>
                    <p className="mt-2 text-xs text-stone-500">
                      PM2.5 {formatPollutantValue(location.currentSlot?.pm2_5, location.hourlyUnits.pm2_5)} · PM10 {formatPollutantValue(location.currentSlot?.pm10, location.hourlyUnits.pm10)}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={onNavigateToCompare} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-600">
                Open full comparison <ArrowUpRight className="h-4 w-4" />
              </button>
            </section>
          </div>

          <section className="panel-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Plan outdoors</p>
              <h3 className="section-title">Find a comparatively better time to step outside.</h3>
              <p className="mt-1 text-sm text-stone-500">{recommendations[0]?.explanation ?? "Add enough complete forecast data to generate a recommendation."}</p>
            </div>
            <button onClick={onNavigateToPlanner} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800">
              Open activity planner <ArrowUpRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      )}
    </div>
  );
};
