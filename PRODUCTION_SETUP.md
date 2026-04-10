# 🚀 COMPLETE PRODUCTION SETUP - Render Backend + Netlify Frontend

## ✅ STEP 1: Set Environment Variables on Render

**Your Render Service URL**: `https://swasthyasathi-ai.onrender.com`

### How to Add Environment Variables on Render:

1. Go to [render.com](https://render.com)
2. Click **"Dashboard"** (top-left)
3. Find your service: **"swasthya-sathi-backend"** (or your service name)
4. Click on it to open
5. Go to **"Environment"** tab (in the left sidebar)
6. Click **"Add Environment Variable"** button
7. Add these variables ONE BY ONE:

#### Variable 1:
```
Key: NODE_ENV
Value: production
```
Click "Add Variable"

#### Variable 2:
```
Key: PORT
Value: 5000
```
Click "Add Variable"

#### Variable 3:
```
Key: GMAIL_USER
Value: sambgsr21@gmail.com
```
Click "Add Variable"

#### Variable 4:
```
Key: GMAIL_PASSWORD
Value: nsqf smoq vuab qezj
```
Click "Add Variable"

#### Variable 5 (Optional - if you have OpenAI):
```
Key: OPENAI_API_KEY
Value: your-key-here
```

**After adding all variables:**
- Go to **"Settings"** tab
- Scroll down and click **"Restart Service"** (Red button at bottom)
- Wait 2-3 minutes for restart

✅ **Backend environment variables are now set!**

---

## ✅ STEP 2: Redeploy Netlify Frontend

**Your Netlify Site**: Go to [app.netlify.com](https://app.netlify.com)

1. Click on your site
2. Click **"Deployments"** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait for build to complete (2-3 minutes)

✅ **Frontend is now redeployed with Render connection!**

---

## 🧪 TEST EVERYTHING (5 minutes)

### Test 1: Visit Your Netlify Site
1. Go to your Netlify URL (check Netlify dashboard for the link)
2. You should see SwasthyaSathi login page

### Test 2: Test OTP Flow
1. **ABHA ID**: `22-1234-5678-9012` (Doctor)
2. **Email**: `samyak@acpce.ac.in`
3. Click **"Send OTP"**
4. ✅ **Check your email** - real Gmail OTP should arrive in 10-20 seconds
5. Copy the 6-digit OTP
6. Paste in the OTP field
7. Click **"Verify"**

### Test 3: Test Doctor Dashboard
1. After login, you should see **Doctor Dashboard**
2. Test these features:
   - **Search patients** - works with ABHA ID
   - **Create Prescription** - search patient, fill details
   - **Messages** - send message to patient
   - **Schedule** - book appointment

### Test 4: Test Patient Dashboard
1. Logout (button at top-right)
2. Login as Patient: `22-1111-2222-3333`
3. Email: `samyak@acpce.ac.in`
4. Use same OTP process
5. Test features:
   - **View Prescriptions** - click to see detail modal
   - **Health Records** - timeline view
   - **AI Assistant** - chat

✅ **If all tests pass, everything is LIVE!**

---

## 📊 Troubleshooting

### Gmail OTP Not Arriving?
1. Check Render service is running (green status)
2. Check Render logs: Dashboard → Service → **"Logs"** tab
3. Look for "Gmail Email OTP configured" message
4. If not there, environment variables not set correctly

**Fix**: Go back to STEP 1 and verify all variables are added

### Netlify Shows Errors?
1. Go to **Netlify** → Your site → **"Deploys"** tab
2. Click the latest deploy to see logs
3. Look for errors
4. Most common: Missing env vars (run redeploy after adding to Render)

### Can't Login?
1. Check browser console (F12 → Console tab)
2. Look for red errors about `/api/` calls
3. If you see API errors:
   - Render backend might be restarting
   - Wait 2-3 minutes after environment setup
   - Try refresh (Ctrl+R)

---

## 📋 Complete Checklist

- [ ] Added all 4 environment variables to Render
- [ ] Clicked "Restart Service" on Render
- [ ] Redeployed Netlify (Trigger deploy)
- [ ] Visited Netlify URL
- [ ] Tested OTP sending (email arrived)
- [ ] Tested OTP verification
- [ ] Tested Doctor Dashboard
- [ ] Tested Patient Dashboard
- [ ] All 3 roles working (Doctor, Patient, Pharmacy)

---

## 🎉 SUCCESS CRITERIA

When you see this, everything is working:

✅ Login page loads
✅ OTP email arrives from Gmail
✅ Can login after OTP
✅ Doctor Dashboard shows patients
✅ Patient Dashboard shows prescriptions
✅ Prescription detail modal works
✅ Messages/Calendar/Records tabs work

---

## 📞 Quick Reference

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | Your Netlify URL | ✅ Live |
| Backend API | https://swasthyasathi-ai.onrender.com | ✅ Live |
| Gmail OTP | sambgsr21@gmail.com | ✅ Configured |
| Database | In-memory (dev) | ⚠️ Resets on deploy |

---

## ⚠️ IMPORTANT NOTE

Your database is **in-memory** (resets when Render service restarts). For production:
- Add PostgreSQL database (see below)
- Or use MongoDB/Firebase

**For now, it works fine for testing!**

---

## Optional: Add Real Database to Render

If you want persistent data (doesn't reset):

1. Go to Render dashboard
2. Click **"New"** → **"PostgreSQL"**
3. Name: `swasthya-sathi-db`
4. Copy the connection string
5. Add to Render environment as `DATABASE_URL`
6. Redeploy

But this is **optional** - system works without it for testing!

---

**You're all set! Netlify + Render are connected. Follow the testing steps and you'll be live! 🚀**
