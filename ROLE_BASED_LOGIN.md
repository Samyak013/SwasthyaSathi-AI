# Role-Based Login System

## Overview
The Swashtya Sathi AI platform now implements a **dedicated login system for each role** (Doctor, Patient, Pharmacy), providing a tailored experience for each user type.

## Architecture

### Components Created

#### 1. **RoleLoginSelection.tsx** (Landing Page)
- First page users see when visiting the app
- Displays three role cards with descriptions
- Each card shows:
  - Role icon with gradient background
  - Description of features for that role
  - Example ABHA ID for that role
  - "Login as [Role]" button

**Features:**
- Beautiful gradient backgrounds (Green, Blue, Purple)
- Responsive grid layout (3 columns on desktop, stacked on mobile)
- Hover effects with shadow and lift animations
- Example credentials displayed for reference

#### 2. **DoctorLogin.tsx** (Green Theme)
- Specialized login page for healthcare providers
- Features:
  - Doctor image on the left (desktop only)
  - Green gradient theme (from-green-500 to-emerald-500)
  - Example: ABHA ID 22-1234-5678-9012
  - Step 1: Enter ABHA ID → Send OTP
  - Step 2: Verify 6-digit OTP from email
  - Role validation: Only allows doctor accounts to login
  - Back button to return to role selection

#### 3. **PatientLogin.tsx** (Blue Theme)
- Specialized login page for patients
- Features:
  - Blue gradient theme (from-blue-500 to-cyan-500)
  - Example: ABHA ID 22-1111-2222-3333
  - Step 1: Enter ABHA ID → Send OTP
  - Step 2: Verify 6-digit OTP from email
  - Role validation: Only allows patient accounts to login
  - Back button to return to role selection

#### 4. **PharmacyLogin.tsx** (Purple Theme)
- Specialized login page for pharmacy staff
- Features:
  - Purple gradient theme (from-purple-500 to-pink-500)
  - Example: ABHA ID 22-8888-9999-0000
  - Step 1: Enter ABHA ID → Send OTP
  - Step 2: Verify 6-digit OTP from email
  - Role validation: Only allows pharmacy accounts to login
  - Back button to return to role selection

### Updated Components

#### **App.tsx (Router Component)**
Modified the main auth flow:

```
Old Flow:
1. ABHALogin (generic) 
   ↓
2. RoleSelection (choose role - optional)
   ↓
3. Dashboard

New Flow:
1. RoleLoginSelection (choose role)
   ↓
2. Role-Specific Login (Doctor/Patient/Pharmacy)
   ↓
3. Dashboard
```

**Key Changes:**
- Removed old `ABHALogin` and `RoleSelection` components from render path
- Added separate state for `selectedRole`
- Router now handles 5 states: `"role-select"`, `"doctor-login"`, `"patient-login"`, `"pharmacy-login"`, `"dashboard"`
- Each login page validates the OTP against the selected role
- Session persistence works with new flow (saves role and user data)
- Dark mode toggle moved to dashboard header (not global)
- Logout button now styled as destructive with LogOut icon

## User Flow Diagram

```
┌─────────────────────────────────┐
│   RoleLoginSelection            │
│  (Choose Doctor/Patient/Pharm)  │
└──────────────┬──────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ↓          ↓          ↓
┌────────┐ ┌─────────┐ ┌────────┐
│Doctor  │ │Patient  │ │Pharmacy│
│Login   │ │Login    │ │Login   │
└────┬───┘ └────┬────┘ └───┬────┘
     │          │          │
     └──────────┼──────────┘
                ↓
        ┌───────────────┐
        │ OTP Screen    │
        │ (Email)       │
        ├───────────────┤
        │ 6-Digit Code  │
        └───────┬───────┘
                ↓
        ┌───────────────┐
        │ Role Validate │
        │ + Dashboard   │
        └───────────────┘
```

## Authentication Flow Details

### OTP Verification by Role
Each login page validates that the logged-in user has the correct role:

**Doctor Login:**
```typescript
if (data.user && data.user.role === "doctor") {
  onLogin?.(data);
} else {
  toast({
    title: "Error",
    description: "This ABHA ID is not registered as a doctor..."
  });
}
```

**Patient Login:** (validates role === "patient")
**Pharmacy Login:** (validates role === "pharmacy")

### Test Credentials

| Role    | ABHA ID              | Email                | Color Theme |
|---------|----------------------|----------------------|-------------|
| Doctor  | 22-1234-5678-9012   | samyak@acpce.ac.in  | Green       |
| Patient | 22-1111-2222-3333   | samyak@acpce.ac.in  | Blue        |
| Patient | 22-4444-5555-6666   | samyak@acpce.ac.in  | Blue        |
| Pharmacy| 22-8888-9999-0000   | samyak@acpce.ac.in  | Purple      |

