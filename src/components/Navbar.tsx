import React from 'react';
import { Wind, Calendar, HelpCircle, Layers, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  locationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, locationCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/20 bg-[#faf8ff]/95 backdrop-blur">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-5">
        <div className="flex min-h-[52px] items-center justify-between gap-3">
          {/* Logo & Configurable Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate('dashboard')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-950 text-white">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900">{APP_CONFIG.name}</span>
              <span className="ml-1 hidden rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-800 sm:inline-block">
                Urban Air Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <button className="rounded-lg p-2 text-stone-700 sm:hidden" onClick={() => setIsMenuOpen(open => !open)} aria-label="Toggle navigation menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className={`${isMenuOpen ? "absolute left-3 right-3 top-14 flex flex-col rounded-lg border border-slate-200 bg-white p-2 shadow-xl sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none" : "hidden sm:flex"} gap-1`}>
            <button
              onClick={() => navigate('dashboard')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Wind className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => navigate('compare')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-2 text-[11px] font-semibold transition-colors relative ${
                activeTab === 'compare'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Compare</span>
              {locationCount > 0 && (
                <span className="ml-1 bg-slate-200 text-slate-700 text-xs px-1.5 py-0.2 rounded-full font-mono">
                  {locationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('planner')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                activeTab === 'planner'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">Activity Planner</span>
            </button>

            <button
              onClick={() => navigate('methodology')}
              className={`flex items-center space-x-1.5 rounded-md px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                activeTab === 'methodology'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:inline">Methodology</span>
            </button>
          </nav>
        </div>
      </div>
      <div className="hidden h-6 items-center justify-between bg-emerald-950 px-4 text-[9px] font-medium text-emerald-50 sm:flex">
        <span>↗ {APP_CONFIG.usp}</span>
        <span className="text-emerald-200">● Live hyperlocal ingestion active</span>
      </div>
    </header>
  );
};
