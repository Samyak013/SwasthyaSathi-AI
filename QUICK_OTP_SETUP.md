# 🚀 Quick Start - Real OTP in 5 Minutes!

## Step 1: Get Gmail App Password (2 mins)

### Go to Google Account
```
https://myaccount.google.com/security
```

### Enable 2-Factor Auth
1. Click "2-Step Verification"
2. Follow steps
3. Verify phone number

### Go to App Passwords
```
https://myaccount.google.com/apppasswords
```
1. Select **Mail** → **Windows Computer**
2. Google shows: `xxxx xxxx xxxx xxxx` (with spaces!)
3. **COPY IT EXACTLY** (spaces included)

---

## Step 2: Create .env File (1 min)

### In Your Project Folder
```
C:\Users\samya\OneDrive\Desktop\Swashtya-sathi-ai
```

### Create File: `.env`

**Windows Explorer:**
1. Right-click → New → Text Document
2. Name: `.env` (important: starts with dot!)
3. Edit it

**Add this content:**
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

**EXAMPLE:**
```env
GMAIL_USER=myemail@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

Save and close the file.

---

## Step 3: Restart Server (1 min)

```bash
npm run dev
```

You'll see:
```
✅ Gmail transporter configured
```

---

## Step 4: Test Real OTP (1 min)

1. **Go to:** `http://localhost:5000`
2. **Enter ABHA ID:** `22-1234-5678-9012`
3. **Select:** Email
4. **Click:** Send OTP
5. **Check Your Gmail** 📧

### You'll Receive:
```
From: noreply@swasthyasathi.com
Subject: Your SwasthyaSathi OTP - 512847

Your OTP is: 512847
Valid for 5 minutes
```

6. **Copy OTP** → **Enter it** → **Login!** ✅

---

## 🆘 Troubleshooting

### "Gmail transporter not configured"
❌ .env file not found or GMAIL_USER empty
✅ Check .env file exists in project root
✅ Check contents are correct

### "Gmail App Password" error
❌ Old Gmail password used
✅ Must use 16-char App Password from Google
✅ Include spaces exactly as shown

### OTP still showing in console
❌ NODE_ENV might be set to "development"
❌ Or restart server wasn't done
✅ Make sure .env has no NODE_ENV or NODE_ENV=production
✅ Restart: `npm run dev`

### Email not received
❌ Check spam folder
❌ Wait 30 seconds
❌ Try again with new OTP
✅ Check Gmail account credentials are correct

---

## 📧 Test with All Users

| User | ABHA ID | Notes |
|------|---------|-------|
| Doctor | 22-1234-5678-9012 | rajesh.kumar@hospital.in |
| Patient 1 | 22-1111-2222-3333 | priya.sharma@email.com |
| Patient 2 | 22-4444-5555-6666 | amit.patel@email.com |
| Pharmacy | 22-8888-9999-0000 | contact@healthplus.com |

All receive real OTP via their registered email! 📧

---

## Optional: Add SMS (Twilio)

### Go to Twilio Console
```
https://www.twilio.com/console
```

### Get Credentials
1. Account SID
2. Auth Token
3. Phone Number (assigned by Twilio)

### Add to .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxx...
TWILIO_AUTH_TOKEN=xxxxx...
TWILIO_PHONE_NUMBER=+1415xxx...
```

### Test SMS
1. Select "SMS" or "Both"
2. Click Send OTP
3. Check your phone! 📱

---

## ✅ Done!

Your system now sends **real OTP emails** to users! 🎉

- ✅ Beautiful email template
- ✅ Professional branding
- ✅ 5-minute expiration
- ✅ Instant delivery

**Test it now and see OTP in your inbox!** 📧
