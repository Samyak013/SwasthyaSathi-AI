# ONE-COMMAND RESTORE SCRIPT
# Save this as restore.ps1 and run it to restore the working state

# Navigate to project directory
Set-Location "C:\Users\samya\OneDrive\Desktop\HealLinkConnect\HealLinkConnect"

# Install required dependencies
npm install better-sqlite3 dotenv @types/better-sqlite3

# Create database tables
npx tsx server/migrate.ts

# Start the application
Write-Host "Starting HealLinkConnect application..."
Write-Host "Application will be available at: http://localhost:5000"
cmd /c start.bat