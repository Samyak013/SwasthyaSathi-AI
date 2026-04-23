# 🏥 Swashtya Sathi AI - Quick Start Guide for Presentation

## Project Overview
**Swashtya Sathi AI** is an AI-powered healthcare platform integrating ABHA (Ayushman Bharat Digital Mission) with multi-language support and advanced medical features.

### Key Features Demonstrated
- ✅ Multi-role authentication (Doctor, Patient, Pharmacy)
- ✅ Medical AI chatbot (3 languages: English, Hindi, Marathi)
- ✅ Ayurveda & Homeopathy recommendations
- ✅ Nearby facilities map integration
- ✅ Pharmacy management system
- ✅ Prescription management with QR verification
- ✅ Health records timeline
- ✅ Multi-language UI with language switcher

---

## 🚀 Running the Application

### Prerequisites
- Node.js 18+ installed
- npm package manager

### Start Development Server
```bash
cd Swashtya-sathi-ai
npm run dev
```

**Server runs on**: http://127.0.0.1:5000

---

## 🔐 Test Credentials (Pre-seeded)

### Doctor Login
- **ABHA ID**: `22-1234-5678-9012`
- **Role**: Doctor
- **Features**: Manage patients, create prescriptions, view analytics

### Patient Login
- **ABHA ID**: `22-1111-2222-3333`
- **Role**: Patient
- **Features**: Health records, prescriptions, AI assistant, nearby facilities

### Pharmacy Login
- **ABHA ID**: `22-8888-9999-0000`
- **Email**: samyak@acpce.ac.in
- **Role**: Pharmacy
- **Features**: Prescription verification, inventory management, low stock alerts

---

## 📱 Using OTP Login

### OTP Flow
1. Select role and enter ABHA ID
2. Click **"Send OTP"**
3. OTP is sent to registered email (or use test OTP: check server console)
4. Enter OTP and click **"Verify & Login"**

**Note**: For demo purposes, you can:
- Check server terminal for OTP logs
- Use any 6-digit number if email access is unavailable
- Server console shows: `✅ OTP for testing: XXXXXX`

---

## 🎨 Key Demo Flows

### 1. **Pharmacy Dashboard**
- Login as Pharmacy (ABHA: 22-8888-9999-0000)
- View pending prescriptions tab
- See inventory with low stock alerts
- Click "Verify" to verify via QR
- Click "Restock" to manage inventory

### 2. **Patient Dashboard**
- Login as Patient (ABHA: 22-1111-2222-3333)
- View **4 Tabs**:
  - **Health Records**: Medical history timeline
  - **Prescriptions**: Active prescriptions from doctors
  - **Facilities** (NEW): Maps with nearby hospitals/clinics
  - **AI Assistant** (NEW): Medical chatbot in 3 languages

### 3. **Doctor Dashboard**
- Login as Doctor (ABHA: 22-1234-5678-9012)
- View **4 Tabs**:
  - **Records**: Patient medical conditions
  - **Message**: Patient communications
  - **Schedule**: Appointment management
  - **Facilities** (NEW): Maps for referrals

### 4. **Multi-Language Demo**
- Login to any dashboard
- Click **language selector** (top-right header with flags)
- Switch between:
  - 🇬🇧 English
  - 🇮🇳 हिन्दी (Hindi)
  - 🇮🇳 मराठी (Marathi)
- All AI responses and chat adapt to selected language

### 5. **AI Medical Chatbot Demo**
- Go to AI Assistant tab in any dashboard
- Ask medical questions:
  - ✅ "What are symptoms of diabetes?"
  - ✅ "How to treat fever naturally (Ayurveda)?"
  - ✅ "What homeopathy remedies for cough?"
  - ❌ Will reject: "What's the weather?" (non-medical)

### 6. **Prescription & QR Workflow**
- Doctor creates prescription (PrescriptionCreator tab)
- QR code auto-generated
- Pharmacy scans QR to verify
- Patient downloads for pharmacy

---

## 🗺️ Maps Demo
**Nearby Facilities Feature** (Patient & Doctor Dashboards):
- Shows hospitals, clinics, pharmacies on map
- Distance-based sorting
- Real-time location integration
- One-click navigation

---

## 💬 AI Medical Chatbot Features

### Supported Topics
✅ Diabetes management  
✅ Hypertension care  
✅ Heart health  
✅ Exercise recommendations  
✅ Medication info  
✅ Ayurveda doshas (Vata, Pitta, Kapha)  
✅ Homeopathy treatments  
✅ General wellness  

### Language Support
- 🇬🇧 **English**: Full medical terminology
- 🇮🇳 **Hindi**: हिंदी में चिकित्सा सहायता
- 🇮🇳 **Marathi**: मराठीत आरोग्य मार्गदर्शन

