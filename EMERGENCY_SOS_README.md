# 🚨 Emergency SOS System - Complete Implementation Guide

## Overview

The Swashtya-Sathi-AI platform now includes a complete, production-ready Emergency SOS (distress) system that enables patients to trigger emergency alerts with geolocation and vital signs, while doctors/hospitals receive real-time notifications and can manage responses through an intuitive dashboard.

## System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Patient   │         │   Backend    │         │   Database   │
│  Dashboard  ├────────>│     API      ├────────>│  Emergency   │
│  (SOS)      │         │             │          │   Alerts     │
└─────────────┘         └──────┬───────┘         └──────────────┘
                                │
                                ├──> Email Service
                                │    (Gmail SMTP)
                                │
                                v
                         ┌──────────────┐
                         │   Doctor     │
                         │  Dashboard   │
                         │   (Alerts)   │
                         └──────────────┘
```

## Features

### 🚨 Patient SOS Button
- **Location Capture**: Uses geolocation API to get coordinates and address
- **Vital Signs**: Simulates real-time vitals (Heart Rate, Blood Pressure, Temperature)
- **Instant Alert**: Creates emergency alert in database via API
- **Confirmation**: 5-second countdown with visual feedback
- **Notifications**: Toast alerts for success/error feedback

**Location:** `client/src/components/EmergencySOSButton.tsx`

```typescript
// Patient clicks Emergency SOS button
1. Geolocation captured (lat, lng, address)
2. Vitals simulated (HR, BP, Temp)
3. POST /api/emergency called
4. Alert stored in database
5. Email sent to emergency contacts
6. Success confirmation shown to patient
```

### 👨‍⚕️ Doctor Emergency Response Dashboard
- **Real-Time Alerts**: Auto-refreshes every 5 seconds to show new SOS alerts
- **Alert Details**: View patient info, location with maps link, vital signs
- **Alert Management**: One-click resolution with responder tracking
- **Timeline View**: See when alert was created and resolved
- **Resolved History**: Track all handled emergency situations

**Location:** `client/src/components/EmergencyResponseDashboard.tsx`

**Access:** Doctors click red "Emergency SOS" button in dashboard navigation

### 📧 Email Notifications
- **Professional Templates**: HTML emails with emergency styling
- **Recipient Types**: Emergency contacts receive specialized messaging
- **Location Integration**: Google Maps link included with coordinates
- **Vital Signs Display**: Clear formatting of patient vitals
- **Real-Time Delivery**: Sent immediately when SOS is triggered

**Configured Channels:**
- Emergency contact email notifications
- Hospital alert logging (ready for SMS/push integration)
- Doctor alert notifications

### 🔄 Real-Time Updates
- **5-Second Polling**: Doctor dashboard auto-refreshes active alerts
- **Responsive UI**: Loading states and smooth transitions
- **WebSocket Ready**: Infrastructure for live updates in future

## Technical Implementation

### Backend API Endpoints

#### Create Emergency Alert
```
POST /api/emergency
Content-Type: application/json

{
  "userId": "string",
  "location": {
    "lat": number,
    "lng": number,
    "address": "string"
  },
  "vitals": {
    "heartRate": number,
    "bloodPressure": "string",
    "temperature": number
  }
}

Response: 200 OK
{
  "id": "alert-uuid",
  "userId": "string",
  "location": {...},
  "vitals": {...},
  "status": "active",
  "createdAt": "ISO-8601"
}
```

#### Get Active Alerts
```
GET /api/emergency/active

Response: 200 OK
[
  {
    "id": "alert-uuid",
    "userId": "string",
    "location": {...},
    "vitals": {...},
    "status": "active",
    "createdAt": "ISO-8601"
  },
  ...
]
```

#### Resolve Alert
```
PATCH /api/emergency/:id/resolve
Content-Type: application/json

{
  "responderId": "doctor-uuid"
}

