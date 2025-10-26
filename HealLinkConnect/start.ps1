Set-Location "C:\Users\samya\OneDrive\Desktop\HealLinkConnect\HealLinkConnect"
$env:DATABASE_URL="postgresql://dev:devpassword@localhost:5432/abha_health_db"
$env:NODE_ENV="development"
$env:SESSION_SECRET="development_session_secret_key_at_least_32_characters_long_for_security"
$env:JWT_SECRET="development_jwt_secret_key_here"
npx tsx server/index.ts