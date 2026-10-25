# Zephra QA Checklist

Date: 2026-10-25

## Startup and build

| Check | Status | Evidence |
|---|---|---|
| Project structure and scripts inspected | PASS | Inspected `package.json`, `vite.config.ts`, `src/`, and existing tests. |
| Dependencies available | PASS | `node_modules` was present; no install was required. |
| Unit tests | PASS | `npm.cmd test -- --run`: 1 file, 7 tests passed before fixes; 8 tests passed after adding negative-reading coverage. |
| Production build | PASS | `npm.cmd run build`: TypeScript check and Vite production build completed successfully. Vite emitted only a chunk-size warning. |
| Development server | PASS | `npm.cmd run dev` started Vite on `http://localhost:5173/`; the process remains running. |
| Local HTTP response | PASS | `curl.exe -4 -I http://10.0.2.63:5173/` returned HTTP 200. |

## Live API integration

| Check | Status | Evidence |
|---|---|---|
| Geocoding API | PASS | Live request for Bengaluru returned a result with coordinates `12.97194, 77.59369`. |
| Air-quality API | PASS | Live request for Bengaluru returned 72 hourly records, `Asia/Kolkata`, and all six requested pollutant variables. |
| Real coordinates used | PASS | The application maps geocoding latitude/longitude into the air-quality request; live default data loaded for Bengaluru. |
| Pollutant parsing and units | PASS | Browser dashboard loaded real current pollutant cards; API response included `pm10`, `pm2_5`, `carbon_monoxide`, `nitrogen_dioxide`, `sulphur_dioxide`, and `ozone`. |
| Missing values are not zero-filled | PASS | Source transformation and chart rendering preserve `null`; scoring tests cover missing optional pollutants. |
| API error, timeout, invalid payload, and rate-limit UX | NOT TESTED | No controlled failure fixture or network interception was run. |
| Retry behavior | NOT TESTED | The visible refresh control was not exercised against a forced failure. |
| Cache freshness behavior | NOT TESTED | Cache expiration was not waited out or controlled with fake timers. |

## Location management

| Check | Status | Evidence |
|---|---|---|
| Default Bengaluru location | PASS | Browser dashboard loaded with Bengaluru and live forecast content. |
| Debounced partial search | NOT TESTED | The search implementation was inspected but a full suggestion-selection journey was not completed. |
| Duplicate handling | PASS | The add handler now returns a user-facing duplicate-location message without changing the existing list. |
| Maximum of three locations | PASS | The add handler now refuses a fourth location and returns an explicit “remove one before adding another” message; it no longer silently replaces the last location. |
| Remove and replace locations | NOT TESTED | Not exercised end-to-end in the browser. |
| Device geolocation permission/error paths | NOT TESTED | Browser permission and timeout scenarios were not simulated. |

## Dashboard, charts, and comparison

| Check | Status | Evidence |
|---|---|---|
| Dashboard loading state resolves | PASS | Browser transitioned from the Open-Meteo loading message to the dashboard after the live request. |
| Pollutant cards and forecast chart render | PASS | Browser dashboard contained current concentration content and forecast UI without a visible load error. |
| Missing values remain gaps | PASS | Forecast chart source explicitly maps missing values to `null` and uses `connectNulls={false}`. |
| Forecast timestamps align by instant | PASS | Fixed `ForecastChart` to match slots using each location’s `utc_offset_seconds`, rather than array index. Production build passed after the change. |
| One, two, and three-location comparison | NOT TESTED | Full multi-location browser journey was not completed. |
| Responsive widths 1440/768/375 | NOT TESTED | No viewport sweep was run. |

## Activity planner and scoring

| Check | Status | Evidence |
|---|---|---|
| Planner navigation | PASS | Browser navigation opened “Outdoor Activity Time Optimizer”. |
| Recommendations use available forecast data | PASS | Browser showed ranked location/time-window content with live Bengaluru data. |
| Planning windows and activities | PASS | Controls for the configured 6h, 12h, 24h windows and five activities are present; the planner rendered the default 12-hour results. |
| Future-window filtering | PASS | `extractCandidateSlots` compares each location’s local forecast keys against the current key and selected cutoff. |
| Minimum-data validation | PASS | Existing tests cover missing PM2.5, fewer than three valid pollutants, and missing optional values. |
| Negative readings | PASS | Added a regression test; `npm.cmd test -- --run` passed with 8 tests. |
| Ranking, weights, and deterministic ties | PASS | Existing tests cover lower-pollution ranking, tie-breaking, and grounded explanations. |
| Empty/insufficient data message | PASS | Planner contains a dedicated no-valid-candidate state; no fabricated recommendation fallback exists. |
| Inspect forecast breakdown | NOT TESTED | The modal was not opened during browser interaction. |

## Attribution and transparency

