import React, { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import { LocationAirQualityState } from "../types";
import { formatPollutantValue } from "../utils/formatting";

interface AirQualityMapProps {
  locations: LocationAirQualityState[];
}

const markerColors = ["#0f766e", "#2563eb", "#d97706"];

const FitLocations: React.FC<{ locations: LocationAirQualityState[] }> = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = new LatLngBounds(
      locations.map(({ location }) => [location.latitude, location.longitude])
    );
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: locations.length === 1 ? 10 : 5 });
  }, [locations, map]);

  return null;
};

export const AirQualityMap: React.FC<AirQualityMapProps> = ({ locations }) => {
  const visibleLocations = locations.filter(
    location => Number.isFinite(location.location.latitude) && Number.isFinite(location.location.longitude)
  );
  const center = visibleLocations[0]?.location ?? { latitude: 20, longitude: 0 };

  return (
    <section className="panel-card overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-stone-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Selected locations</p>
          <h3 className="section-title">Air-quality forecast map</h3>
        </div>
        <p className="max-w-xs text-right text-xs leading-relaxed text-stone-500">
          Modelled forecast points, not street-level sensor readings.
        </p>
      </div>
      <div className="h-[300px] w-full sm:h-[360px]">
        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={visibleLocations.length > 1 ? 3 : 10}
          scrollWheelZoom
          className="h-full w-full"
          aria-label="Map of selected air-quality forecast locations"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitLocations locations={visibleLocations} />
          {visibleLocations.map((item, index) => {
            const current = item.currentSlot;
            return (
              <CircleMarker
                key={item.location.id}
                center={[item.location.latitude, item.location.longitude]}
                radius={9}
                pathOptions={{ color: markerColors[index % markerColors.length], fillColor: markerColors[index % markerColors.length], fillOpacity: 0.9, weight: 3 }}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-1 text-sm">
                    <strong className="text-stone-900">{item.location.name}</strong>
                    <p className="text-xs text-stone-500">{item.timezone}</p>
                    <p>PM2.5: {formatPollutantValue(current?.pm2_5, item.hourlyUnits.pm2_5)}</p>
                    <p>PM10: {formatPollutantValue(current?.pm10, item.hourlyUnits.pm10)}</p>
                    <p className="border-t border-stone-200 pt-1 text-xs text-stone-500">
                      {current ? `${current.dateLabel} at ${current.localTimeLabel}` : item.error ? "Forecast unavailable" : "Forecast loading"}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-stone-200 px-5 py-3 text-xs text-stone-500">
        {visibleLocations.map((location, index) => (
          <span key={location.location.id} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: markerColors[index % markerColors.length] }} />
            {location.location.name}
          </span>
        ))}
      </div>
    </section>
  );
};