## Styling & Design

### Theme Colors
- **Doctor:** Green gradient `from-green-500 to-emerald-500`
- **Patient:** Blue gradient `from-blue-500 to-cyan-500`
- **Pharmacy:** Purple gradient `from-purple-500 to-pink-500`

### Responsive Design
- Desktop: 2-column layout for role selection (image + form)
- Tablet/Mobile: Stack layout with form above image
- Full width on small screens with appropriate padding
- Cards have shadow and hover effects for better UX

## Features

1. **Separate Login Pages:** Each role has dedicated UI with role-specific styling
2. **Role Validation:** Backend validates user role during OTP verification
3. **Back Navigation:** Users can return to role selection without re-entering details
4. **Example Credentials:** Each login page shows example ABHA IDs
5. **Dark Mode Support:** All login pages work in light and dark themes
6. **Error Handling:** Clear error messages for invalid roles or verification failures
7. **Session Persistence:** Logs users back in after page refresh
8. **Loading States:** Visual feedback during OTP sending and verification
9. **Mobile Responsive:** Works seamlessly on all screen sizes
10. **Accessibility:** Proper labels, semantic HTML, keyboard navigation support

## Testing Instructions

### Test Doctor Login
1. Visit http://localhost:5000
2. Click "Login as Doctor"
3. Enter: `22-1234-5678-9012`
4. Click "Send OTP"
5. Check email for OTP (samyak@acpce.ac.in inbox)
6. Enter 6-digit OTP
7. ✅ Logged in as Doctor → See Doctor Dashboard

### Test Patient Login
1. Visit http://localhost:5000
2. Click "Login as Patient"
3. Enter: `22-1111-2222-3333` or `22-4444-5555-6666`
4. Click "Send OTP"
5. Check email for OTP
6. Enter 6-digit OTP
7. ✅ Logged in as Patient → See Patient Dashboard

### Test Pharmacy Login
1. Visit http://localhost:5000
2. Click "Login as Pharmacy"
3. Enter: `22-8888-9999-0000`
4. Click "Send OTP"
5. Check email for OTP
6. Enter 6-digit OTP
7. ✅ Logged in as Pharmacy → See Pharmacy Portal

### Test Role Validation
1. Try to login as Doctor with Patient ABHA ID (22-1111-2222-3333)
2. ❌ Should show error: "This ABHA ID is not registered as a doctor"

### Test Back Navigation
1. On any login page, click the "Back" button
2. ✅ Should return to role selection page
3. Try another role

### Test Session Persistence
1. Login with any role
2. See the dashboard
3. Press F5 to refresh page
4. ✅ Should still be logged in
5. Try logging out and refreshing
6. ✅ Should be back at role selection

## Code Structure

### File Organization
```
client/src/components/
├── RoleLoginSelection.tsx   (Role selection landing)
├── DoctorLogin.tsx          (Doctor auth UI)
├── PatientLogin.tsx         (Patient auth UI)
├── PharmacyLogin.tsx        (Pharmacy auth UI)
├── DoctorDashboard.tsx      (Existing - now with role indicator)
├── PatientDashboard.tsx     (Existing)
├── PharmacyPortal.tsx       (Existing)
└── App.tsx                  (Updated router)
```

### State Management
Router maintains:
- `step`: Current page in flow (role-select, doctor-login, patient-login, pharmacy-login, dashboard)
- `selectedRole`: Track which role user is logging in as
- `userData`: Authenticated user data with role info
- `darkMode`: Theme preference
- `isLoading`: Session restoration state

## Future Enhancements

1. **Multi-Language Support:** Translate role-specific pages to Hindi, Marathi
2. **Biometric Login:** Add fingerprint/face recognition for each role
3. **Social Login:** Google/Apple login per role
4. **Remember Me:** Option to pre-select role on return visit
5. **Login History:** Track login attempts per role
6. **Session Management:** Multiple device login support
7. **Role Switching:** Secure role-switching within same session
8. **Two-Factor Auth:** SMS/Google Authenticator for each role

## Deployment Notes

- All login pages are responsive and tested on mobile/tablet/desktop
- Backend validates role during OTP verification (server-side security)
- Session tokens include role information
- CORS properly configured for all login endpoints
- OTP valid for 5 minutes on all login pages
- Email notifications configured for all roles

## Backwards Compatibility

- Old `ABHALogin` and `RoleSelection` components remain in codebase for reference
- Can be restored if needed
- No database schema changes required
- All existing user data preserved

---

**Last Updated:** 2024
**Version:** 1.0 - Role-Based Login System
**Status:** ✅ Production Ready
