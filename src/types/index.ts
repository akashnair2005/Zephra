import { PollutantKey } from "../config/appConfig";

export interface GeoLocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  country_code?: string;
  admin1?: string; // state / province
  timezone?: string;
}

export interface RawHourlyData {
  time: string[];
  pm2_5?: (number | null)[];
  pm10?: (number | null)[];
  nitrogen_dioxide?: (number | null)[];
  ozone?: (number | null)[];
  sulphur_dioxide?: (number | null)[];
  carbon_monoxide?: (number | null)[];
}

export interface AirQualityApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: RawHourlyData;
}

export interface HourlySlotData {
  isoTime: string;
  localTimeLabel: string;
  hourNumber: number;
  dateLabel: string;
  pm2_5: number | null;
  pm10: number | null;
  nitrogen_dioxide: number | null;
  ozone: number | null;
  sulphur_dioxide: number | null;
  carbon_monoxide: number | null;
}

export interface LocationAirQualityState {
  location: GeoLocationItem;
  fetchedAt: string;
  timezone: string;
  utcOffsetSeconds: number;
  hourlyUnits: Record<string, string>;
  hourlySlots: HourlySlotData[];
  currentSlot: HourlySlotData | null;
  previousSlot: HourlySlotData | null;
  isLoading: boolean;
  error: string | null;
}

export type AddLocationResult = string | void;
export type PlannerMode = "primary" | "compare";

export interface CandidateSlot {
  locationId: number;
  locationName: string;
  adminRegion: string;
  timezone: string;
  isoTime: string;
  formattedTime: string;
  formattedDate: string;
  pollutants: Record<PollutantKey, number | null>;
  units: Record<string, string>;
  rawValues: Record<PollutantKey, number | null>;
}

export interface RankedRecommendation {
  rank: number;
  candidate: CandidateSlot;
  relativeScore: number; // 0 (best in set) to 100 (highest relative pollution in set)
  normalizedPollutantRanks: Record<PollutantKey, number | null>;
  usedWeights: Record<PollutantKey, number>;
  totalEffectiveWeight: number;
  explanation: string;
  topContributingFavourablePollutant?: string;
  topContributingUnfavourablePollutant?: string;
  dataCompletenessPercentage: number;
}