| Check | Status | Evidence |
|---|---|---|
| Open-Meteo and CAMS acknowledgement | PASS | Footer visibly showed Open-Meteo, CAMS ENSEMBLE, and source links in the browser snapshot. |
| Geocoding/GeoNames acknowledgement | PASS | Footer visibly acknowledged Open-Meteo Geocoding and GeoNames-based place resolution. |
| CC BY 4.0 link | PASS | Footer visibly contained the Creative Commons Attribution 4.0 link. |
| Modelled-data disclaimer | PASS | Footer visibly stated that the forecast is approximate and not a regulatory or medical diagnostic tool. |
| Methodology page journey | NOT TESTED | The page content was inspected in source but not opened through the browser. |

## Bugs fixed during QA

1. Adding a location while already at the three-location limit silently replaced the last location. The application now keeps the existing list unchanged and displays an explicit error message.
2. Forecast comparison aligned secondary locations by array index. The chart now aligns each slot by the actual UTC instant derived from the API local timestamp and location UTC offset.
3. Added regression coverage for negative pollutant readings.

## Known limitations and remaining work

- Controlled API failure, timeout, invalid-payload, and rate-limit tests remain outstanding.
- Full browser automation for search selection, adding/removing three locations, comparison, modal inspection, geolocation permissions, and responsive viewport checks remains outstanding.
- The production bundle is larger than Vite’s 500 kB advisory threshold; this is a performance warning, not a build failure.

## UI redesign verification

| Check | Status | Evidence |
|---|---|---|
| Forest/teal visual system and dashboard composition | PASS | Dashboard source now uses reusable panel/metric tokens, warm neutral surfaces, compact hero, metric cards, map panel, comparison preview, and planner preview. |
| Leaflet dependency compatibility | PASS | Installed `leaflet@1.9.4`, `react-leaflet@4.2.1`, and `@types/leaflet`; the React 18-compatible versions build successfully. |
| Interactive map renders | PASS | Browser dashboard showed a Leaflet map pane, rendered forecast marker path, and visible OpenStreetMap attribution. |
| Map uses real selected location data | PASS | The map consumes the existing `LocationAirQualityState` list and Bengaluru marker rendered after live API loading. |
| Map popups and forecast status | NOT TESTED | Popup click was not completed in the browser session. Popup content is wired to current PM2.5/PM10, timezone, timestamp, and error/loading status. |
| Forecast chart remains available | PASS | Existing chart remains mounted in the redesigned dashboard and build/test validation passed. |
| Activity Planner remains functional | PASS | Browser navigation opened the planner after the redesign and showed “Outdoor Activity Time Optimizer”. |
| Mobile layout and horizontal overflow | PASS | Browser viewport was set to 375px; `document.documentElement.scrollWidth > clientWidth` returned `false`. |
| Tablet/desktop viewport sweep | NOT TESTED | Only the existing desktop browser viewport and a 375px mobile viewport were directly checked. |
| DevRelay community research | BLOCKED | DevRelay search and challenge lookup returned “not connected to MLH”; no external community sources were used. |

## Stitch reference integration

| Check | Status | Evidence |
|---|---|---|
| Reference screens inspected | PASS | Inspected the supplied dashboard, compare, activity-planner, methodology screenshots and `DESIGN.md`. |
| Shared Stitch visual system | PASS | Applied Plus Jakarta Sans, pale lavender canvas, forest-green navigation, compact telemetry labels, thin borders, and dense panel hierarchy in `index.css`, `Navbar.tsx`, and shared page classes. |
| Main intelligence dashboard | PASS | Dashboard retains live search/API data and now includes the Stitch-style hero, metrics, forecast chart, map, selected-location preview, and planner shortcut. |
| Compare Locations screen | PASS | Compare route retains real add/remove controls, pollutant values, and timestamp-aware chart while using Stitch-style cards and page header. |
| Outdoor Activity Planner screen | PASS | Planner retains all configured activities, windows, scoring, recommendations, and inspection modal while using Stitch-style parameter and result panels. |
| Methodology & Data Sources screen | PASS | Methodology route retains Open-Meteo, CAMS, GeoNames, scoring, timezone, missing-data, and health disclaimers in the updated visual shell. |
| Exact visual pixel parity | NOT TESTED | No automated screenshot-diff baseline was supplied; integration is based on the provided reference screenshots and design tokens. |

## Manual verification steps

1. Open `http://localhost:5173/`.
2. Confirm Bengaluru loads and the six pollutant cards show live values or clear unavailable states.
3. Search for Paris and Delhi, select each suggestion, and confirm the Compare count reaches three.
4. Search for a fourth city and confirm the app displays an explicit limit message without replacing a selected city.
5. Open Compare and remove one location; add a replacement and confirm all cards/charts update.
6. Open Activity Planner, switch between Walking, Cycling, Jogging, Exercise, and General Outdoor Leisure, and test 6h/12h/24h windows.
7. Open “Inspect forecast” on a recommendation and verify its timestamp and pollutant values match the recommendation card.
8. Open Methodology and verify the CAMS, Open-Meteo, GeoNames, spatial-resolution, and CC BY 4.0 disclosures.
9. Repeat at approximately 1440 px, 768 px, and 375 px widths and check keyboard focus, horizontal overflow, and readable status messages.
