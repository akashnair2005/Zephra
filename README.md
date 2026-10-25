# Zephra — Hyperlocal Air Quality & Pollution Insights Platform

> **USP:** *“Don’t just check the air. Find a comparatively better place and time for your outdoor activity.”*

Zephra is a responsive environmental intelligence web application built with React, Vite, TypeScript, and Recharts. Instead of just displaying a single static AQI number, it retrieves real hourly forecast models from Copernicus CAMS via the Open-Meteo Air Quality API, allows side-by-side comparison of up to 3 locations, and uses a transparent, explainable ranking engine to discover comparatively lower-pollution time slots for outdoor workouts, commuting, and family recreation.

---

## 1. Problem Statement & Solution

* **The Problem:** Air quality varies significantly over hours and across urban pockets. A general citywide AQI doesn't help an athlete or commuter determine if running at 7 AM in the local park is cleaner than cycling at 5 PM near a transit corridor.
* **The Solution:** Zephra aggregates 6 core pollutants (PM2.5, PM10, NO₂, O₃, SO₂, CO) across customizable 6h, 12h, and 24h horizons, evaluates candidate slots using multi-pollutant relative scoring, and produces inspectable, transparent recommendations.

---

## 2. APIs and Services Used

1. **Open-Meteo Air Quality API:**
   * Endpoint: `https://air-quality-api.open-meteo.com/v1/air-quality`
   * Parameters: `pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`, `timezone=auto`, `forecast_days=3`.
   * Data Source: Copernicus Atmosphere Monitoring Service (CAMS) ENSEMBLE.
2. **Open-Meteo Geocoding API:**
   * Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
   * Features: City/region debounced search, coordinate retrieval, elevation, timezone resolution.
3. **HTML5 Geolocation API:**
   * Browser-permission gated "Use my location" button with timeout and graceful error states.
4. **Leaflet + React Leaflet:**
   * Interactive selected-location map rendered with React Leaflet and Leaflet.
   * OpenStreetMap HTTPS tiles with visible `© OpenStreetMap contributors` attribution.
   * Map markers use the application's real coordinates and current forecast values; no synthetic heatmap data is generated.

### API References

* [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
* [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
* [Open-Meteo](https://open-meteo.com/)
* [Copernicus Atmosphere Monitoring Service (CAMS)](https://atmosphere.copernicus.eu/)
* [Leaflet documentation](https://leafletjs.com/)
* [React Leaflet documentation](https://react-leaflet.js.org/)
* [OpenStreetMap copyright and tile attribution](https://www.openstreetmap.org/copyright)

---

## 3. Transparent Recommendation Algorithm

* **Candidate Filtering:** Evaluates strictly future slots within the chosen planning horizon.
* **Minimum Data Requirement:** Candidate slots MUST have a valid non-negative PM2.5 value plus at least two other verified pollutants. Missing values are **never** treated as 0.
* **Relative Scoring:**
  $$R_p(k) = \frac{C_p(k) - \min(C_p)}{\max(C_p) - \min(C_p)}$$
  $$\text{Relative Score} = \left[ \frac{\sum w_p \cdot R_p(k)}{\sum w_p} \right] \times 100$$
  *Lower score = comparatively cleaner air.*
* **Deterministic Tie-Breaking:** Relative Score $\rightarrow$ Lowest PM2.5 $\rightarrow$ Earliest Time $\rightarrow$ Alphabetical Name.

---

## 4. Windows Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or later installed on Windows.
* **npm**: v9.0.0 or later.

### Step-by-Step Terminal Commands (PowerShell / Command Prompt)

```powershell
# 1. Clone or navigate into the project directory
cd aero-shift

# 2. Install all dependencies
npm install

# 3. Run unit tests to verify the scoring engine
npm test

# 4. Start the Vite development server
npm run dev

Vite will print a local URL, usually http://localhost:5173/. Open it in Chrome, Edge, or Firefox.

Production Build

npm run build
npm run preview

5. 2-to-3 Minute Demonstration Sequence for Judges

1.  Homepage Overview (30s):
      - Open http://localhost:5173/.
      - Highlight the USP banner: "Find a better time to step outside."
      - Point out the primary location (London), the 6 individual pollutant
        cards with correct units (µg/m³), and the hourly forecast trend chart.
2.  Search & Multi-Location Comparison (45s):
      - Use the search bar to add two more locations (e.g., Paris and Delhi).
      - Navigate to the Compare tab to show the side-by-side pollutant matrix
        and multi-line Recharts visualization highlighting geographic
        divergence.
3.  Activity Planning Engine — The USP (60s):
      - Click the prominent Activity Planner tab.
      - Select "Cycling" and set the planning window to "Next 12 hours".
      - Show how the engine immediately filters candidate hours and ranks them.
      - Point to Rank #1: Explain the Relative Pollution Score badge (e.g. 14.2
        / 100) and the human-readable explanation showing lower PM2.5 and NO₂.
4.  Data Transparency & Inspection (30s):
      - Click "Inspect Data" on the top recommendation to open the algorithmic
        breakdown modal showing exact underlying values, weights, and relative
        ranks.
      - Open the Methodology tab to show CAMS ENSEMBLE citations, spatial
        resolution disclosures (0.1° vs 0.4°), and CC BY 4.0 licensing.

6. Attributions & Disclaimers

  - Data Provider: Open-Meteo (https://open-meteo.com/)
  - Atmospheric Forecasts: Copernicus Atmosphere Monitoring Service (CAMS)
    (https://atmosphere.copernicus.eu/)
  - Licensing: Creative Commons Attribution 4.0 International (CC BY 4.0).
  - Disclaimer: Modelled spatial forecast data is an approximation and intended
    for comparative activity planning. It is not an official municipal
    regulatory instrument or clinical medical diagnostic tool.


---

## 10. Implementation & Handover Summary

### What Has Been Implemented:
1. **Full Modular Architecture:** 18 distinct source files covering components, pages, services, algorithms, configuration, and unit tests.
2. **Real API Integrations:** Live Open-Meteo Air Quality & Geocoding APIs with debounce, in-memory caching, and request abort controllers.
3. **Responsive Environmental Tech Design:** Teal/emerald/slate theme with cards, Recharts time-series visualization, and clear visual hierarchy.
4. **Primary USP Outdoor Planner:** Activity-specific look-ahead window optimizer (6h, 12h, 24h) evaluating candidates and generating inspectable recommendations.
5. **Transparent Scoring Algorithm:** Minimum-data validation, normalized pollutant ranking, deterministic tie-breaking, and grounded natural language explanations.
6. **Full Transparency & Attribution:** Visible footer, dedicated methodology page, and forecast-resolution limitations documented where verified.
7. **Complete Vitest Suite:** 6 comprehensive unit test cases verifying candidate completeness, non-zero handling, determinism, and score boundaries.
