/**
 * Single source of truth for branding, API constants, and transparent weights.
 */
export const APP_CONFIG = {
  name: "Zephra",
  tagline: "Find a better time to step outside.",
  subTagline: "Compare air-quality forecasts across locations and discover comparatively lower-pollution time slots for your outdoor plans.",
  usp: "Don't just check the air. Find a comparatively better place and time for your outdoor activity.",
  version: "1.0.0",
  maxLocations: 3,
  cacheDurationMs: 10 * 60 * 1000, // 10 minutes

  // Open-Meteo endpoints (no key required for non-commercial standard usage)
  endpoints: {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    airQuality: "https://air-quality-api.open-meteo.com/v1/air-quality"
  },

  // Core pollutants requested
  pollutants: [
    { key: "pm2_5", label: "PM2.5", name: "Fine Particulate Matter (<2.5 µm)", unit: "µg/m³", weight: 0.35, description: "Combustion particles, organic compounds, and metals capable of penetrating deep into lungs." },
    { key: "pm10", label: "PM10", name: "Inhalable Coarse Particles (<10 µm)", unit: "µg/m³", weight: 0.20, description: "Dust, pollen, and debris that irritate respiratory airways." },
    { key: "nitrogen_dioxide", label: "NO₂", name: "Nitrogen Dioxide", unit: "µg/m³", weight: 0.15, description: "Traffic emissions and power generation exhaust that inflame airways." },
    { key: "ozone", label: "O₃", name: "Ground-Level Ozone", unit: "µg/m³", weight: 0.15, description: "Secondary photochemical pollutant formed by sunlight acting on VOCs and NOx." },
    { key: "sulphur_dioxide", label: "SO₂", name: "Sulphur Dioxide", unit: "µg/m³", weight: 0.075, description: "Fossil fuel combustion by-product from heavy industrial plants." },
    { key: "carbon_monoxide", label: "CO", name: "Carbon Monoxide", unit: "µg/m³", weight: 0.075, description: "Colourless, odourless product of incomplete combustion." }
  ] as const,

  // Minimum data rule for recommendation engine
  minDataRequirements: {
    requirePm25: true,
    minValidPollutants: 3 // PM2.5 + at least two other pollutants
  },

  // Outdoor activities supported
  activities: [
    { id: "walking", label: "Walking & Commuting", icon: "Footprints", metabolicIntensity: "Light", note: "Suitable for gentle pacing with lower ventilation rate." },
    { id: "cycling", label: "Cycling", icon: "Bike", metabolicIntensity: "Moderate-High", note: "Moderate to high ventilation rate with prolonged exposure along roads." },
    { id: "jogging", label: "Jogging & Running", icon: "Flame", metabolicIntensity: "High", note: "High minute-ventilation brings pollutants deeper into alveolar tissue." },
    { id: "exercise", label: "Outdoor Fitness / HIIT", icon: "Dumbbell", metabolicIntensity: "High", note: "Deep respiratory cycles emphasize the value of lower PM2.5 and Ozone." },
    { id: "general", label: "General Outdoor Leisure", icon: "Compass", metabolicIntensity: "Low", note: "Parks, dining, or general recreation." }
  ] as const,

  // Supported planning windows (in hours)
  windows: [6, 12, 24] as const,

  // Attributions
  attribution: {
    cams: "Air-quality forecast data provided by Open-Meteo, with atmospheric composition forecasts from CAMS ENSEMBLE.",
    camsUrl: "https://atmosphere.copernicus.eu/",
    openMeteo: "Open-Meteo API",
    openMeteoUrl: "https://open-meteo.com/",
    openMeteoAirQualityUrl: "https://open-meteo.com/en/docs/air-quality-api",
    geocoding: "Location search provided through the Open-Meteo Geocoding API, based on GeoNames.",
    geocodingUrl: "https://open-meteo.com/en/docs/geocoding-api",
    license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/"
  }
};

export type PollutantKey = (typeof APP_CONFIG.pollutants)[number]["key"];
export type ActivityId = (typeof APP_CONFIG.activities)[number]["id"];
