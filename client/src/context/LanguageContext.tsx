import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "nav.settings": "Settings",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.back": "Back",
    "common.download": "Download",
    "common.share": "Share",
    "common.print": "Print",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.view": "View",
    "common.add": "Add",
    "common.close": "Close",
    "common.language": "Language",
    "common.selectLanguage": "Select Language",
    
    // Patient Dashboard
    "patient.title": "Patient Dashboard",
    "patient.myHealth": "My Health",
    "patient.prescriptions": "Prescriptions",
    "patient.appointments": "Appointments",
    "patient.medicalHistory": "Medical History",
    "patient.healthRecords": "Health Records",
    "patient.vitals": "Vitals",
    "patient.medications": "Medications",
    "patient.reminders": "Reminders",
    "patient.upcomingReminders": "Upcoming Reminders",
    "patient.noReminders": "No reminders set",
    "patient.markComplete": "Mark Complete",
    "patient.symptoms": "Symptoms",
    "patient.diagnosis": "Diagnosis",
    "patient.viewDetails": "View Details",
    "patient.downloadRecord": "Download Record",
    "patient.shareRecord": "Share Record",
    "patient.viewQR": "View QR Code",
    "patient.generateQR": "Generate QR Code",
    "patient.noPrescriptions": "No prescriptions found",
    "patient.noRecords": "No health records found",
    "patient.abhaId": "ABHA ID",
    "patient.age": "Age",
    "patient.gender": "Gender",
    
    // Doctor Dashboard
    "doctor.title": "Doctor Dashboard",
    "doctor.welcome": "Welcome",
    "doctor.myPatients": "My Patients",
    "doctor.appointments": "Appointments",
    "doctor.createPrescription": "New Prescription",
    "doctor.viewPatient": "View Patient",
    "doctor.sendPrescription": "Send Prescription",
    "doctor.patientName": "Patient Name",
    "doctor.nextAppointment": "Next Appointment",
    "doctor.specializationLabel": "Specialization",
    "doctor.experienceLabel": "Experience",
    "doctor.years": "years",
    "doctor.totalPatients": "Total Patients",
    "doctor.todayConsultations": "Today's Consultations",
    "doctor.prescriptions": "Prescriptions",
    "doctor.recoveryRate": "Recovery Rate",
    "doctor.patientManagement": "Patient Management",
    "doctor.allPatients": "All Patients",
    "doctor.recent": "Recent",
    "doctor.critical": "Critical",
    "doctor.noCriticalPatients": "No critical patients at the moment",
    "doctor.selectMonth": "Select Month",
    "doctor.lastVisit": "Last Visit",
    "doctor.analyticsDashboard": "Analytics Dashboard",
    "doctor.emergencySos": "Emergency SOS",
    "doctor.selectPatientRecords": "Patient Records",
    "doctor.viewRecords": "View Records",
    "doctor.sendMessage": "Send Message",
    "doctor.scheduleAppointment": "Schedule Appointment",
    
    // Pharmacy
    "pharmacy.title": "Pharmacy Portal",
    "pharmacy.pendingPrescriptions": "Pending Prescriptions",
    "pharmacy.dispensedToday": "Dispensed Today",
    "pharmacy.lowStock": "Low Stock Items",
    "pharmacy.verifyPrescription": "Verify Prescription",
    "pharmacy.dispenseRx": "Dispense",
    "pharmacy.inventory": "Inventory",
    "pharmacy.searchMedicines": "Search medicines...",
    "pharmacy.stockLevel": "Stock Level",
    "pharmacy.addMedicine": "Add Medicine",
    "pharmacy.restock": "Restock",
    "pharmacy.medicineName": "Medicine Name",
    "pharmacy.quantity": "Quantity",
    "pharmacy.price": "Price",
    "pharmacy.expiry": "Expiry Date",
    "pharmacy.prescriptionId": "Prescription ID",
    "pharmacy.prescriptionStatus": "Status",
    "pharmacy.verified": "Verified",
    "pharmacy.pending": "Pending",
    "pharmacy.dispensed": "Dispensed",
    
    // AI Chat
    "chat.title": "Health Assistant",
    "chat.askQuestion": "Ask your health question...",
    "chat.send": "Send",
    "chat.selectLanguage": "Select Language",
    "chat.english": "English",
    "chat.hindi": "हिंदी",
    "chat.marathi": "मराठी",
    
    // Login
    "login.enterAbha": "Enter ABHA ID",
    "login.sendOtp": "Send OTP",
    "login.enterOtp": "Enter OTP",
    "login.verify": "Verify",
    "login.role": "Role",
    "login.pharmacy": "Pharmacy",
    "login.doctor": "Doctor",
    "login.patient": "Patient",
    "login.selectRole": "Select Your Role",
    "login.continueAs": "Continue as",
    
    // Emergency
    "emergency.sosButton": "Emergency SOS",
    "emergency.alert": "Alert",
    "emergency.sendAlert": "Send Alert",
    "emergency.contactEmergency": "Emergency Contacts",
    "emergency.location": "Location",
    
    // Facilities
    "facilities.nearbyHospitals": "Nearby Hospitals",
    "facilities.nearbyClinics": "Nearby Clinics",
    "facilities.nearbyPharmacies": "Nearby Pharmacies",
    "facilities.distance": "Distance",
    "facilities.rating": "Rating",
    "facilities.openNow": "Open Now",
    "facilities.viewOnMap": "View on Map",
    
    // Health Insights
    "insights.personalizedInsights": "Personalized Insights",
    "insights.conditionManagement": "Condition Management",
    "insights.regularScreening": "Regular Screening",
    "insights.healthyLifestyle": "Healthy Lifestyle",
    "insights.priority": "Priority",
    "insights.high": "High",
    "insights.medium": "Medium",
    "insights.low": "Low",
  },
  
  hi: {
    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.profile": "प्रोफाइल",
    "nav.logout": "लॉगआउट",
    "nav.settings": "सेटिंग्स",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफल",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.back": "पीछे",
    "common.download": "डाउनलोड करें",
    "common.share": "साझा करें",
    "common.print": "प्रिंट करें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर करें",
    "common.sort": "सॉर्ट करें",
    "common.view": "देखें",
    "common.add": "जोड़ें",
    "common.close": "बंद करें",
    "common.language": "भाषा",
    "common.selectLanguage": "भाषा चुनें",
    
    // Patient Dashboard
    "patient.title": "रोगी डैशबोर्ड",
    "patient.myHealth": "मेरा स्वास्थ्य",
    "patient.prescriptions": "पर्चे",
    "patient.appointments": "नियुक्तियां",
    "patient.medicalHistory": "चिकित्सा इतिहास",
    "patient.healthRecords": "स्वास्थ्य रिकॉर्ड",
    "patient.vitals": "महत्वपूर्ण संकेत",
    "patient.medications": "दवाएं",
    "patient.reminders": "अनुस्मारक",
    "patient.upcomingReminders": "आने वाले अनुस्मारक",
    "patient.noReminders": "कोई अनुस्मारक सेट नहीं",
    "patient.markComplete": "पूर्ण चिह्नित करें",
    "patient.symptoms": "लक्षण",
    "patient.diagnosis": "निदान",
    "patient.viewDetails": "विवरण देखें",
    "patient.downloadRecord": "रिकॉर्ड डाउनलोड करें",
    "patient.shareRecord": "रिकॉर्ड साझा करें",
    "patient.viewQR": "QR कोड देखें",
    "patient.generateQR": "QR कोड बनाएं",
    "patient.noPrescriptions": "कोई पर्चे नहीं मिले",
    "patient.noRecords": "कोई स्वास्थ्य रिकॉर्ड नहीं मिले",
    "patient.abhaId": "ABHA ID",
    "patient.age": "आयु",
    "patient.gender": "लिंग",
    
    // Doctor Dashboard
    "doctor.title": "डॉक्टर डैशबोर्ड",
    "doctor.welcome": "स्वागत है",
    "doctor.myPatients": "मेरे रोगी",
    "doctor.appointments": "नियुक्तियां",
    "doctor.createPrescription": "नया पर्चा",
    "doctor.viewPatient": "रोगी देखें",
    "doctor.sendPrescription": "पर्चा भेजें",
    "doctor.patientName": "रोगी का नाम",
    "doctor.nextAppointment": "अगली नियुक्ति",
    "doctor.specializationLabel": "विशेषज्ञता",
    "doctor.experienceLabel": "अनुभव",
    "doctor.years": "साल",
    "doctor.totalPatients": "कुल रोगी",
    "doctor.todayConsultations": "आज की परामर्श",
    "doctor.prescriptions": "पर्चे",
    "doctor.recoveryRate": "रिकवरी दर",
    "doctor.patientManagement": "रोगी प्रबंधन",
    "doctor.allPatients": "सभी रोगी",
    "doctor.recent": "हाल का",
    "doctor.critical": "गंभीर",
    "doctor.noCriticalPatients": "इस समय कोई गंभीर रोगी नहीं",
    "doctor.selectMonth": "महीना चुनें",
    "doctor.lastVisit": "अंतिम भेट",
    "doctor.analyticsDashboard": "विश्लेषण डैशबोर्ड",
    "doctor.emergencySos": "आपातकालीन SOS",
    "doctor.selectPatientRecords": "रोगी रिकॉर्ड",
    "doctor.viewRecords": "रिकॉर्ड देखें",
    "doctor.sendMessage": "संदेश भेजें",
    "doctor.scheduleAppointment": "नियुक्ति निर्धारित करें",
    
    // Pharmacy
    "pharmacy.title": "फार्मेसी पोर्टल",
    "pharmacy.pendingPrescriptions": "लंबित पर्चे",
    "pharmacy.dispensedToday": "आज वितरित",
    "pharmacy.lowStock": "कम स्टॉक वस्तुएं",
    "pharmacy.verifyPrescription": "पर्चा सत्यापित करें",
    "pharmacy.dispenseRx": "वितरित करें",
    "pharmacy.inventory": "इन्वेंटरी",
    "pharmacy.searchMedicines": "दवाएं खोजें...",
    "pharmacy.stockLevel": "स्टॉक स्तर",
    "pharmacy.addMedicine": "दवा जोड़ें",
    "pharmacy.restock": "पुनः स्टॉक करें",
    "pharmacy.medicineName": "दवा का नाम",
    "pharmacy.quantity": "मात्रा",
    "pharmacy.price": "मूल्य",
    "pharmacy.expiry": "समाप्ति तिथि",
    "pharmacy.prescriptionId": "पर्चे ID",
    "pharmacy.prescriptionStatus": "स्थिति",
    "pharmacy.verified": "सत्यापित",
    "pharmacy.pending": "लंबित",
    "pharmacy.dispensed": "वितरित",
    
    // AI Chat
    "chat.title": "स्वास्थ्य सहायक",
    "chat.askQuestion": "अपना स्वास्थ्य प्रश्न पूछें...",
    "chat.send": "भेजें",
    "chat.selectLanguage": "भाषा चुनें",
    "chat.english": "English",
    "chat.hindi": "हिंदी",
    "chat.marathi": "मराठी",
    
    // Login
    "login.enterAbha": "ABHA ID दर्ज करें",
    "login.sendOtp": "OTP भेजें",
    "login.enterOtp": "OTP दर्ज करें",
    "login.verify": "सत्यापित करें",
    "login.role": "भूमिका",
    "login.pharmacy": "फार्मेसी",
    "login.doctor": "डॉक्टर",
    "login.patient": "रोगी",
    "login.selectRole": "अपनी भूमिका चुनें",
    "login.continueAs": "इस रूप में जारी रखें",
    
    // Emergency
    "emergency.sosButton": "आपातकालीन SOS",
    "emergency.alert": "सतर्कता",
    "emergency.sendAlert": "सतर्कता भेजें",
    "emergency.contactEmergency": "आपातकालीन संपर्क",
    "emergency.location": "स्थान",
    
    // Facilities
    "facilities.nearbyHospitals": "आस-पास के अस्पताल",
    "facilities.nearbyClinics": "आस-पास की क्लीनिकें",
    "facilities.nearbyPharmacies": "आस-पास की फार्मेसियां",
    "facilities.distance": "दूरी",
    "facilities.rating": "रेटिंग",
    "facilities.openNow": "अभी खुला है",
    "facilities.viewOnMap": "मानचित्र पर देखें",
    
    // Health Insights
    "insights.personalizedInsights": "व्यक्तिगत अंतर्दृष्टि",
    "insights.conditionManagement": "स्थिति प्रबंधन",
    "insights.regularScreening": "नियमित जांच",
    "insights.healthyLifestyle": "स्वस्थ जीवन शैली",
    "insights.priority": "प्राथमिकता",
    "insights.high": "उच्च",
    "insights.medium": "मध्यम",
    "insights.low": "निम्न",
  },
  
  mr: {
    // Navigation
    "nav.dashboard": "डॅशबोर्ड",
    "nav.profile": "प्रोफाइल",
    "nav.logout": "लॉगआउट",
    "nav.settings": "सेटिंग्स",
    
    // Common
    "common.loading": "लोड होत आहे...",
    "common.error": "त्रुटी",
    "common.success": "यशस्वी",
    "common.cancel": "रद्द करा",
    "common.save": "जतन करा",
    "common.delete": "हटवा",
    "common.edit": "संपादित करा",
    "common.back": "मागे",
    "common.download": "डाउनलोड करा",
    "common.share": "शेअर करा",
    "common.print": "प्रिंट करा",
    "common.search": "शोधा",
    "common.filter": "फिल्टर करा",
    "common.sort": "सॉर्ट करा",
    "common.view": "पहा",
    "common.add": "जोडा",
    "common.close": "बंद करा",
    "common.language": "भाषा",
    "common.selectLanguage": "भाषा निवडा",
    
    // Patient Dashboard
    "patient.title": "रुग्ण डॅशबोर्ड",
    "patient.myHealth": "माझे आरोग्य",
    "patient.prescriptions": "औषध पत्रे",
    "patient.appointments": "भेटी",
    "patient.medicalHistory": "वैद्यकीय इतिहास",
    "patient.healthRecords": "आरोग्य रिकॉर्ड",
    "patient.vitals": "महत्वपूर्ण चिन्हे",
    "patient.medications": "औषधे",
    "patient.reminders": "स्मरणे",
    "patient.upcomingReminders": "येणार्या स्मरणे",
    "patient.noReminders": "स्मरणे सेट केली नाहीत",
    "patient.markComplete": "पूर्ण चिन्हांकित करा",
    "patient.symptoms": "लक्षणे",
    "patient.diagnosis": "निदान",
    "patient.viewDetails": "तपशील पहा",
    "patient.downloadRecord": "रिकॉर्ड डाउनलोड करा",
    "patient.shareRecord": "रिकॉर्ड शेअर करा",
    "patient.viewQR": "QR कोड पहा",
    "patient.generateQR": "QR कोड तयार करा",
    "patient.noPrescriptions": "कोणतेही औषध पत्र नाहीत",
    "patient.noRecords": "कोणतेही आरोग्य रिकॉर्ड नाहीत",
    "patient.abhaId": "ABHA ID",
    "patient.age": "वय",
    "patient.gender": "लिंग",
    
    // Doctor Dashboard
    "doctor.title": "डॉक्टर डॅशबोर्ड",
    "doctor.welcome": "स्वागत आहे",
    "doctor.myPatients": "माझे रुग्ण",
    "doctor.appointments": "भेटी",
    "doctor.createPrescription": "नवीन औषध पत्र",
    "doctor.viewPatient": "रुग्ण पहा",
    "doctor.sendPrescription": "औषध पत्र पाठवा",
    "doctor.patientName": "रुग्णाचे नाव",
    "doctor.nextAppointment": "पुढील भेट",
    "doctor.specializationLabel": "विशेषत्व",
    "doctor.experienceLabel": "अनुभव",
    "doctor.years": "वर्षे",
    "doctor.totalPatients": "एकूण रुग्ण",
    "doctor.todayConsultations": "आजचे सल्ले",
    "doctor.prescriptions": "औषध पत्रे",
    "doctor.recoveryRate": "बरे होण्याचे दर",
    "doctor.patientManagement": "रुग्ण व्यवस्थापन",
    "doctor.allPatients": "सर्व रुग्ण",
    "doctor.recent": "अलीकडचे",
    "doctor.critical": "गंभीर",
    "doctor.noCriticalPatients": "सध्या कोणतेही गंभीर रुग्ण नाहीत",
    "doctor.selectMonth": "महिना निवडा",
    "doctor.lastVisit": "अंतिम भेट",
    "doctor.analyticsDashboard": "विश्लेषण डॅशबोर्ड",
    "doctor.emergencySos": "आपातकालीन SOS",
    "doctor.selectPatientRecords": "रुग्ण रिकॉर्ड",
    "doctor.viewRecords": "रिकॉर्ड पहा",
    "doctor.sendMessage": "संदेश पाठवा",
    "doctor.scheduleAppointment": "भेट निश्चित करा",
    
    // Pharmacy
    "pharmacy.title": "फार्मसी पोर्टल",
    "pharmacy.pendingPrescriptions": "प्रलंबित औषध पत्रे",
    "pharmacy.dispensedToday": "आज वितरित",
    "pharmacy.lowStock": "कमी स्टॉक वस्तू",
    "pharmacy.verifyPrescription": "औषध पत्र सत्यापित करा",
    "pharmacy.dispenseRx": "वितरित करा",
    "pharmacy.inventory": "इन्व्हेंटरी",
    "pharmacy.searchMedicines": "औषधे शोधा...",
    "pharmacy.stockLevel": "स्टॉक पातळी",
    "pharmacy.addMedicine": "औषध जोडा",
    "pharmacy.restock": "पुन्हा स्टॉक करा",
    "pharmacy.medicineName": "औषधाचे नाव",
    "pharmacy.quantity": "प्रमाण",
    "pharmacy.price": "किंमत",
    "pharmacy.expiry": "समाप्तीची तारीख",
    "pharmacy.prescriptionId": "औषध पत्र ID",
    "pharmacy.prescriptionStatus": "स्थिती",
    "pharmacy.verified": "सत्यापित",
    "pharmacy.pending": "प्रलंबित",
    "pharmacy.dispensed": "वितरित",
    
    // AI Chat
    "chat.title": "आरोग्य सहायक",
    "chat.askQuestion": "तुमचा आरोग्य प्रश्न विचारा...",
    "chat.send": "पाठवा",
    "chat.selectLanguage": "भाषा निवडा",
    "chat.english": "English",
    "chat.hindi": "हिंदी",
    "chat.marathi": "मराठी",
    
    // Login
    "login.enterAbha": "ABHA ID प्रविष्ट करा",
    "login.sendOtp": "OTP पाठवा",
    "login.enterOtp": "OTP प्रविष्ट करा",
    "login.verify": "सत्यापित करा",
    "login.role": "भूमिका",
    "login.pharmacy": "फार्मसी",
    "login.doctor": "डॉक्टर",
    "login.patient": "रुग्ण",
    "login.selectRole": "तुमची भूमिका निवडा",
    "login.continueAs": "म्हणून पुढे जा",
    
    // Emergency
    "emergency.sosButton": "आपातकालीन SOS",
    "emergency.alert": "सतर्कता",
    "emergency.sendAlert": "सतर्कता पाठवा",
    "emergency.contactEmergency": "आपातकालीन संपर्क",
    "emergency.location": "स्थान",
    
    // Facilities
    "facilities.nearbyHospitals": "जवळील रुग्णालये",
    "facilities.nearbyClinics": "जवळील क्लिनिक्स",
    "facilities.nearbyPharmacies": "जवळील फार्मसी",
    "facilities.distance": "अंतर",
    "facilities.rating": "रेटिंग",
    "facilities.openNow": "आता खुले आहे",
    "facilities.viewOnMap": "नकाशे वर पहा",
    
    // Health Insights
    "insights.personalizedInsights": "व्यक्तिगत अंतर्दृष्टी",
    "insights.conditionManagement": "स्थिती व्यवस्थापन",
    "insights.regularScreening": "नियमित तपासणी",
    "insights.healthyLifestyle": "आरोग्यकर जीवनशैली",
    "insights.priority": "प्राधान्य",
    "insights.high": "उच्च",
    "insights.medium": "मध्यम",
    "insights.low": "निम्न",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language | null;
    return saved || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
