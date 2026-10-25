import React from 'react';
import { X, ShieldCheck, BarChart2 } from 'lucide-react';
import { RankedRecommendation } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { formatPollutantValue, getScoreBadgeClass } from '../utils/formatting';

interface CandidateBreakdownModalProps {
  rec: RankedRecommendation | null;
  onClose: () => void;
}

export const CandidateBreakdownModal: React.FC<CandidateBreakdownModalProps> = ({ rec, onClose }) => {
  if (!rec) return null;

  const badge = getScoreBadgeClass(rec.relativeScore);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-teal-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                Rank #{rec.rank}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {rec.candidate.isoTime}
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1 text-white">
              {rec.candidate.locationName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {rec.candidate.formattedDate} at {rec.candidate.formattedTime} ({rec.candidate.timezone})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Score Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Composite Metric
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {rec.relativeScore}
                </span>
                <span className="text-sm text-slate-500 font-mono">/ 100</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 sm:text-right max-w-xs">
              <p>Effective Pollutant Weight: <strong>{rec.totalEffectiveWeight.toFixed(2)}</strong></p>
              <p>Data Completeness: <strong>{rec.dataCompletenessPercentage}%</strong></p>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-teal-600" />
              Explainable Decision Basis
            </h4>
            <p className="text-sm text-teal-950 leading-relaxed">
              {rec.explanation}
            </p>
          </div>

          {/* Underlying Pollutant Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
              <BarChart2 className="w-4 h-4 mr-1 text-slate-500" />
              Evaluated Pollutants & Relative Position
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-left">Pollutant</th>
                    <th className="px-3 py-2 text-right">Forecast Value</th>
                    <th className="px-3 py-2 text-right">Relative Percentile</th>
                    <th className="px-3 py-2 text-right">Applied Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {APP_CONFIG.pollutants.map(p => {
                    const val = rec.candidate.pollutants[p.key];
                    const normRank = rec.normalizedPollutantRanks[p.key];
                    const weight = rec.usedWeights[p.key];
                    return (
                      <tr key={p.key} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-sans font-medium text-slate-900">
                          {p.label} <span className="text-slate-400 font-normal">({p.name})</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-800">
                          {formatPollutantValue(val, p.unit)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {normRank !== null ? (
                            <span className={`px-2 py-0.5 rounded ${normRank <= 0.3 ? "bg-emerald-100 text-emerald-800" : normRank >= 0.7 ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"}`}>
                              {(normRank * 100).toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Excluded</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-600">
                          {weight > 0 ? weight.toFixed(3) : "0.00"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
