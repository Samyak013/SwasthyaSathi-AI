# 🚨 URGENT: OTP & Gmail Credentials Fix Required

## CRITICAL ISSUE: Gmail Credentials Invalid

**Current Error:**
```
535-5.7.8 Username and Password not accepted
Error: Invalid login
```

**Root Cause:**
The `.env` file contains an INVALID Gmail app password:
- Current: `GMAIL_PASSWORD=nsqf smoq vuab qezj`
- This password is WRONG and needs to be replaced

---

## HOW TO FIX (5 minutes)

### Step 1: Get Real Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select `Mail` → `Windows Computer`
3. Click `Generate`
4. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)

### Step 2: Update .env
Replace in `.env`:
```
GMAIL_PASSWORD=YOUR_NEW_16_CHARACTER_PASSWORD_HERE
```

Example:
```
GMAIL_USER=sambgsr21@gmail.com
GMAIL_PASSWORD=hsqf smoq vjab qezj
```

### Step 3: Restart Server
```bash
npm run dev
```

---

## CURRENT STATUS

✅ **Working:**
- OTP generation (creates OTP record in database)
- OTP verification endpoint
- AI Chatbot
- All dashboards (Patient, Doctor, Pharmacy)
- Vite frontend (hot reload working)
- Database seeding with test data

❌ **Not Working:**
- Email sending (Gmail credentials invalid)

---

## TEST CREDENTIALS (Already Seeded)

| Role | ABHA ID | Purpose |
|------|---------|---------|
| Doctor | `22-1234-5678-9012` | Create prescriptions |
| Patient 1 | `22-1111-2222-3333` | View records, chat |
| Patient 2 | `22-4444-5555-6666` | Alternative patient |
| Pharmacy | `22-8888-9999-0000` | Verify prescriptions |

---

## DEPLOYMENT STATUS

### Local Development ✅
- Backend: `http://localhost:5000`
- Frontend: Works (served from Express)
- Database: Connected

### Netlify Frontend ✅
- Deployed at: https://swastyaai.netlify.app
- Status: Working
- Issue: Backend URL needs production Render URL

### Render Backend
- Build fixed (tsx in dependencies)
- Deployment: Pending Gmail credentials fix
- Auto-redeploy enabled

---

## NEXT IMMEDIATE STEPS

1. **Update Gmail credentials** (THIS IS BLOCKING EVERYTHING)
2. Test OTP flow locally
3. Deploy fixes to GitHub
4. Render will auto-redeploy
5. Netlify will auto-deploy frontend to use Render backend

---

## FILES TO UPDATE AFTER GETTING CREDENTIALS

Once you provide the correct Gmail app password:
1. Update `.env` with `GMAIL_PASSWORD=xxxx xxxx xxxx xxxx`
2. Run: `git add .env && git commit -m "Update Gmail credentials"`
3. Push: `git push`

That's it! Everything else is ready.
