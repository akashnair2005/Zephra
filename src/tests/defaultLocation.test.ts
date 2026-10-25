import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCATION_STORAGE_KEY,
  moveLocationToPrimary,
  persistDefaultLocation,
  readStoredDefaultLocation
} from "../utils/defaultLocation";
import { GeoLocationItem, LocationAirQualityState } from "../types";

const bengaluru: GeoLocationItem = {
  id: 1, name: "Bengaluru", latitude: 12.97, longitude: 77.59, country: "India", admin1: "Karnataka"
};
const chennai: GeoLocationItem = {
  id: 2, name: "Chennai", latitude: 13.08, longitude: 80.27, country: "India", admin1: "Tamil Nadu"
};
const mysuru: GeoLocationItem = {
  id: 3, name: "Mysuru", latitude: 12.29, longitude: 76.64, country: "India", admin1: "Karnataka"
};
const delhi: GeoLocationItem = {
  id: 4, name: "Delhi", latitude: 28.61, longitude: 77.21, country: "India"
};

function state(location: GeoLocationItem): LocationAirQualityState {
  return {
    location,
    fetchedAt: "2025-01-01T00:00:00.000Z",
    timezone: "Asia/Kolkata",
    utcOffsetSeconds: 19800,
    hourlyUnits: {},
    hourlySlots: [],
    currentSlot: null,
    previousSlot: null,
    isLoading: false,
    error: null
  };
}

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value)
  };
}

describe("default location preference", () => {
  it("persists and restores the selected location", () => {
    const store = storage();
    expect(persistDefaultLocation(chennai, store)).toBe(true);
    expect(store.getItem(DEFAULT_LOCATION_STORAGE_KEY)).toContain('"name":"Chennai"');
    expect(readStoredDefaultLocation(store)).toEqual(chennai);
  });

  it("ignores malformed saved preferences", () => {
    const store = storage();
    store.setItem(DEFAULT_LOCATION_STORAGE_KEY, "{\"name\":\"missing coordinates\"}");
    expect(readStoredDefaultLocation(store)).toBeNull();
  });
});

describe("default location reconciliation", () => {
  it("moves an existing comparison location to primary without duplication", () => {
    const result = moveLocationToPrimary([state(bengaluru), state(chennai), state(mysuru)], state(chennai), 3);
    expect(result.map(item => item.location.name)).toEqual(["Chennai", "Bengaluru", "Mysuru"]);
  });

  it("preserves comparison locations when adding a new default below the limit", () => {
    const result = moveLocationToPrimary([state(bengaluru), state(chennai)], state(mysuru), 3);
    expect(result.map(item => item.location.name)).toEqual(["Mysuru", "Bengaluru", "Chennai"]);
  });

  it("replaces only the previous primary when the comparison limit is full", () => {
    const result = moveLocationToPrimary([state(bengaluru), state(chennai), state(mysuru)], state(delhi), 3);
    expect(result.map(item => item.location.name)).toEqual(["Delhi", "Chennai", "Mysuru"]);
    expect(result).toHaveLength(3);
  });
});
