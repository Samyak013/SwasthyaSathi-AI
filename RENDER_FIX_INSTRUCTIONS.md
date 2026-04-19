# 🔧 Netlify 504 Error - Diagnostic & Fix Guide

## ❌ Problem Identified

**Render backend is completely unresponsive** (crashes or hangs on startup)

### Root Cause: Missing Database Connection
The Render environment is missing the `DATABASE_URL` environment variable, preventing the Node.js app from starting.

---

## ✅ How to Fix (Render Dashboard)

### Step 1: Go to Render Dashboard
https://dashboard.render.com/services

### Step 2: Click "swashtya-sathi-ai" Service

### Step 3: Go to "Environment" Tab

### Step 4: Add/Verify These Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `DATABASE_URL` | Your Neon PostgreSQL URL | ✅ **CRITICAL** |
| `GMAIL_USER` | `sambgsr21@gmail.com` | ✅ Yes |
| `GMAIL_PASSWORD` | `nvou xziz kryt jngc` | ✅ Yes |
| `GEMINI_API_KEY` | Your key (or leave empty) | ⭕ Optional |
| `OPENAI_API_KEY` | Your key (or leave empty) | ⭕ Optional |

### Step 5: Find Your Database URL from Neon
1. Go to https://console.neon.tech
2. Select your project
3. Copy the connection string
4. Format: `postgresql://user:password@host/dbname`

### Step 6: Redeploy Service
Click **"Manual Deploy"** in Render dashboard to rebuild with correct env vars

---

## 📋 Current Status

### ✅ Working (Local)
- Localhost backend: `http://localhost:5000` → **All endpoints working**
- OTP: ✅ Tested and working
- All features: ✅ Implemented and responding

### ❌ Not Working (Production)
- Render backend: `https://swasthyasathi-ai.onrender.com` → **Timing out after 60s**
- Netlify frontend: ⚠️ Can't reach backend → **504 errors**

### ⚠️ Latest Changes
- Commit: `f775b1a` - "Implement all missing features - comprehensive fix"
- Netlify function added: Proxy with better error handling
- Code is ready, just waiting for Render database fix

---

## 🚀 What to Do NOW

1. **Add `DATABASE_URL` to Render environment** (most important!)
2. **Click "Manual Deploy"** to rebuild
3. Wait 30-60 seconds for service to start
4. Test: Visit https://swastyaai.netlify.app → Click "Login as Patient"
5. Send OTP should now work (no 504 error)

---

## 🔍 How to Debug on Render

If redeploying doesn't work:

1. Go to Service Logs in Render dashboard
2. Look for errors like:
   - `Error: connect ECONNREFUSED` → Database not found
   - `Cannot read property 'query' of undefined` → Database client not initialized
   - `Connection timeout` → DATABASE_URL format wrong
3. Screenshot error and share in logs

---

## 📞 Render Support Resources
- Docs: https://render.com/docs
- Status: https://status.render.com
- Database connection issues: https://render.com/docs/databases

---

## ✨ Once Fixed

After Render backend is running:
1. ✅ All 12+ new endpoints will be live
2. ✅ OTP will send properly (no 504 errors)
3. ✅ Netlify frontend will auto-connect
4. ✅ All features will work on production: https://swastyaai.netlify.app

**Current Netlify status**: App code is built and ready, just waiting for backend!
