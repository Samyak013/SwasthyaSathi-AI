# 🚀 Deployment Guide - Swashtya Sathi AI

## ✅ DEPLOYMENT STATUS: READY FOR PRODUCTION

The application has been successfully built and is ready to deploy to production servers.

---

## 📊 Build Summary

```
✅ Frontend Build: 467.26 kB (gzip: 138.73 kB)
✅ Backend Bundle: 111.4 kB
✅ Total Size: ~580 KB bundled
✅ Build Status: SUCCESS
✅ All Tests: PASSED
```

---

## 🌐 DEPLOYMENT OPTION 1: RENDER.COM (Recommended)

### Why Render?
- Fully managed Node.js hosting
- Free tier available
- PostgreSQL database included
- Easy environment variable management
- GitHub integration
- Automatic deployments on push

### Steps:

#### 1. Connect GitHub Repository
1. Go to [render.com](https://render.com)
2. Click "Create +" → "Web Service"
3. Select "Deploy from a Git repository"
4. Connect your GitHub account
5. Select `Samyak013/SwasthyaSathi-AI` repository
6. Configure:
   - **Name**: `swashtya-sathi-ai`
   - **Environment**: `Node`
   - **Region**: Choose closest to your location
   - **Branch**: `main`
   - **Build Command**: `npm install --include=dev && npm run build && npm prune --production`
   - **Start Command**: `NODE_ENV=production node dist/index.js`

#### 2. Set Environment Variables
In Render Dashboard → Environment:

```
NODE_ENV=production
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
DATABASE_URL=postgresql://user:password@host/dbname
```

#### 3. Deploy
```bash
git push origin main
# Render automatically deploys on push
```

---

## 🔧 DEPLOYMENT OPTION 2: NETLIFY (Frontend) + EXTERNAL API (Backend)

### Why Netlify for Frontend?
- Ultra-fast CDN
- Free tier generous
- Form handling
- Serverless functions
- Easy custom domain

### Steps:

#### 1. Build Frontend Only
```bash
npm run build
# Creates dist/public folder for Netlify
```

#### 2. Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist/public
```

#### 3. Backend Deployment
Deploy Express backend separately to:
- **Option A**: Render.com (see above)
- **Option B**: Railway.app
- **Option C**: Heroku
- **Option D**: AWS (EC2/Lambda)

---

## 🔐 ENVIRONMENT VARIABLES CHECKLIST

### Required for Production:
- ✅ `NODE_ENV=production`
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ⚠️ `GEMINI_API_KEY` - OR `OPENAI_API_KEY` (at least one)
- ✅ `GMAIL_USER` - Gmail account for OTP emails
- ✅ `GMAIL_PASSWORD` - Gmail app-specific password

### Optional:
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key (fallback)

### Getting API Keys:

**Gemini API (Free, 60 req/min):**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API key"
3. Copy the key to `GEMINI_API_KEY`

**OpenAI API:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key in settings
3. Copy to `OPENAI_API_KEY`

**Gmail App Password:**
1. Enable 2-factor authentication on Gmail
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate app password
4. Use as `GMAIL_PASSWORD` (not your main password!)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] All code committed to GitHub
- [x] Build succeeds locally (`npm run build`)
- [x] All tests pass (`npm run check`)
- [x] Environment variables ready
- [x] Database configured
- [x] API keys obtained
- [x] Multi-language support tested (EN/HI/MR)
- [x] Login flows tested (Patient, Doctor, Pharmacy)
- [x] Translation working in all 3 languages

---

## 🚀 QUICK DEPLOYMENT (Render)

```bash
# 1. Ensure code is pushed
git push origin main

# 2. Go to Render.com dashboard
# https://dashboard.render.com

# 3. Create new Web Service
# Link GitHub repository: Samyak013/SwasthyaSathi-AI

# 4. Configure build settings:
# Build Command: npm install --include=dev && npm run build && npm prune --production
# Start Command: NODE_ENV=production node dist/index.js

# 5. Set environment variables (in Render dashboard):
# - NODE_ENV=production
# - GEMINI_API_KEY=***
# - GMAIL_USER=***
# - GMAIL_PASSWORD=***
# - DATABASE_URL=***

# 6. Deploy
# Render automatically deploys when code is pushed
```

---

## 📈 POST-DEPLOYMENT VERIFICATION

After deployment, verify all features:

### 1. Login Tests
- [ ] Patient login with OTP works
- [ ] Doctor login with OTP works
- [ ] Pharmacy login with OTP works
- [ ] OTP email received

### 2. Feature Tests
- [ ] Dashboard displays correctly
- [ ] Language selector works (EN/HI/MR)
- [ ] AI Chatbot responds
- [ ] Health records load
- [ ] Pharmacy inventory shows
- [ ] Reminders functional

### 3. Performance Tests
- [ ] Page load < 3 seconds
- [ ] API response < 1 second
- [ ] Images load properly
- [ ] No console errors

### 4. Database Tests
- [ ] User data persists
- [ ] Records saved properly
- [ ] OTP generation works
- [ ] Email sending works

---

## 🔍 TROUBLESHOOTING

### Issue: "Build failed"
```bash
# Clear npm cache and rebuild
npm cache clean --force
rm package-lock.json
npm install
npm run build
```

### Issue: "API not responding"
- Check `DATABASE_URL` is correct
- Verify all environment variables set
- Check Render logs: `Logs` tab in dashboard

### Issue: "Emails not sending"
- Verify `GMAIL_USER` and `GMAIL_PASSWORD` correct
- Enable "Less secure app access" in Gmail (deprecated)
- Use app-specific password instead
- Check spam folder

### Issue: "Database connection error"
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- Ensure password doesn't have special characters (URL encode them)

### Issue: "Language not translating"
- Clear browser cache and localStorage
- Hard refresh: Ctrl+Shift+R
- Check LanguageContext is loaded

---

## 📊 DEPLOYMENT PLATFORMS COMPARISON

| Feature | Render | Netlify | Railway | Heroku |
|---------|--------|---------|---------|--------|
| Node.js Hosting | ✅ | ❌ (Functions only) | ✅ | ✅ |
| Free Tier | ✅ Limited | ✅ Generous | ✅ | ❌ |
| PostgreSQL | ✅ | ❌ | ✅ | ✅ |
| GitHub Deploy | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| Custom Domain | ✅ | ✅ | ✅ | ✅ |
| Cold Start | ~10s | ~2s | ~3s | ~5s |
| Monthly Cost | Free-$7 | Free | Free-$5 | $7-50 |

**Recommendation**: **Render.com** - Best for full-stack Node apps

---

## 🎯 NEXT STEPS

1. **Choose Platform**: Render recommended
2. **Get API Keys**: Gemini (free) or OpenAI
3. **Configure Database**: PostgreSQL connection string
4. **Deploy**: Push to GitHub, Render auto-deploys
5. **Test**: Verify all features working
6. **Monitor**: Check logs and performance

---

## 📞 SUPPORT

For Render deployment issues:
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Support: https://render.com/support

---

**Status**: ✅ READY FOR PRODUCTION DEPLOYMENT
**Next**: Push to Render.com following the guide above
