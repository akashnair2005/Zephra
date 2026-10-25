import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { searchLocations } from '../services/openMeteoApi';
import { getDeviceCoordinates } from '../services/geolocation';
import { AddLocationResult, GeoLocationItem } from '../types';

interface LocationSearchProps {
  onSelectLocation: (loc: GeoLocationItem) => AddLocationResult | Promise<AddLocationResult>;
  placeholder?: string;
  disabled?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  placeholder = "Search city or locality (e.g. London, Delhi, Tokyo, New York)...",
  disabled = false
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced geocoding search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        const matches = await searchLocations(query, controller.signal);
        setResults(matches);
        setIsOpen(true);
        if (matches.length === 0) {
          setErrorMessage(`No matching locations found for "${query}". Try another city name.`);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMessage(err.message || "Failed to search location. Check network connection.");
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (item: GeoLocationItem) => {
    const result = await onSelectLocation(item);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setErrorMessage(typeof result === "string" ? result : null);
  };

  const handleDeviceLocation = async () => {
    setIsGeoLoading(true);
    setErrorMessage(null);
    try {
      const coords = await getDeviceCoordinates();
      // Reverse query representation or coordinate fallback
      const deviceLocation: GeoLocationItem = {
        id: Math.round(coords.latitude * 10000 + coords.longitude * 10000),
        name: "My Device Location",
        latitude: parseFloat(coords.latitude.toFixed(4)),
        longitude: parseFloat(coords.longitude.toFixed(4)),
        country: "Local Device",
        admin1: `GPS (${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°)`,
        timezone: "auto"
      };
      handleSelect(deviceLocation);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not retrieve device location.");
    } finally {
      setIsGeoLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[focusedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> : <Search className="w-4 h-4" />}
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm disabled:opacity-50"
            placeholder={placeholder}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        <button
          type="button"
          onClick={handleDeviceLocation}
          disabled={disabled || isGeoLoading}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isGeoLoading ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-teal-600" />
          ) : (
            <Navigation className="w-4 h-4 mr-1.5 text-teal-600" />
          )}
          <span>Use my location</span>
        </button>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Suggestion Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          <div className="p-1.5">
            {results.map((loc, idx) => (
              <button
                key={`${loc.id}-${idx}`}
                onClick={() => handleSelect(loc)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  idx === focusedIndex ? "bg-teal-50 text-teal-900" : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium truncate">{loc.name}</span>
                  <span className="text-xs text-slate-400 truncate">
                    {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400 ml-2 shrink-0">
                  {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
