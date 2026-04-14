# 🚀 504 Error Fix - Action Required on Render

## ✅ What Was Fixed

Your code has been updated with timeout protection and better OTP handling:

1. ✅ **Email Send Timeout** (10 seconds) - prevents hanging
2. ✅ **Request Timeout Middleware** (25 seconds) - kills long requests  
3. ✅ **Better Error Handling** - graceful fallbacks
4. ✅ **Improved Logging** - debug any issues easily

**All code is pushed to GitHub** → Render will auto-redeploy within 5 minutes

---

## 🔑 CRITICAL: Set Render Environment Variables

**The 504 error likely happens because Gmail credentials are NOT set on Render.**

### ⚠️ YOU MUST DO THIS:

1. Go to: **https://dashboard.render.com**
2. Select your service: **swasthya-sathi-ai**
3. Click: **Environment** (left sidebar)
4. Add these TWO variables:

```
GMAIL_USER          = sambgsr21@gmail.com
GMAIL_PASSWORD      = [16-char app password from Google]
```

### Get Gmail App Password:

1. Go to: https://myaccount.google.com/apppasswords
2. Select App: **Mail**
3. Select Device: **Windows PC** (or your device)
4. Click **Generate**
5. Copy the 16-character password (without spaces)
6. Paste into Render as GMAIL_PASSWORD

**Example**:
```
Google shows: nnnv nnnn nnnn nnnn
Use in Render: nnnvnnnnnnnnnnnn (remove spaces)
```

### Step 5: Save & Redeploy

1. Click **"Save"** button in Render
2. Render will auto-redeploy (5-10 minutes)
3. Wait for "Live" ✅ status

---

## 🧪 After Setting Env Vars, Test:

```bash
# 1. Check Backend is Running
curl https://swasthyasathi-ai.onrender.com/api/health

# Should return: {"status":"ok"}

# 2. Request OTP
curl -X POST https://swasthyasathi-ai.onrender.com/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"abhaId": "201912121234", "email": "sambgsr21@gmail.com"}'

# Should return (no 504):
# {"success":true,"message":"OTP sent...","recordId":"...","maskedEmail":"sa***@gmail.com"}

# 3. Check Frontend
# Visit: https://swastyaai.netlify.app
# Try to request OTP - should work!
```

---

## 📊 Check Render Logs

If still having issues:

1. Go to: https://dashboard.render.com
2. Select service
3. Click **"Logs"** tab
4. Should see:
   ```
   ✅ OTP email sent successfully to sambgsr21@gmail.com
   ```

If you see:
```
❌ Gmail not configured. Set GMAIL_USER and GMAIL_PASSWORD
```

→ Environment variables are not set correctly on Render

---

## 🎯 Summary

| Step | Status | What to Do |
|------|--------|-----------|
| Code fixes | ✅ Done | Nothing - already pushed |
| Build | ✅ Done | Nothing - verified locally |
| GitHub Push | ✅ Done | Nothing - already deployed |
| Render Redeploy | 🔄 In Progress | Wait 5 mins for auto-redeploy |
| **Gmail Setup on Render** | ⚠️ **YOU DO THIS** | Go to Render → Environment → Add GMAIL_USER & GMAIL_PASSWORD |
| Test OTP | 🔄 After setup | Request OTP → Should work now ✅ |

---

## 📋 Checklist

- [ ] Get Gmail App Password from Google
- [ ] Go to Render Dashboard
- [ ] Click Environment
- [ ] Add GMAIL_USER and GMAIL_PASSWORD
- [ ] Click Save (Render will redeploy)
- [ ] Wait 5-10 minutes for "Live" status
- [ ] Test: Request OTP on https://swastyaai.netlify.app
- [ ] Should receive email within 30 seconds
- [ ] 504 error should be GONE ✅

---

## 📞 Need Help?

If still getting 504:

1. Check Render logs for error messages
2. Verify GMAIL_USER shows in Render Environment
3. Verify GMAIL_PASSWORD shows in Render Environment
4. Try manual redeploy in Render Dashboard
5. Check: https://swasthyasathi-ai.onrender.com/api/health

---

**Once you set the Gmail credentials on Render, the 504 error will be FIXED!** 🎉
