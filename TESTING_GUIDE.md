# SwasthyaSathi-AI - Complete Testing Guide

## 🎯 Overview

Your healthcare application now has a **complete real-world OTP authentication system** with support for:
- ✅ Email-based OTP
- ✅ SMS-based OTP  
- ✅ Multiple contact methods
- ✅ Three separate dashboards (Doctor, Patient, Pharmacy)

---

## 📋 Login Credentials

### 👨‍⚕️ **DOCTOR Dashboard**
```
ABHA ID: 22-1234-5678-9012
Name: Dr. Rajesh Kumar
Email: rajesh.kumar@hospital.com
Phone: +91-9876543210
```

**Doctor Access:**
- View all patients
- Create prescriptions
- Access analytics
- Manage appointments
- Chat with patients

---

### 👨‍🏥 **PATIENT Dashboards** (Choose Any)

#### **Patient 1**
```
ABHA ID: 22-1111-2222-3333
Name: Priya Sharma
Email: priya.sharma@email.com
Phone: +91-9123456789
```

#### **Patient 2**
```
ABHA ID: 22-4444-5555-6666
Name: Arjun Patel
Email: arjun.patel@email.com
Phone: +91-9876501234
```

**Patient Access:**
- View health records
- Access prescriptions
- Chat with doctors
- View appointments
- Check reminders
- Emergency SOS

---

### 💊 **PHARMACY Dashboards** (Choose Any)

#### **Pharmacy 1**
```
ABHA ID: 22-8888-9999-0000
Name: Medcare Pharmacy
Email: medcare@pharmacy.com
Phone: +91-9765432100
```

#### **Pharmacy 2**
```
ABHA ID: 22-7777-8888-9999
Name: MediPharm Store
Email: medipharm@pharmacy.com
Phone: +91-9123476543
```

**Pharmacy Access:**
- Verify prescriptions via QR code
- Dispense medications
- Track prescription status
- Manage inventory

---

## 🔐 How to Login

### **Step 1: Choose Login Method**
- Open http://localhost:5000
- Select either "ABHA ID" or "Aadhaar" tab

### **Step 2: Enter Your ID**
- Type the ABHA ID from the credentials above
- Click "Continue →"

### **Step 3: Select OTP Method**
Choose how you want to receive your OTP:
- 📧 **Via Email** - Sends to registered email
- 📱 **Via SMS** - Sends to registered phone
- 📧📱 **Both** - Sends to both email and phone

Click "Send OTP"

### **Step 4: Receive OTP**

#### **In DEVELOPMENT MODE:**
When you click "Send OTP", the OTP will be displayed in:
1. **Server Console** - Look at the terminal where you ran `npm run dev`
2. **Browser Console** - Press F12, check the Console tab

Example output in console:
```
📧 OTP EMAIL to priya.sharma@email.com: 512847
📱 OTP SMS to +91-9123456789: 512847
```

### **Step 5: Enter OTP**
- Enter the 6-digit OTP you see in the console
- Click "Verify & Login"

### **Success! 🎉**
You'll be logged into your respective dashboard

---

## Dashboard Features

### 👨‍⚕️ **DOCTOR Dashboard**

#### **Patients List**
- View all patients' information
- Filter by conditions
- Quick actions

#### **Create Prescription**
- Select patient
- Add diagnosis & symptoms
- Add medications with dosage
- Add lab tests
- AI-powered drug interaction checking
- Digital signature

#### **Analytics**
- Patient demographics
- Health trends
- Disease statistics
- Appointment analytics

#### **Chat**
- Real-time messaging with patients
- Prescription sharing
- Health updates

---

### 👨‍🏥 **PATIENT Dashboard**

#### **Health Records**
- View all medical records
- Lab reports
- Imaging reports
- Vital signs history
- AI-generated summaries

#### **Prescriptions**
- Received prescriptions from doctors
- Download as PDF
- Generate QR code
- Track status
- Medicine reminders

#### **Appointments**
- View scheduled appointments
- Book new appointments
- Cancel appointments
- Appointment history

#### **Chat with Doctors**
- Direct messaging
- Ask health questions
- Receive guidance

#### **Reminders**
- Medication reminders
- Appointment reminders
- Health check reminders

#### **Emergency SOS**
- One-tap emergency alert
- Share location
- Notify emergency contacts

---

### 💊 **PHARMACY Dashboard**

#### **Active Prescriptions**
- View pending prescriptions
- Scan QR codes to verify
- Check patient details

#### **Dispense Medication**
- Confirm dispense
- Print labels
- Record timestamp

#### **Prescription History**
- View dispensed prescriptions
- Track quantities
- Print reports

#### **Inventory**
- Track stock levels
- Popular medicines
- Low stock alerts

---

## 🧪 Testing All 3 Dashboards

### **Test Scenario: Patient Journey**

#### **1. Doctor Creates Prescription**
```
1. Login as: Dr. Rajesh Kumar (22-1234-5678-9012)
2. Go to Patients section
3. Select: Priya Sharma
4. Click "Create Prescription"
5. Add diagnosis: "Hypertension"
6. Add medicine: "Amlodipine 5mg"
7. Submit prescription
```

