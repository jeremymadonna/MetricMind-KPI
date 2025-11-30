# MetricMind Frontend (Nest + Vite + shadcn/ui)

Frontend for MetricMind, the AI KPI Dashboard Builder. The app serves a Vite-built React UI via Nest.js, featuring shadcn/ui components, Plotly charts, and a “Live demo” mode for instant storytelling.

## What’s inside
- **Nest.js server** (serves static assets and health endpoint)
- **Vite + React** client with shadcn/ui styling
- **Plotly** visualizations with data-aware fallbacks
- **Zustand** state for KPI/narrative/visualizations
- **Live Demo** button to showcase the product without backend calls

## Quickstart
```bash
cd frontend
npm install

# Dev: client + Nest server separately
npm run client:dev      # Vite on :5173
npm run start:dev       # Nest on :3000 serving built client if present

# Production build
npm run client:build
npm run build:server
npm run start           # serves dist/main.js, static from client/dist
```

Env:
- `VITE_API_BASE` (defaults to http://localhost:8000) controls API calls from the client.

Testing:
- `npm test` (runs Vitest from `client/`)

## Key paths
- `client/src/App.tsx` – landing, generator form, hero, live demo wiring
- `client/src/components/dashboard-view.tsx` – KPI cards, Plotly charts, narrative
- `client/src/store/useDashboardStore.ts` – Zustand store, API + demo data
- `src/app.module.ts` – Nest ServeStatic config and health route
- `Dockerfile` – builds client + server

## Demo mode
Click **Live demo** in the header to load prebuilt KPIs, dual-axis trends, and channel efficiency charts with an executive narrative—ideal for showcasing without the backend.

## API target
Client calls `http://localhost:8000/kpi/` by default (`client/src/lib/api.ts`). Adjust for your environment as needed.

## Notes
- Plotly bundles are large; warnings on build size are expected. Use code splitting or lazy-load if needed.
- ServeStatic excludes `/api` routes; rebuild if you change patterns in `src/app.module.ts`.

## License
MIT
