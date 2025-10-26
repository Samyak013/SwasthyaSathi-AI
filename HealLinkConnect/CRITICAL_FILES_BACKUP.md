# Critical Files Backup - October 10, 2025

## 1. server/db.ts
```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema-sqlite";

// Use SQLite for development
const sqlite = new Database('./dev.db');
export const db = drizzle(sqlite, { schema });

console.log('Using SQLite database for development');
```

## 2. .env file
```env
# Database Configuration
DATABASE_URL="postgresql://dev:devpassword@localhost:5432/abha_health_db"
PGDATABASE="abha_health_db"
PGHOST="localhost"
PGPASSWORD="devpassword"
PGPORT="5432"
PGUSER="dev"

# Authentication
SESSION_SECRET="development_session_secret_key_at_least_32_characters_long_for_security"
JWT_SECRET="development_jwt_secret_key_here"

# Server Configuration
PORT=5000
NODE_ENV=development

# ABHA (ABDM) Integration Configuration
# Replace these with actual ABDM sandbox credentials
ABHA_API_URL="https://sandbox.abdm.gov.in/api"
ABHA_CLIENT_ID="your_abdm_client_id"
ABHA_CLIENT_SECRET="your_abdm_client_secret"
ABHA_TOKEN="your_abdm_auth_token"
ABHA_API_VERSION="v1"

# AI/Chatbot Configuration (Optional)
# Add your preferred AI service API key
OPENAI_API_KEY="PUT_YOUR_REAL_OPENAI_API_KEY_HERE"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"

# Optional: WebRTC Configuration for Teleconsultation
# TURN_SERVER_URL="turn:your-turn-server.com:3478"
# TURN_SERVER_USERNAME="your_turn_username"
# TURN_SERVER_CREDENTIAL="your_turn_credential"

# Optional: File Storage Configuration
# AWS_ACCESS_KEY_ID="your_aws_access_key"
# AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
# AWS_REGION="us-east-1"
# S3_BUCKET_NAME="your-bucket-name"

# Optional: SMS/Email Configuration
# TWILIO_ACCOUNT_SID="your_twilio_sid"
# TWILIO_AUTH_TOKEN="your_twilio_token"
# TWILIO_PHONE_NUMBER="+1234567890"
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="your-email@gmail.com"
# SMTP_PASS="your-email-password"
```

## 3. start.bat
```batch
@echo off
cd /d "C:\Users\samya\OneDrive\Desktop\HealLinkConnect\HealLinkConnect"
set DATABASE_URL=postgresql://dev:devpassword@localhost:5432/abha_health_db
set NODE_ENV=development
set SESSION_SECRET=development_session_secret_key_at_least_32_characters_long_for_security
set JWT_SECRET=development_jwt_secret_key_here
set PORT=5000
npx tsx server/index.ts
pause
```

## 4. server/index.ts modifications
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables from .env file
config();
```

## 5. server/storage.ts modification (constructor only)
```typescript
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Temporarily disable session store for SQLite
    this.sessionStore = null;
  }
```

## 6. Package.json additions
```json
"dependencies": {
  "better-sqlite3": "^11.3.0",
  "dotenv": "^16.4.5"
},
"devDependencies": {
  "@types/better-sqlite3": "^7.6.11"
}
```