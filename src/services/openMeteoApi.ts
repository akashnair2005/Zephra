import { APP_CONFIG } from "../config/appConfig";
import { GeoLocationItem, AirQualityApiResponse, HourlySlotData, LocationAirQualityState } from "../types";
import { getCurrentTimeKey, getTimeKey } from "../utils/time";

// In-memory cache to prevent duplicate fetches within 10 minutes
const cache = new Map<string, { data: AirQualityApiResponse; timestamp: number }>();

/**
 * Searches locations using Open-Meteo Geocoding API.
 */
export async function searchLocations(query: string, signal?: AbortSignal): Promise<GeoLocationItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(APP_CONFIG.endpoints.geocoding);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Geocoding server error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (!json.results || !Array.isArray(json.results)) {
    return [];
  }

  return json.results.map((r: any) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    elevation: r.elevation,
    country: r.country,
    country_code: r.country_code,
    admin1: r.admin1,
    timezone: r.timezone || "auto"
  }));
}

/**
 * Fetches real air quality forecast from Open-Meteo Air Quality API.
 */
export async function fetchAirQualityData(
  latitude: number,
  longitude: number,
  timezone: string = "auto",
  signal?: AbortSignal
): Promise<AirQualityApiResponse> {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)},${timezone}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < APP_CONFIG.cacheDurationMs) {
    return cached.data;
  }

  const url = new URL(APP_CONFIG.endpoints.airQuality);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set(
    "hourly",
    "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
  );
  url.searchParams.set("timezone", timezone || "auto");
  url.searchParams.set("forecast_days", "3");

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    let errorMsg = `Open-Meteo API returned HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.reason) errorMsg = errJson.reason;
    } catch {
      // fallback to status code
    }
    throw new Error(errorMsg);
  }

  const json: AirQualityApiResponse = await response.json();

  if (!json.hourly || !Array.isArray(json.hourly.time)) {
    throw new Error("Invalid API payload: missing hourly forecast array.");
  }

  cache.set(cacheKey, { data: json, timestamp: now });
  return json;
}

/**
 * Transforms raw API response into standardized, typed slot records.
 */
export function transformApiResponse(
  location: GeoLocationItem,
  apiResponse: AirQualityApiResponse
): LocationAirQualityState {
  const hourly = apiResponse.hourly;
  const timeArray = hourly.time || [];
  const count = timeArray.length;

  const hourlySlots: HourlySlotData[] = [];

  for (let i = 0; i < count; i++) {
    const rawTime = timeArray[i];
    // Parse as UTC only for formatting; the API timestamp is a local wall-clock
    // value, so applying the browser timezone would shift the displayed hour.
    const dateObj = new Date(`${rawTime}Z`);

    let localTimeLabel = rawTime.slice(11, 16);
    let dateLabel = rawTime.slice(0, 10);
    const hourNumber = Number(rawTime.slice(11, 13));

    try {
      localTimeLabel = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
      });
      dateLabel = dateObj.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      });
    } catch {
      // Keep the raw local values if Intl formatting is unavailable.
    }

    const sanitize = (val: any): number | null => {
      if (val === null || val === undefined || isNaN(val)) return null;
      return typeof val === "number" ? val : parseFloat(val);
    };

    hourlySlots.push({
      isoTime: rawTime,
      localTimeLabel,
      hourNumber,
      dateLabel,
      pm2_5: sanitize(hourly.pm2_5?.[i]),
      pm10: sanitize(hourly.pm10?.[i]),
      nitrogen_dioxide: sanitize(hourly.nitrogen_dioxide?.[i]),
      ozone: sanitize(hourly.ozone?.[i]),
      sulphur_dioxide: sanitize(hourly.sulphur_dioxide?.[i]),
      carbon_monoxide: sanitize(hourly.carbon_monoxide?.[i])
    });
  }

  // Determine the current slot in the API's local timezone.
  const currentTimeKey = getCurrentTimeKey(apiResponse.timezone);
  let currentIndex = hourlySlots.findIndex(
    slot => getTimeKey(slot.isoTime) >= currentTimeKey
  );
  if (currentIndex === -1) currentIndex = 0;

  const currentSlot = hourlySlots[currentIndex] || hourlySlots[0] || null;
  const previousSlot = currentIndex > 0 ? hourlySlots[currentIndex - 1] : null;

  return {
    location,
    fetchedAt: new Date().toISOString(),
    timezone: apiResponse.timezone,
    utcOffsetSeconds: apiResponse.utc_offset_seconds,
    hourlyUnits: apiResponse.hourly_units || {},
    hourlySlots,
    currentSlot,
    previousSlot,
    isLoading: false,
    error: null
  };
}
