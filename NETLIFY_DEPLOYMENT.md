# SwasthyaSathi-AI Deployment Guide

All latest features and updates have been pushed to GitHub and are ready for Netlify deployment!

## ✅ Latest Features Deployed

### 🔐 Real Gmail Email OTP System
- 6-digit numeric OTP
- 5-minute expiry
- 3-attempt limit
- Email+ABHA ID verification
- Branded HTML email templates

### 👨‍⚕️ Doctor Dashboard
✅ Patient Management & Search
✅ Records Tab - Medical conditions & history
✅ Messages Tab - Real-time patient messaging
✅ Schedule Tab - Appointment booking
✅ Prescription Creator - Patient ABHA ID search & prescription sharing

### 👤 Patient Dashboard  
✅ Health Records Timeline
✅ Prescriptions Tab with **Detail Modal**
✅ Prescription Details:
   - Full diagnosis & symptoms
   - Medicine list with dosage/frequency/duration/instructions
   - Lab tests & special notes
   - Doctor information & verification status
✅ Medication Reminders
✅ AI Health Insights

### 💊 Pharmacy Dashboard
✅ Prescription management

### 📊 Analytics Dashboard
✅ Statistics & trends

## 🚀 Netlify Deployment Setup

### Step 1: Configure Environment Variables on Netlify

1. Go to your Netlify project dashboard
2. Navigate to **Settings** → **Build & Deploy** → **Environment**
3. Add these keys (copy from `.env.example`):

```
OPENAI_API_KEY = your-openai-api-key
GMAIL_USER = your-email@gmail.com
GMAIL_PASSWORD = your-app-password
PORT = 5000
NODE_ENV = production
```

### Step 2: Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or your device)
3. Copy the **16-character password**
4. This is your `GMAIL_PASSWORD` value

### Step 3: Deploy

- Push code to GitHub (already done ✅)
- Netlify will auto-deploy on push
- Check the deploy log for status

### Step 4: Test the Deployment

After deployment is live:

1. Visit your Netlify URL
2. Use test credentials:
   - **Doctor**: `22-1234-5678-9012`
   - **Patient**: `22-1111-2222-3333`
   - **Email for OTP**: Use the email in GMAIL_USER

3. Real OTP emails will be sent via Gmail

## 📝 Test Credentials

| Role | ABHA ID | Email |
|------|---------|-------|
| Doctor | 22-1234-5678-9012 | samyak@acpce.ac.in |
| Patient 1 | 22-1111-2222-3333 | samyak@acpce.ac.in |
| Patient 2 | 22-4444-5555-6666 | samyak@acpce.ac.in |
| Pharmacy | 22-8888-9999-0000 | samyak@acpce.ac.in |

## 🔧 Local Development

To run locally:

```bash
# Install dependencies
npm install

# Create .env file from .env.example
cp .env.example .env

# Add your credentials to .env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## ✨ Latest Commit

Commit: **bcf2c7e** - Add Gmail OTP configuration to .env.example

All changes are **production-ready** and committed to main branch!

---

For issues or setup help, check the console logs during deployment.
