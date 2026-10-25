import React from 'react';
import { BookOpen, Scale, Clock, Database, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="rounded-lg bg-[#faf8ff] p-1">
        <div className="inline-flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Scientific Methodology & Algorithmic Transparency</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Scientific Methodology & Open Data Architecture
        </h1>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          We believe in 100% transparency. This page explains our data sources, mathematical formulation of the Relative Pollution Score, limitations of atmospheric forecast models, and attribution.
        </p>
      </div>

      {/* Section 1: Data Sources */}
      <div className="panel-card space-y-4 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Database className="w-5 h-5 mr-2 text-teal-600" />
          1. Data Provenance & Atmospheric Models
        </h2>
        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            Forecast data is provided through the <strong>Open-Meteo Air Quality API</strong>, derived from atmospheric composition simulations produced by the <strong>Copernicus Atmosphere Monitoring Service (CAMS) ENSEMBLE</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Regional Model Resolution:</strong> CAMS ENSEMBLE models atmospheric chemistry at approximately 0.1° resolution (~11 km grid cells over Europe) and 0.4° resolution (~45 km grid cells globally).
            </li>
            <li>
              <strong>Modelled vs. Direct Physical Sensors:</strong> The values displayed are numerical atmospheric model forecasts combining meteorological data, satellite data assimilation, and emission inventories. They do <em>not</em> represent individual physical ground monitors on every street corner.
            </li>
            <li>
              <strong>Geocoding:</strong> Place and boundary searches use the Open-Meteo Geocoding API, grounded in the GeoNames geographical database.
            </li>
          </ul>
        </div>
      </div>

      {/* Section 2: Transparent Recommendation Algorithm */}
      <div className="panel-card space-y-4 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Scale className="w-5 h-5 mr-2 text-teal-600" />
          2. The Relative Pollution Score (0–100)
        </h2>
        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            Different pollutants have vastly differing concentration distributions and measurement scales (e.g., PM2.5 in tens of µg/m³ vs. CO in hundreds of µg/m³). Simply adding concentrations together is scientifically invalid.
          </p>
          <p>
            Our engine uses a multi-pollutant relative ranking framework across all candidate slots in the user's active evaluation set:
          </p>
          
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
            <p>1. Relative Pollutant Rank: R_p(k) = (C_p(k) - Min_p) / (Max_p - Min_p)</p>
            <p>2. Effective Composite Score: Score(k) = [ Σ (w_p * R_p(k)) / Σ w_p ] * 100</p>
            <p>3. Where: Lower score indicates comparatively cleaner conditions.</p>
          </div>

          <h3 className="font-semibold text-slate-800 text-sm pt-2">Configurable Pollutant Weights:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
            {APP_CONFIG.pollutants.map(p => (
              <div key={p.key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">{p.label}:</span> {(p.weight * 100).toFixed(1)}% base
              </div>
            ))}
          </div>

          <h3 className="font-semibold text-slate-800 text-sm pt-2">Handling Missing Data:</h3>
          <p>
            Missing pollutant values are <strong>never treated as zero</strong>. Doing so would artificially depress pollution numbers. Candidates must strictly meet the minimum requirement: valid PM2.5 concentration plus at least two other verified pollutants. If this is not met, the candidate slot is rejected.
          </p>
        </div>
      </div>

      {/* Section 3: Timezone & Forecast Correctness */}
      <div className="panel-card space-y-4 p-5 sm:p-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-teal-600" />
          3. Time Horizon & Forecast Correctness
        </h2>
        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            All timestamps respect the exact <code>timezone</code> metadata returned by Open-Meteo for each coordinate. Past hours are strictly excluded from the activity planning look-ahead windows (6, 12, or 24 hours).
          </p>
        </div>
      </div>

      {/* Section 4: Responsible Health Disclaimer */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 text-amber-950 space-y-2">
        <h3 className="font-bold text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
          Ethical & Health Notice
        </h3>
        <p className="text-xs leading-relaxed text-amber-900">
          The Relative Pollution Score is a comparative decision-support heuristic, not an official national AQI (such as the US EPA AQI or India's CPCB National Air Quality Index). It does not provide medical risk diagnosis. Individuals with respiratory conditions should follow local public health directives.
        </p>
      </div>
    </div>
  );
};