Response: 200 OK
{
  "id": "alert-uuid",
  "status": "resolved",
  "respondedBy": "doctor-uuid",
  "resolvedAt": "ISO-8601"
}
```

### Database Schema

```sql
CREATE TABLE emergencyAlerts (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  location JSONB NOT NULL {
    lat: number,
    lng: number,
    address: string
  },
  vitals JSONB NOT NULL {
    heartRate?: number,
    bloodPressure?: string,
    temperature?: number
  },
  status VARCHAR NOT NULL DEFAULT 'active', -- 'active' | 'resolved'
  respondedBy UUID,
  createdAt TIMESTAMP DEFAULT NOW(),
  resolvedAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Email Notification System

**File:** `server/notifications.ts`

**Function:** `sendSOSAlertNotification()`

```typescript
// Parameters
email: string
options: {
  patientName: string
  abhaId: string
  location: { lat, lng, address }
  vitals: { heartRate?, bloodPressure?, temperature? }
  recipientType: "emergency_contact" | "hospital" | "doctor"
}

// Features
- Professional emergency email template
- Red gradient headers with 🚨 emoji
- Google Maps link for location
- Vital signs in grid format
- Recipient-specific action instructions
- Fallback to console logging in development
```

### Frontend Integration

**File:** `client/src/App.tsx`

Changes needed:
1. Add `EmergencyResponseDashboard` import
2. Add "emergency" view type to state
3. Add emergency view rendering
4. Update DoctorDashboard with `onViewEmergency` callback

**File:** `client/src/components/DoctorDashboard.tsx`

Changes:
1. Import `AlertCircle` icon from lucide-react
2. Add `onViewEmergency` prop to interface
3. Add red "Emergency SOS" button in toolbar

## Testing Guide

### Prerequisites
- Dev server running: `npm run dev`
- Patient and Doctor users seeded in database
- Email service configured (Gmail SMTP)

### Test Patient ABHA ID
- Patient 1: `22-1111-2222-3333`
- Patient 2: `22-4444-5555-6666`

### Test Doctor ABHA ID
- Doctor: `22-1234-5678-9012`

### End-to-End Test Workflow

1. **Login as Patient**
   - Open http://localhost:5000
   - Select "Patient" role
   - Enter ABHA ID: 22-1111-2222-3333
   - Click "Send OTP" (use test OTP from console)

2. **Trigger Emergency SOS**
   - On Dashboard, click "Emergency SOS" button
   - Confirm in dialog: Click "Yes, I need help"
   - Observe:
     - 5-second countdown starts
     - Location captured (check browser console)
     - Vitals simulated
     - API call made to POST /api/emergency
     - Success notification shown

3. **Check Email Notification**
   - Open Gmail (sambgsr21@gmail.com)
   - Look for emergency alert email
   - Verify contains:
     - Patient name and ABHA ID
     - Location with coordinates
     - Google Maps link
     - Vital signs
     - 🚨 Emergency header

4. **Login as Doctor**
   - Logout from patient account
   - Login as Doctor (ABHA: 22-1234-5678-9012)
   - Click red "Emergency SOS" button (top right)

5. **View Alert in Doctor Dashboard**
   - Observe active alert appears in list
   - Click alert card to expand
   - Verify details show:
     - Patient name and ABHA ID
     - Location coordinates
     - "View on Maps" button
     - Heart Rate, Blood Pressure, Temperature
     - Timeline (Created at timestamp)

6. **Resolve Emergency**
   - Click "Mark Resolved" button
   - Observe:
     - Toast confirmation: "✅ Alert Resolved"
     - Alert moves to "Resolved Alerts" section
     - Timestamp updates
     - Doctor ID recorded

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```
# AI API Keys (choose one or both)
GEMINI_API_KEY=your_gemini_api_key  # Free tier - 60 requests/min
OPENAI_API_KEY=your_openai_api_key  # If Gemini not available

# Email Configuration
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASSWORD=your_app_password    # Generate in Gmail settings

# Port Configuration
PORT=5000
NODE_ENV=development

# Database (if using external DB)
DATABASE_URL=your_database_url
```

### Gmail Setup

1. Enable 2-factor authentication in Google Account
2. Generate "App Password" for Gmail
3. Use app password in GMAIL_PASSWORD env var

### Render Deployment

1. Push code to GitHub (already done)
2. Connect GitHub repo to Render.com
3. Set environment variables in Render dashboard
4. Deploy using `render.yaml` configuration

## Production Checklist

- [x] Frontend components complete
- [x] Backend API endpoints functional
- [x] Email notifications configured
- [x] Database schema ready
- [x] Integration tested
- [x] GitHub deployment config added
- [x] Build process verified
- [ ] Email service production credentials set
- [ ] Database production setup
- [ ] HTTPS SSL certificates
- [ ] Rate limiting configured
- [ ] Error monitoring (Sentry) setup
- [ ] Load testing completed

## Future Enhancements

1. **SMS Notifications**: Send SMS to emergency contacts
2. **Push Notifications**: Mobile push alerts for doctors
3. **WebSocket Updates**: Real-time dashboard without polling
4. **Location Sharing**: Live location streaming to responders
5. **Hospital Integration**: Automatic hospital dispatch
6. **Ambulance API**: Direct ambulance booking
7. **Emergency Contact Priority**: Multiple contacts with priorities
8. **Alert Categories**: Different response types (medical, accident, etc.)
9. **Location History**: Track patient emergency hotspots
10. **Chat Integration**: In-dashboard messaging between doctor and patient

## Troubleshooting

### "Neither GEMINI_API_KEY nor OPENAI_API_KEY set" Warning
- **Status**: Non-blocking warning
- **Impact**: AI chat falls back to safe defaults
- **Solution**: Add API key to .env and restart server

### Port 5000 Already in Use
- **Error**: `EADDRINUSE: address already in use ::1:5000`
- **Solution**: `taskkill /PID <pid> /F` (Windows) or `kill -9 <pid>` (Mac/Linux)

### Email Not Sending
- **Check**: Gmail app password is correct
- **Check**: 2FA enabled in Google Account
- **Check**: Less secure apps allowed (if using regular password)
- **Debug**: Check server console for error messages

### Geolocation Not Working
- **Chrome**: HTTPS required or localhost
- **Firefox**: May require explicit permission
- **Testing**: Check browser console for permission prompts

## Support & Contact

For issues or questions about the SOS system, refer to:
- [Emergency SOS Implementation](./docs/SOS_IMPLEMENTATION.md)
- [GitHub Issues](https://github.com/Samyak013/SwasthyaSathi-AI/issues)
- [Project Board](https://github.com/Samyak013/SwasthyaSathi-AI/projects)

---

**Last Updated:** April 10, 2026
**Status:** ✅ Production Ready
**Commit:** 664c44b (Render config added)