#### **2. Patient Receives Prescription**
```
1. Login as: Priya Sharma (22-1111-2222-3333)
2. Go to "Prescriptions"
3. You'll see the prescription from Dr. Rajesh Kumar
4. Download/View QR code
```

#### **3. Pharmacy Verifies & Dispenses**
```
1. Login as: Medcare Pharmacy (22-8888-9999-0000)
2. Go to "Active Prescriptions"
3. Scan/View the QR code from patient's prescription
4. Verify patient details
5. Click "Dispense"
6. Mark as completed
```

---

## 📧 Real-World Integration

### **Email Integration (for Production)**
1. Configure Gmail credentials in `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-app-password
   ```

2. Or use SendGrid:
   ```
   SENDGRID_API_KEY=your-sendgrid-key
   ```

### **SMS Integration (for Production)**
1. Configure Twilio in `.env`:
   ```
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

2. Or use AWS SNS:
   ```
   AWS_SNS_REGION=us-east-1
   AWS_SNS_ACCESS_KEY=your-key
   AWS_SNS_SECRET_KEY=your-secret
   ```

---

## 🔄 Real-Time Features

### **WebSocket Chat**
- Real-time messaging between doctors and patients
- Instant notifications
- Message history

### **Appointment Notifications**
- Automatic reminders before appointments
- Status updates
- Cancellation alerts

### **Health Alerts**
- Abnormal vital signs
- Medication side effects
- Emergency SOS notifications

---

## 📊 Sample Data Available

The application comes with pre-seeded sample data:

### **Users**
- 3 Doctors
- 3 Patients
- 2 Pharmacies

### **Pre-existing Data**
- 3 Prescriptions with medications
- 3 Appointments scheduled
- 4 Health records

### **Test Relationships**
- Dr. Rajesh Kumar has prescribed to both patients
- All prescriptions are active and ready to dispense
- Appointments are upcoming

---

## 🚀 Running the Application

### **Development**
```bash
npm run dev
# Visit http://localhost:5000
```

### **Production Build**
```bash
npm run build
npm start
# Visit http://localhost:5000
```

### **Database Reset**
```bash
# Delete database and reseed with sample data
npm run dev
# Data is auto-seeded on first run
```

---

## ⚙️ Configuration

### **.env File**
```env
# Database
DATABASE_URL=your-database-url

# Email
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-key

# SMS (optional)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Server
PORT=5000
NODE_ENV=development
HOST=localhost
```

---

## 🛠️ Troubleshooting

### **OTP Not Showing in Console**
```
1. Make sure NODE_ENV=development
2. Check both browser console (F12) and terminal
3. Look for lines starting with "📧" or "📱"
```

### **Login Fails**
```
1. Verify ABHA ID is correct
2. Check OTP hasn't expired (5 minute limit)
3. Maximum 3 attempts per OTP
```

### **Dashboard Not Loading**
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try different browser
3. Check console for errors (F12)
```

### **Port Already in Use**
```
1. Change PORT in .env
2. Or kill existing process: lsof -ti:5000 | xargs kill -9
3. Or in Windows: netstat -ano | findstr :5000
```

---

## 📁 Generated Files

### **Spreadsheets with Test Data**
- `SwasthyaSathi_Login_Guide.xlsx` - Complete login instructions
- `SwasthyaSathi_Sample_Data.xlsx` - All sample data details

### **Python Scripts**
- `generate_login_guide.py` - Generates login guide
- `generate_sample_data.py` - Generates sample data

---

## ✅ Feature Checklist

- [x] Email/SMS based OTP system
- [x] Multi-channel delivery (email, SMS, both)
- [x] Three separate dashboards
- [x] Role-based access control
- [x] Real-time chat between users
- [x] Prescription management with QR codes
- [x] Health records tracking
- [x] Appointment scheduling
- [x] Medication reminders
- [x] Emergency SOS
- [x] Analytics dashboard
- [x] AI health assistant (with OpenAI key)
- [x] Drug interaction checking
- [x] digital signatures
- [x] Consent management

---

## 🔗 Quick Links

- **Login**: http://localhost:5000
- **API Docs**: http://localhost:5000/api
- **Dashboard**: Automatically redirects after login

---

## 📞 Support

For testing or issues:
1. ✅ Check the console (F12) for error messages
2. ✅ Verify credentials from login guide
3. ✅ Make sure OTP is within 5 minutes
4. ✅ Check database connection if needed

---

## 🎓 Learning Resources

### **Understanding the System**

**OTP Flow:**
1. User enters ABHA ID → 
2. Selects email/SMS/both → 
3. Server generates 6-digit OTP → 
4. Sends via selected channel → 
5. User enters OTP → 
6. Verified and logged in

**Data Flow:**
1. User login → 
2. Stored in session → 
3. Redirected to dashboard → 
4. Fetch user data → 
5. Display dashboard

**Prescription Flow:**
1. Doctor creates prescription →
2. Patient receives notification → 
3. Pharmacy verifies QR code → 
4. Pharmacy dispenses → 
5. Patient notified of dispensing

---

**All 3 dashboards are fully functional and connected!** 🎉

Enjoy testing your healthcare platform!
