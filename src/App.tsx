import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { ComparePage } from './pages/ComparePage';
import { PlannerPage } from './pages/PlannerPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { fetchAirQualityData, transformApiResponse } from './services/openMeteoApi';
import { LocationAirQualityState, GeoLocationItem, AddLocationResult } from './types';
import { APP_CONFIG } from './config/appConfig';
import { moveLocationToPrimary, persistDefaultLocation, readStoredDefaultLocation } from './utils/defaultLocation';

// Default initial location: Bengaluru, India
const DEFAULT_LOCATIONS: GeoLocationItem[] = [
  {
    id: 1277333,
    name: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    country: "India",
    admin1: "Karnataka",
    timezone: "Asia/Kolkata"
  }
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [locations, setLocations] = useState<LocationAirQualityState[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Load air quality forecast for a given location item
  const loadLocationData = async (locItem: GeoLocationItem) => {
    try {
      const rawApi = await fetchAirQualityData(locItem.latitude, locItem.longitude, locItem.timezone);
      const transformed = transformApiResponse(locItem, rawApi);
      return transformed;
    } catch (err: any) {
      return {
        location: locItem,
        fetchedAt: new Date().toISOString(),
        timezone: locItem.timezone || "auto",
        utcOffsetSeconds: 0,
        hourlyUnits: {},
        hourlySlots: [],
        currentSlot: null,
        previousSlot: null,
        isLoading: false,
        error: err.message || "Failed to fetch air quality data from Open-Meteo."
      };
    }
  };

  // Initialize with default location
  useEffect(() => {
    async function init() {
      setIsInitialLoading(true);
      const savedDefault = readStoredDefaultLocation(window.localStorage);
      const initialLocations = savedDefault ? [savedDefault] : DEFAULT_LOCATIONS;
      const initialStates = await Promise.all(initialLocations.map(loadLocationData));
      setLocations(initialStates);
      setIsInitialLoading(false);
    }
    init();
  }, []);

  const handleAddLocation = async (locItem: GeoLocationItem): Promise<AddLocationResult> => {
    // Check if location already exists
    if (locations.some(l => l.location.id === locItem.id)) {
      return `${locItem.name} is already in your selected locations.`;
    }

    if (locations.length >= APP_CONFIG.maxLocations) {
      return `You can compare up to ${APP_CONFIG.maxLocations} locations. Remove one before adding another.`;
    }

    const state = await loadLocationData(locItem);
    setLocations(prev => [...prev, state]);
  };

  const handleRemoveLocation = (id: number) => {
    if (locations.length <= 1) return; // Keep at least one
    setLocations(prev => prev.filter(l => l.location.id !== id));
  };

  const handleSetPrimaryLocation = (id: number) => {
    setLocations(prev => {
      const primary = prev.find(location => location.location.id === id);
      if (!primary) return prev;
      return [primary, ...prev.filter(location => location.location.id !== id)];
    });
  };

  const handleChangeDefaultLocation = async (locItem: GeoLocationItem): Promise<AddLocationResult> => {
    const existing = locations.find(location => location.location.id === locItem.id);
    const nextState = existing || await loadLocationData(locItem);

    if (nextState.error || nextState.hourlySlots.length === 0) {
      return nextState.error || `No forecast data was returned for ${locItem.name}.`;
    }

    setLocations(prev => moveLocationToPrimary(prev, nextState, APP_CONFIG.maxLocations));
    persistDefaultLocation(locItem, window.localStorage);
  };

  const handleRefresh = async () => {
    const refreshed = await Promise.all(locations.map(l => loadLocationData(l.location)));
    setLocations(refreshed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-slate-900 antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        locationCount={locations.length}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-grow px-3 py-5 sm:px-5 lg:px-6">
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Connecting to Open-Meteo & Copernicus CAMS models...</p>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardPage
                locations={locations}
                onAddLocation={handleAddLocation}
                onRefresh={handleRefresh}
                onNavigateToPlanner={() => setActiveTab("planner")}
                onNavigateToCompare={() => setActiveTab("compare")}
                onChangeDefaultLocation={handleChangeDefaultLocation}
              />
            )}

            {activeTab === "compare" && (
              <ComparePage
                locations={locations}
                onAddLocation={handleAddLocation}
                onRemoveLocation={handleRemoveLocation}
                onSetPrimaryLocation={handleSetPrimaryLocation}
                onNavigateToPlanner={() => setActiveTab("planner")}
              />
            )}

            {activeTab === "planner" && (
              <PlannerPage locations={locations} />
            )}

            {activeTab === "methodology" && (
              <MethodologyPage />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
