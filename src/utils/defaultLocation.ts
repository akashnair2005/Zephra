import { GeoLocationItem, LocationAirQualityState } from "../types";

export const DEFAULT_LOCATION_STORAGE_KEY = "zephra-default-location";

function isGeoLocationItem(value: unknown): value is GeoLocationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GeoLocationItem>;
  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude)
  );
}

export function readStoredDefaultLocation(
  storage?: Pick<Storage, "getItem">
): GeoLocationItem | null {
  if (!storage) return null;

  try {
    const raw = storage.getItem(DEFAULT_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGeoLocationItem(parsed) ? parsed : null;
  } catch (error) {
    console.warn("Unable to restore the saved Zephra default location.", error);
    return null;
  }
}

export function persistDefaultLocation(
  location: GeoLocationItem,
  storage?: Pick<Storage, "setItem">
): boolean {
  if (!storage) return false;

  try {
    storage.setItem(DEFAULT_LOCATION_STORAGE_KEY, JSON.stringify(location));
    return true;
  } catch (error) {
    console.error("Unable to save the Zephra default location.", error);
    return false;
  }
}

export function moveLocationToPrimary(
  locations: LocationAirQualityState[],
  nextLocation: LocationAirQualityState,
  maxLocations: number
): LocationAirQualityState[] {
  if (!locations.some(item => item.location.id === nextLocation.location.id) && locations.length >= maxLocations) {
    return [nextLocation, ...locations.slice(1)].slice(0, maxLocations);
  }

  const withoutNext = locations.filter(item => item.location.id !== nextLocation.location.id);
  return [nextLocation, ...withoutNext].slice(0, maxLocations);
}
