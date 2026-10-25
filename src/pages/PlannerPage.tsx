import React from 'react';
import { ActivityPlanner } from '../components/ActivityPlanner';
import { LocationAirQualityState } from '../types';

interface PlannerPageProps {
  locations: LocationAirQualityState[];
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ locations }) => {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-[#faf8ff] px-1 py-3">
        <p className="eyebrow">Zephra core engine · Atmospheric dispersion optimization</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Find Your Optimal Outdoor Window
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          The core USP of this platform: rather than simply checking a single static number, discover 
          comparatively lower-exposure windows across locations for your walking, running, or cycling sessions.
        </p>
      </div>

      <ActivityPlanner locations={locations} />
    </div>
  );
};
