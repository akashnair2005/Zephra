import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { APP_CONFIG, PollutantKey } from '../config/appConfig';
import { LocationAirQualityState } from '../types';
import { getPollutantLabel, getPollutantUnit } from '../utils/formatting';

interface ForecastChartProps {
  locations: LocationAirQualityState[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ locations }) => {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantKey>("pm2_5");

  const validLocations = locations.filter(l => !l.error && !l.isLoading && l.hourlySlots.length > 0);

  if (validLocations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No forecast data to display. Please add a valid location above.
      </div>
    );
  }

  // Build aligned timeline based on primary location (up to 48 hours)
  const primaryLoc = validLocations[0];
  const chartLength = Math.min(primaryLoc.hourlySlots.length, 48);

  const getInstantKey = (isoTime: string, utcOffsetSeconds: number) => {
    const normalizedTime = isoTime.length === 16 ? `${isoTime}:00` : isoTime;
    const localAsUtc = new Date(`${normalizedTime}Z`).getTime();
    return new Date(localAsUtc - utcOffsetSeconds * 1000).toISOString();
  };

  const chartData = primaryLoc.hourlySlots.slice(0, chartLength).map((slot) => {
    const instantKey = getInstantKey(slot.isoTime, primaryLoc.utcOffsetSeconds);
    const entry: Record<string, any> = {
      time: slot.localTimeLabel,
      date: slot.dateLabel,
      fullTime: slot.isoTime,
      instantKey
    };

    validLocations.forEach(loc => {
      const correspondingSlot = loc.hourlySlots.find(
        candidate => getInstantKey(candidate.isoTime, loc.utcOffsetSeconds) === instantKey
      );
      if (correspondingSlot) {
        const val = correspondingSlot[selectedPollutant];
        // Do NOT replace null with 0; Recharts handles null/undefined as breaks in line
        entry[`loc_${loc.location.id}`] = val !== null && !isNaN(val) ? parseFloat(val.toFixed(1)) : null;
      }
    });

    return entry;
  });

  const colors = ["#0d9488", "#3b82f6", "#f59e0b"];

  const currentUnit = getPollutantUnit(selectedPollutant, primaryLoc.hourlyUnits);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Hourly Pollutant Forecast Trends</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modelled hourly concentrations over the next 48 hours. Gaps indicate missing grid parameters.
          </p>
        </div>

        {/* Pollutant Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
          {APP_CONFIG.pollutants.map(p => (
            <button
              key={p.key}
              onClick={() => setSelectedPollutant(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPollutant === p.key
                  ? "bg-white text-teal-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              interval={3}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit={` ${currentUnit}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 space-y-1.5">
                      <div className="font-semibold text-teal-300 pb-1 border-b border-slate-800">
                        {item.date} — {label}
                      </div>
                      {payload.map((p: any) => {
                        const locName = p.name;
                        const val = p.value !== null && p.value !== undefined ? `${p.value} ${currentUnit}` : "No data";
                        return (
                          <div key={p.dataKey} className="flex items-center justify-between gap-4">
                            <span className="flex items-center">
                              <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
                              {locName}:
                            </span>
                            <span className="font-mono font-medium">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingBottom: "12px" }}
            />
            {validLocations.map((loc, idx) => (
              <Line
                key={loc.location.id}
                type="monotone"
                name={loc.location.name}
                dataKey={`loc_${loc.location.id}`}
                stroke={colors[idx % colors.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                connectNulls={false} // Never invent lines over missing data gaps!
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span>Variable: {getPollutantLabel(selectedPollutant)} ({currentUnit})</span>
        <span>Resolution: Hourly grid interpolation (CAMS ENSEMBLE)</span>
      </div>
    </div>
  );
};
