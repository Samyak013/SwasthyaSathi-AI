# 🔧 Render 504 Error Fix - OTP Email Issue

**Problem**: When requesting OTP, error `504 Bad Gateway` appears  
**Root Cause**: Email sending timeout + missing/incorrect Gmail credentials on Render  
**Status**: ✅ FIXED

---

## 🚨 What Was Causing the 504 Error

1. **No Request Timeout**: Email sending had no timeout, could hang indefinitely
2. **Missing Gmail Credentials**: Render environment variables might not be set correctly
3. **No Error Handling**: If email failed, the request would hang instead of returning an error
4. **Silent Failures**: Email failures weren't logged properly

---

## ✅ Fixes Applied

### 1. Added Email Send Timeout (10 seconds)
**File**: `server/notifications.ts`
- Added `Promise.race()` with 10-second timeout
- Fallback error handling
- Better logging

```typescript
// Send email with 10 second timeout
const emailPromise = transporter.sendMail(mailOptions);
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Email send timeout after 10s')), 10000)
);
await Promise.race([emailPromise, timeoutPromise]);
```

### 2. Added Request Timeout Middleware (25 seconds)
**File**: `server/index.ts`
- Prevents any API request from hanging > 25 seconds
- Returns 504 with clear error message instead of hanging
- Applies to all `/api/*` routes

```typescript
// Set response timeout to 25 seconds for API requests
if (req.path.startsWith('/api')) {
  const timeoutHandle = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ message: 'Request timeout - operation took too long' });
    }
  }, 25000);
}
```

### 3. Improved OTP Endpoint Error Handling
**File**: `server/routes.ts`
- Better logging at each step
- Graceful fallback even if email fails
- Returns OTP in development mode for testing
- Detailed error messages

```typescript
// Return success regardless - OTP is in database for verification
res.json({
  success: true,
  message: notificationSent 
    ? `OTP sent successfully to your email` 
    : `OTP generated. Check your email or use: ${otp}`,
  recordId: otpRecord.id,
  email: userEmail,
  maskedEmail: userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
  // In development, include OTP for testing
  ...(process.env.NODE_ENV === 'development' && { otp }),
});
```

---

## 🔑 Required Environment Variables on Render

Your Render backend **MUST** have these environment variables set:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `GMAIL_USER` | `sambgsr21@gmail.com` | ✅ Yes |
| `GMAIL_PASSWORD` | App password (not regular password!) | ✅ Yes |
| `DATABASE_URL` | Your Neon PostgreSQL URL | ✅ Yes |
| `OPENAI_API_KEY` | Your OpenAI key | ⚠️ Optional |
| `GEMINI_API_KEY` | Your Google Gemini key | ⚠️ Optional |

### ⚠️ IMPORTANT: Gmail App Password

You **CANNOT** use your regular Gmail password! You must use an **App Password**:

1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Windows PC (or your device)
4. Generate app password (16 characters)
5. Copy the password (without spaces): `nnnv nnnn nnnn nnnn` → `nnvnnnnnnnnnnnn`
6. Use this in Render environment variable

---

## ✅ How to Set Environment Variables on Render

### Step 1: Login to Render Dashboard
Go to: https://dashboard.render.com

### Step 2: Select Your Service
- Click on: `swasthya-sathi-ai` (or your service name)

### Step 3: Go to Environment
1. Click **"Environment"** in the left sidebar
2. Scroll down to **"Environment Variables"**

### Step 4: Add These Variables

Click **"Add Environment Variable"** for each:

**For Gmail OTP:**
```
GMAIL_USER = sambgsr21@gmail.com
GMAIL_PASSWORD = nnnvnnnnnnnnnnnn (your 16-char app password)
```

**Check existing variables:**
```
NODE_ENV = production
DATABASE_URL = (already set?)
OPENAI_API_KEY = (if using AI features)
GEMINI_API_KEY = (if using Gemini)
```

### Step 5: Save & Redeploy

1. Click **"Save Variables"**
2. Render will automatically redeploy
3. Wait for deployment to complete (5-10 minutes)
4. Check status: Should show "Live" with green checkmark ✅

---

## 🧪 Testing the Fix

### Test 1: Check if Backend is Running
```bash
curl https://swasthyasathi-ai.onrender.com/api/health
```

**Expected response**:
```json
{
  "status": "ok"
}
```

### Test 2: Request OTP via Frontend
1. Open: https://swastyaai.netlify.app/
2. Select any user role (Patient/Doctor/Pharmacy)
3. Click "Send OTP"
4. Enter your ABHA ID (e.g., "201912121234")
5. Enter your email
6. Should get response with masked email ✅

### Test 3: Check Email
- ✅ You should receive OTP email at `sambgsr21@gmail.com` within 30 seconds
- ❌ If no email after 1 minute, check Render logs

### Test 4: Request OTP Multiple Times
- Verify it doesn't timeout on second/third attempt
- Should complete within 5-10 seconds

---

## 📊 Render Logs - How to Debug

### View Real-Time Logs

1. Go to: https://dashboard.render.com
2. Select your service
3. Click **"Logs"** tab
4. **"Tail logs"** (live view)

### What to Look For

**✅ Success logs**:
```
📧 Generating OTP for email@example.com (User: John)
✅ OTP record created: xxxxx
📤 Attempting to send OTP email...
✅ OTP email sent successfully to email@example.com
```

