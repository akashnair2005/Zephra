import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-emerald-950 bg-emerald-950 py-12 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-lg mb-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>{APP_CONFIG.name} Environmental Intelligence</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {APP_CONFIG.usp}
            </p>
            <p className="text-xs text-slate-500">
              Modelled spatial forecast data is approximate and intended for comparative outdoor planning. Not an official municipal regulatory instrument or medical diagnostic tool.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Data Sources & Acknowledgements
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p>
                <strong>Air Quality Forecaster: </strong>
                {APP_CONFIG.attribution.cams}{' '}
                <a
                  href={APP_CONFIG.attribution.camsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  Copernicus CAMS <ExternalLink className="w-3 h-3" />
                </a>{' '}
                via{' '}
                <a
                  href={APP_CONFIG.attribution.openMeteoAirQualityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  Open-Meteo Air Quality API <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
              <p>
                <strong>Geocoding & Place Resolution: </strong>
                {APP_CONFIG.attribution.geocoding}{' '}
                <a
                  href={APP_CONFIG.attribution.geocodingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  Open-Meteo Geocoding <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
              <p>
                <strong>Licensing: </strong>
                Data distributed under{' '}
                <a
                  href={APP_CONFIG.attribution.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {APP_CONFIG.attribution.license} <ExternalLink className="w-3 h-3" />
                </a>. Relative Pollution Scores are project-generated analytical calculations.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} {APP_CONFIG.name}. Open Science & Urban Innovation.</span>
          <span className="mt-2 sm:mt-0 font-mono">Version {APP_CONFIG.version}</span>
        </div>
      </div>
    </footer>
  );
};
