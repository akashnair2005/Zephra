import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { PollutantKey } from '../config/appConfig';
import { computeTrend } from '../utils/formatting';

interface PollutantCardProps {
  pollutantKey: PollutantKey;
  label: string;
  name: string;
  currentValue: number | null;
  previousValue: number | null;
  unit: string;
  description: string;
  timestamp: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  label,
  name,
  currentValue,
  previousValue,
  unit,
  description,
  timestamp
}) => {
  const isAvailable = currentValue !== null && !isNaN(currentValue);
  const trend = computeTrend(currentValue, previousValue);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block text-xs font-bold font-mono tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {label}
            </span>
            <h4 className="text-sm font-semibold text-slate-800 mt-1">{name}</h4>
          </div>
          <div className="text-right">
            {isAvailable && trend.direction !== "unknown" && (
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                  trend.direction === "up"
                    ? "bg-rose-50 text-rose-700"
                    : trend.direction === "down"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {trend.direction === "up" && <TrendingUp className="w-3 h-3 mr-1" />}
                {trend.direction === "down" && <TrendingDown className="w-3 h-3 mr-1" />}
                {trend.direction === "flat" && <Minus className="w-3 h-3 mr-1" />}
                {trend.diffText}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 mb-2">
          {isAvailable ? (
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {currentValue.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-500">{unit}</span>
            </div>
          ) : (
            <div className="py-2">
              <span className="text-sm font-medium text-slate-400 italic">
                Data unavailable for this grid cell
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="flex items-center">
          <Info className="w-3 h-3 mr-1 text-slate-400" />
          Modelled CAMS
        </span>
        <span>{timestamp ? timestamp : "Latest model run"}</span>
      </div>
    </div>
  );
};
