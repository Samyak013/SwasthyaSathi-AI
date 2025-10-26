# Deploying HealLinkConnect frontend to Netlify and backend to a hosted Node service

This repository contains a Vite React frontend (under `client/`) and an Express backend (server/). The recommended deployment approach is:

- Frontend: Netlify (static hosting)
- Backend: Railway / Render / Fly / Heroku / DigitalOcean App Platform (Node service)

## Frontend (Netlify)
1. In Netlify, set the repository and branch (main).
2. Build command: `npm run build`
3. Publish directory: `dist/public`
4. Add an environment variable in Netlify site settings:
   - `VITE_API_URL` = `https://your-backend.example.com` (set to your deployed backend URL)
5. Optionally set `NETLIFY_BUILD_DEBUG=true` while debugging.

Netlify will run `npm run build` which executes the root `vite build` with `root` set to `client/` and output to `dist/public`.

## Backend (recommended: Railway / Render / Fly)
1. Create a new Node service and push this repo (or point the provider to this repo).
2. Set environment variables for the backend service:
   - `DATABASE_URL` (Postgres connection string)
   - `REDIS_URL` (optional, for sessions)
   - `CLIENT_ORIGIN` (set to your Netlify URL e.g. `https://your-site.netlify.app`)
   - `PORT` (optional; providers usually set this automatically)
3. Run `npm install` and `npx tsx server/migrate.ts` to run migrations against the configured DB.
4. Start the server using `npm run dev` for development or `npm run build && npm start` for production (adjust as needed by the provider).

## Local development
- To run locally (SQLite fallback):
  ```powershell
  $env:NODE_ENV='development'
  npx tsx server/index.ts
  ```

- To run with a cloud Postgres connection (example):
  ```powershell
  $env:DATABASE_URL='postgres://user:pass@host:5432/dbname'
  $env:NODE_ENV='development'
  npx tsx server/migrate.ts
  npx tsx server/index.ts
  ```

## Notes & troubleshooting
- Configure `VITE_API_URL` in Netlify to point at the deployed backend. Netlify will replace `import.meta.env.VITE_API_URL` at build time.
- The repo uses CORS on the server; set `CLIENT_ORIGIN` to your Netlify app URL.
- For production session persistence, use Redis and set `REDIS_URL` in backend env vars.
- If you prefer a single-host deployment, consider Render or Railway where you can deploy both frontend and backend, but Netlify + Railway/Fly is a common pattern.

If you want, I can:
- Add a deploy script for Railway or Render.
- Set up GitHub Actions to automatically deploy the backend and trigger Netlify deploys.
