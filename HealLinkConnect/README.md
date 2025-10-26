# Swashtya Sathi AI

A complete full-stack healthcare web application with ABHA (Ayushman Bharat Health Account) integration, featuring role-based dashboards for doctors, patients, and pharmacies.

## 🚀 Features

### Core Functionality
- **Role-based Authentication**: Secure login for doctors, patients, and pharmacies
- **ABHA Integration**: Complete integration with ABDM (Ayushman Bharat Digital Mission) APIs
- **Mobile-first PWA**: Instagram/Facebook-style responsive design
- **Real-time AI Chatbot**: Healthcare assistant for all user roles
- **Digital Prescriptions**: End-to-end prescription workflow
- **Consent Management**: Patient-controlled data access permissions
# HealLinkConnect

HealLinkConnect is a full-stack healthcare prototype: React + Vite frontend and an Express + TypeScript backend using Drizzle ORM. This repo is structured to make deployment to Netlify (frontend) and a hosted Node provider (backend) straightforward.

Quick highlights

- Frontend: Vite + React (client/)
- Backend: Express + TypeScript (server/)
- Database: Drizzle ORM with Postgres (production) or SQLite (local dev)

See `README_NETLIFY.md` for Netlify deployment instructions.

Local quick start

1. Install dependencies

```powershell
cd "C:\Users\samya\OneDrive\Desktop\HealLinkConnect\HealLinkConnect"
npm install
```

2. Run server (SQLite local dev)

```powershell
$env:NODE_ENV='development'
npx tsx server/index.ts
```

3. Open the frontend in a browser (Vite dev server or built static served by server)

```text
Open http://localhost:5173 for Vite dev or the server's port if running in production build.
```

Repository layout

- `client/` — React + Vite app (Vite root)
- `server/` — Express server, routes and DB code
- `shared/` — Drizzle DB schemas (Postgres & SQLite versions)
- `drizzle.config.ts` — Drizzle configuration (auto-selects Postgres vs SQLite)
- `netlify.toml` — Netlify frontend config

If you'd like, I can:
- Add GitHub Actions to automatically build on `main` (I added a CI workflow here),
- Deploy backend to Railway/Render and wire up Netlify environment variables,
- Add Redis-backed sessions for production.

Refer to `README_NETLIFY.md` for detailed Netlify + backend deployment steps.
## 📋 Prerequisites
