Netlify helper files and instructions

What these files are for
- `_redirects`: a simple redirect file to route API calls to your backend and handle SPA routing.
- `netlify.toml`: sample Netlify config for build/publish and redirects.

How to deploy the frontend on Netlify
1. Push your repo to GitHub (done).
2. In Netlify, "New site from Git" → choose GitHub and select this repository.
3. Set these build settings in Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
4. In Site settings → Build & deploy → Environment, set these variables:
   - `VITE_API_URL` = `https://YOUR_BACKEND_URL` (replace with your deployed backend URL)
5. Trigger a deploy. The site will be served from the `dist/public` output.

Backend hosting (recommended)
- Netlify only hosts frontend static sites. For the Node backend, use a platform like Railway, Render, Fly.io or Heroku.
- After hosting the backend, set its URL in Netlify as `VITE_API_URL`.

Migrations and running backend
- If you host the backend on a server, run the migrations there (the repo includes migration helpers under `server/`). Example (on server machine):

```powershell
# run from repo root on the server
npm ci
npx tsx server/migrate.ts
npx tsx server/index.ts
```

Notes
- Make sure your hosted backend has `DATABASE_URL` and (recommended) `REDIS_URL` set as environment variables.
- If you want Netlify to proxy API calls during local dev, use the `_redirects` rule or configure a local proxy in `vite`.
