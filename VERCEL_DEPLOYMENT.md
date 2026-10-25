# Zephra Vercel Deployment Guide

Zephra is a client-side React + TypeScript + Vite application. It deploys directly to Vercel as a static Vite build; no backend or API key is required.

## Required project settings

When importing `akashnair2005/Zephra` into Vercel, use:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | Repository root |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | Node.js 18 or later |

The repository root is the directory containing `package.json`, `vite.config.ts`, and `index.html`.

## Environment variables

None are required. Zephra calls these public services directly from the browser:

- Open-Meteo Air Quality API
- Open-Meteo Geocoding API
- OpenStreetMap tile servers

Do not add API keys or secrets to the frontend. If future public configuration is introduced, expose only a Vite-compatible `VITE_...` variable in Vercel and document it here.

## Import and deploy from GitHub

1. Push the latest code to the `main` branch of `akashnair2005/Zephra`.
2. Sign in to [Vercel](https://vercel.com/) and choose **Add New Project**.
3. Import the `akashnair2005/Zephra` GitHub repository.
4. Confirm the settings listed above.
5. Leave Environment Variables empty for the current version.
6. Choose **Deploy**.
7. Wait for `npm install`, `npm run build`, and deployment to complete.
8. Open the generated `.vercel.app` URL.

## Special configuration

No `vercel.json` is needed. The application does not use React Router or path-based client routes; navigation is managed within the single Vite entry page, so no rewrite rules are required.

The map uses React Leaflet with OpenStreetMap HTTPS tiles and visible attribution. Leaflet CSS is imported in the application entry point, and the map uses `CircleMarker` components, so it does not depend on runtime filesystem paths for marker image assets.

## Live-site verification checklist

- [ ] Deployment finishes successfully.
- [ ] Homepage loads without console or network errors.
- [ ] Dashboard displays live Open-Meteo pollutant readings.
- [ ] Location search returns real Open-Meteo Geocoding results.
- [ ] Changing the default location loads the new forecast and persists after refresh.
- [ ] Map markers render and OpenStreetMap attribution is visible.
- [ ] Forecast charts and pollutant cards render.
- [ ] Compare mode supports no more than three locations.
- [ ] Activity Planner `My Location` uses the configured primary location.
- [ ] Activity Planner comparison mode shows grouped selected locations.
- [ ] Methodology, comparison, and planner navigation work.
- [ ] Desktop and mobile layouts remain usable.
- [ ] Footer data-source acknowledgements and disclaimers remain visible.
