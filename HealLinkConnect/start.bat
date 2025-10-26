@echo off
cd /d "C:\Users\samya\OneDrive\Desktop\HealLinkConnect\HealLinkConnect"
set DATABASE_URL=postgresql://dev:devpassword@localhost:5432/abha_health_db
set NODE_ENV=development
set SESSION_SECRET=development_session_secret_key_at_least_32_characters_long_for_security
set JWT_SECRET=development_jwt_secret_key_here
set PORT=5000
npx tsx server/index.ts
pause