# 🚨 EMERGENCY OTP FIX - NETLIFY

## Step 1: Verify Render Restarted (30 seconds)

Go to: https://dashboard.render.com

1. Click **"swasthya-sathi-backend"** 
2. Look at the **status circle at top-left**
3. It should be **GREEN** (running)
4. If it's **YELLOW/RED**, wait or scroll down and click **"Restart"** button

---

## Step 2: Force Redeploy Netlify (1 minute)

Go to: https://app.netlify.com

1. Click your site
2. Click **"Deployments"** tab
3. Click **"Trigger deploy"** dropdown
4. Click **"Clear cache and deploy site"** (NOT just "Deploy site")
5. Wait for build to complete (green checkmark)

---

## Step 3: Test OTP (30 seconds)

1. Go to your **Netlify URL** (refresh page with Ctrl+Shift+R - hard refresh)
2. Enter ABHA: `22-1234-5678-9012`
3. Enter Email: `samyak@acpce.ac.in`
4. Click **"Send OTP"**
5. **Check Gmail inbox immediately** - OTP should arrive in 10 seconds

---

## If OTP Still Doesn't Work:

Check Render Logs:

1. Go to https://dashboard.render.com
2. Click **"swasthya-sathi-backend"**
3. Click **"Logs"** tab
4. Look for line: **"✅ Gmail Email OTP configured"**
5. If you see it = Gmail is working
6. If you DON'T see it = Environment variables NOT saved

---

**Do this NOW and report back!** ⏱️