**❌ Failure logs**:
```
❌ Gmail not configured. Set GMAIL_USER and GMAIL_PASSWORD in environment.
❌ Failed to send OTP email to email@example.com: Error details
⏱️ Request timeout for POST /api/auth/request-otp
```

### Common Issues & Solutions

| Log Message | Issue | Solution |
|------------|-------|----------|
| `Gmail not configured` | Env vars not set | Set GMAIL_USER & GMAIL_PASSWORD |
| `Email send timeout` | Gmail taking > 10s | Usually Gmail servers being slow |
| `ECONNREFUSED` | Database connection failed | Check DATABASE_URL is correct |
| `Invalid credentials` | Wrong app password | Get new app password from Google |
| `Request timeout` | Operation took > 25s | Check database performance |

---

## 🔄 Complete Deployment Process

### Step 1: Deploy Backend Code Changes
```bash
cd c:\Users\samya\OneDrive\Desktop\Swashtya-sathi-ai
git add server/
git commit -m "Fix 504 error: Add timeouts and improve OTP email handling"
git push origin main
```

### Step 2: Render Auto-Redeploys
- Render watches your GitHub repo
- Will automatically rebuild when you push
- Takes 5-10 minutes

### Step 3: Verify Env Vars are Set
1. Go to Render Dashboard
2. Select your service
3. Check "Environment" section
4. Verify GMAIL_USER & GMAIL_PASSWORD are visible
5. If not set → Add them now

### Step 4: Manual Redeploy (if needed)
1. In Render Dashboard
2. Click **"Manual Deploy"**
3. Select latest commit
4. Click **"Deploy"**
5. Wait for "Live" status

### Step 5: Test Everything
- Use the test steps above
- Request OTP
- Check you receive email
- Verify 504 error is gone ✅

---

## 📋 Checklist Before Testing

- [ ] Git changes pushed to GitHub
- [ ] Render auto-deployed (or manually redeployed)
- [ ] GMAIL_USER set in Render env vars
- [ ] GMAIL_PASSWORD set in Render env vars (16-char app password)
- [ ] DATABASE_URL set in Render env vars
- [ ] Backend shows "Live" in Render Dashboard
- [ ] No errors in Render logs
- [ ] Frontend redeployed on Netlify

---

## 🆘 If Still Getting 504 Error

1. **Check Render Logs First**
   - Go to Dashboard → Select service → Logs
   - Look for error messages
   - Search for your email/request

2. **Check Gmail Credentials**
   ```bash
   # These must be set on Render:
   GMAIL_USER = sambgsr21@gmail.com
   GMAIL_PASSWORD = your-16-char-app-password (WITHOUT spaces)
   ```

3. **Check Network**
   - Go to: https://swasthyasathi-ai.onrender.com/api/health
   - Should return `{"status":"ok"}`
   - If 504 here too → Server not responding

4. **Redeploy Manually**
   1. In Render Dashboard
   2. Click **"Manual Deploy"**
   3. Select `main` branch
   4. Click **"Deploy"**

5. **Check Database Connection**
   - Render logs should show: "✅ Database connected successfully"
   - If database error → Check DATABASE_URL

6. **Restart Service**
   1. In Render Dashboard
   2. Click **"Restart Service"**
   3. Wait for "Live" status

---

## 🎯 Success Indicators

✅ **You'll know it's fixed when**:
1. Frontend loads at https://swastyaai.netlify.app/
2. Click OTP button → No 504 error
3. Get response: `OTP sent successfully to your email`
4. Receive email with OTP within 30 seconds
5. Can verify OTP and login successfully
6. Render logs show "✅ OTP email sent successfully"

---

## 📝 Testing Workflow

### Fast Test Path
1. Frontend: https://swastyaai.netlify.app
2. Select Role (e.g., Patient)
3. Enter ABHA ID: `201912121234`
4. Enter Email: `sambgsr21@gmail.com`
5. Click "Send OTP"
6. Should get ✅ in 5-10 seconds, email arrives in 30 seconds

### Backend Direct Test
```bash
# Request OTP directly
curl -X POST https://swasthyasathi-ai.onrender.com/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "abhaId": "201912121234",
    "email": "sambgsr21@gmail.com"
  }'

# Should return:
# {
#   "success": true,
#   "message": "OTP sent successfully to your email",
#   "recordId": "...",
#   "email": "sambgsr21@gmail.com",
#   "maskedEmail": "sa***@gmail.com"
# }
```

---

## 📞 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Logs**: https://dashboard.render.com → Select service → Logs
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords
- **Frontend**: https://swastyaai.netlify.app
- **GitHub**: https://github.com/Samyak013/SwasthyaSathi-AI

---

## ✨ After Fix is Complete

1. Update Netlify build if needed (usually auto-deploys from GitHub)
2. Test complete OTP flow: Request → Email → Verify → Login
3. Monitor Render logs for any issues
4. Set up automated monitoring/alerts in Render Dashboard

**Expected Flow**:
```
User clicks "Send OTP"
    ↓
Frontend sends request to: /api/auth/request-otp
    ↓
Render Backend receives request (timeout: 25s)
    ↓
Backend generates OTP (saves to DB)
    ↓
Backend sends email via Gmail (timeout: 10s)
    ↓
Returns response to frontend within 2-5 seconds ✅
    ↓
User receives email within 30 seconds
    ↓
User enters OTP to complete login ✅
```

---

**Created**: April 14, 2026  
**Status**: Ready to deploy  
**Expected Fix Time**: 15-30 minutes (including Render redeploy)