---

## 🛠️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: Drizzle ORM (with in-memory fallback)
- **UI Components**: Radix UI + Tailwind CSS
- **AI**: Google Gemini API / OpenAI (with safe fallbacks)
- **Real-time**: WebSocket for chat
- **Multi-language**: Custom LanguageContext

### Project Structure
```
client/src/
├── components/
│   ├── PharmacyPortal.tsx (NEW: Full UI)
│   ├── NearbyFacilitiesMap.tsx (NEW: Maps)
│   ├── PatientDashboard.tsx (UPDATED: 4 tabs)
│   ├── DoctorDashboard.tsx (UPDATED: 4 tabs)
│   ├── AIChatbot.tsx (Medical AI - 3 languages)
│   └── ...other components
├── context/
│   └── LanguageContext.tsx (NEW: Global language state)
└── App.tsx (UPDATED: LanguageProvider wrapper)

server/
├── routes.ts (UPDATED: /api/pharmacy/prescriptions endpoint)
├── openai.ts (Medical AI filtering & responses)
├── storage.ts (OTP management)
└── seed.ts (Test data)
```

---

## 📊 What's Different from Previous Version

### ✨ **What's New**
1. **Enhanced Pharmacy Dashboard** - Full inventory + prescription tabs
2. **Maps Integration** - Real-world facility search (Patient & Doctor)
3. **Language Selector** - Global UI language switching (EN/HI/MR)
4. **Improved OTP System** - ABHA ID-based simplified storage
5. **Medical AI Prioritization** - Strict medical-only filtering
6. **Ayurveda & Homeopathy** - Full knowledge base in AI responses

### 🔧 **Technical Improvements**
- Fixed 401 Pharmacy authentication errors
- Eliminated email matching issues (now uses ABHA ID)
- Added TypeScript strict mode compliance
- Zero console errors on startup
- HMR (hot reload) working perfectly

---

## 🐛 Troubleshooting

### Issue: "Server cannot connect"
**Solution**: Ensure server is running (`npm run dev`) and port 5000 is free

### Issue: "OTP not received"
**Solution**: 
- Check server console for OTP logs
- Email send is async (check email after 30s)
- For demo: use any 6-digit OTP if email unavailable

### Issue: "Language not switching"
**Solution**: 
- Refresh page after language change
- Clear localStorage if stuck: `localStorage.clear()`
- Language selector must be visible (only on dashboard)

### Issue: "Maps not loading"
**Solution**: 
- Make sure you're on a Patient or Doctor dashboard
- In Facilities tab, maps should load within 2 seconds
- Check browser console for errors

### Issue: "AI Chat not responding"
**Solution**:
- API keys optional (uses safe defaults)
- Ensure message is medical-related
- Try asking: "What is diabetes?"

---

## 📈 Presentation Talking Points

### 1. **Multi-Role Platform**
- Different UIs for doctor/patient/pharmacy
- Role-based access control

### 2. **AI as Core Feature**
- Medical-only filtering (prevents off-topic questions)
- Ayurveda & Homeopathy integration
- Language adaptation in real-time

### 3. **ABHA Integration**
- ABHA ID-based authentication
- Patient health records linkage
- Prescription tracking

### 4. **Real-World Features**
- Maps with actual facility search
- Inventory management for pharmacies
- Multi-language UI (unprecedented in India's rural healthcare)

### 5. **User Experience**
- Seamless OTP login
- Language switcher in header
- Responsive design for mobile

---

## 🎯 Demo Script (15 mins)

### Minute 1-2: Welcome
- Show home page with 3 roles
- Explain Ayushman Bharat integration

### Minute 3-5: Patient Demo
- Login as Patient (OTP demo)
- Show Health Records tab
- Click Facilities tab → Show Maps
- Demonstrate language switch (Hindi/Marathi)

### Minute 6-9: AI Chatbot Demo
- Ask medical question in English
- Show response in Hindi
- Ask another question → responds in Marathi
- Demonstrate it rejects non-medical questions

### Minute 10-12: Pharmacy Demo
- Login as Pharmacy
- Show Prescriptions tab (pending/verified)
- Show Inventory with low stock alerts
- Drag to scroll through medicines

### Minute 13-15: Doctor Demo
- Login as Doctor
- Show patient management
- Show Facilities tab for referrals
- Explain how prescriptions flow through system

---

## 📞 Support

**GitHub**: [Your-Repo-Link]  
**Email**: samyak@acpce.ac.in  
**Website**: http://127.0.0.1:5000

---

**Status**: ✅ **PRODUCTION-READY FOR DEMO**  
**Last Updated**: 2025  
**Team**: [Your Team Name]
