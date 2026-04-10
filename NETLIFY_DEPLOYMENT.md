# SwasthyaSathi-AI Full Deployment Guide

## Architecture Overview

This is a **full-stack application** with:
- **Frontend**: React SPA (Vite) → Deployed to **Netlify**
- **Backend**: Express.js + Node.js → Deploy to **Render** or **Railway**

---

## Part 1: Deploy Frontend to Netlify ✅

### Step 1: Connect GitHub Repository to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. Select **GitHub** and authorize
4. Select repository: **Samyak013/SwasthyaSathi-AI**
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`

### Step 2: Add Environment Variables to Netlify

In Netlify Dashboard:
1. Go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **Edit variables**
3. Add these variables:
   ```
   VITE_API_URL = https://your-backend-url.com
   OPENAI_API_KEY = your-openai-key (optional)
   ```

4. **Deploy Site**

---

## Part 2: Deploy Backend to Render or Railway

### Option A: Deploy to Render (Recommended)

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `swasthya-sathi-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` or `npm start`
   - **Port**: `5000`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   GMAIL_USER=sambgsr21@gmail.com
   GMAIL_PASSWORD=nsqf smoq vuab qezj
   OPENAI_API_KEY=your-key-here
   ```

6. **Deploy**

### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select repository
4. Configure environment variables (same as above)
5. **Deploy**

---

## Part 3: Connect Frontend to Backend

After backend deployment, update Netlify environment:

1. Copy your backend URL (e.g., `https://swasthya-sathi-backend.onrender.com`)
2. Go to Netlify **Site Settings** → **Environment**
3. Update:
   ```
   VITE_API_URL = https://your-backend-url.com
   ```

4. **Trigger redeploy** (push a commit to GitHub or use Netlify Deploy button)

---

## Environment Variables Summary

### Frontend (Netlify)
```
VITE_API_URL=https://your-backend-url.com
OPENAI_API_KEY=optional
```

### Backend (Render/Railway)
```
NODE_ENV=production
PORT=5000
GMAIL_USER=sambgsr21@gmail.com
GMAIL_PASSWORD=nsqf smoq vuab qezj
OPENAI_API_KEY=your-key-here
```

---

## Test Credentials

Once deployed:

| Role | ABHA ID | Email |
|------|---------|-------|
| Doctor | 22-1234-5678-9012 | samyak@acpce.ac.in |
| Patient 1 | 22-1111-2222-3333 | samyak@acpce.ac.in |
| Patient 2 | 22-4444-5555-6666 | samyak@acpce.ac.in |
| Pharmacy | 22-8888-9999-0000 | samyak@acpce.ac.in |

OTP emails will be sent via Gmail to the provided email address.

---

## Troubleshooting

### Netlify Build Fails
- Check **Netlify Build Logs** (Deploy → Logs)
- Ensure `npm run build` succeeds locally: `npm run build`

### API Calls Not Working
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend URL is accessible
- Check browser console for CORS errors

### Gmail OTP Not Sending
- Verify `GMAIL_USER` and `GMAIL_PASSWORD` are set on backend
- Check backend logs for email errors
- Ensure Gmail account has 2FA enabled and App Password created

### Cold Start / Slow Load
- First request to backend may be slow (cold start on free tier)
- Use paid tier for faster response times

---

## Deployment Checklist

- [ ] Frontend pushed to GitHub
- [ ] Netlify site created from GitHub
- [ ] Frontend build succeeds on Netlify
- [ ] Backend deployed to Render/Railway
- [ ] Backend environment variables configured
- [ ] `VITE_API_URL` variable set on Netlify
- [ ] Netlify redeployed with new env vars
- [ ] Test login with OTP
- [ ] All 3 dashboards working

---

## Support

For detailed local setup instructions, see [README.md](./README.md)

