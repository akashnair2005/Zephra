import React, { useState } from "react";
import { Check, MapPin, X } from "lucide-react";
import { GeoLocationItem } from "../types";
import { LocationSearch } from "./LocationSearch";

interface DefaultLocationModalProps {
  currentLocation: GeoLocationItem;
  isSaving: boolean;
  errorMessage: string | null;
  onConfirm: (location: GeoLocationItem) => void;
  onClose: () => void;
}

export const DefaultLocationModal: React.FC<DefaultLocationModalProps> = ({
  currentLocation,
  isSaving,
  errorMessage,
  onConfirm,
  onClose
}) => {
  const [selectedLocation, setSelectedLocation] = useState<GeoLocationItem>(currentLocation);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="default-location-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Default planning location</p>
            <h2 id="default-location-title" className="mt-1 text-xl font-bold text-slate-900">Change My Location</h2>
            <p className="mt-1 text-xs text-slate-500">Search for a place or use your device location. Forecast data is loaded before the change is confirmed.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} aria-label="Cancel changing location" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <LocationSearch
            onSelectLocation={location => {
              setSelectedLocation(location);
            }}
            disabled={isSaving}
            placeholder="Search for your default city or location..."
          />
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="eyebrow">Selected location</p>
          <div className="mt-2 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-bold text-emerald-950">{selectedLocation.name}</p>
              <p className="text-xs text-emerald-900/70">{[selectedLocation.admin1, selectedLocation.country].filter(Boolean).join(", ") || "Coordinates selected"}</p>
              <p className="mt-1 font-mono text-[10px] text-emerald-900/60">{selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}° · {selectedLocation.timezone || "auto"}</p>
            </div>
          </div>
        </div>

        {errorMessage && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{errorMessage}</p>}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
          <button type="button" onClick={() => onConfirm(selectedLocation)} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {isSaving ? "Loading forecast..." : <><Check className="h-4 w-4" /> Confirm default location</>}
          </button>
        </div>
      </section>
    </div>
  );
};
