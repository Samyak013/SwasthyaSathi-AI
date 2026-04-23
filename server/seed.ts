import { storage } from "./storage";

export async function seedDatabase() {
  console.log("Seeding database with sample data...");

  const doctor1User = await storage.createUser({
    abhaId: "22-1234-5678-9012",
    name: "Dr. Rajesh Kumar",
    email: "samyak@acpce.ac.in",
    phone: "+91-9876543210",
    dateOfBirth: "1985-03-15",
    gender: "Male",
    address: "123 Medical Complex, Mumbai, Maharashtra 400001",
    role: "doctor",
  });

  await storage.createDoctor({
    userId: doctor1User.id,
    specialization: "General Physician, MD",
    experience: 12,
    hospitalName: "City General Hospital",
    hprId: "HPR2024001",
    consultationFee: 500,
    availability: [
      { day: "Monday", slots: ["09:00-12:00", "14:00-18:00"] },
      { day: "Tuesday", slots: ["09:00-12:00", "14:00-18:00"] },
      { day: "Wednesday", slots: ["09:00-12:00"] },
      { day: "Thursday", slots: ["09:00-12:00", "14:00-18:00"] },
      { day: "Friday", slots: ["09:00-12:00", "14:00-18:00"] },
    ],
  });

  const patient1User = await storage.createUser({
    abhaId: "22-1111-2222-3333",
    name: "Priya Sharma",
    email: "samyak@acpce.ac.in",
    phone: "+91-9123456780",
    dateOfBirth: "1992-07-20",
    gender: "Female",
    address: "456 Residence Colony, Mumbai, Maharashtra 400020",
    role: "patient",
  });

  await storage.createPatient({
    userId: patient1User.id,
    bloodGroup: "B+",
    height: 162,
    weight: 58,
    medicalConditions: ["Diabetes Type 2", "Hypertension"],
    allergies: ["Penicillin"],
    emergencyContact: {
      name: "Amit Sharma",
      phone: "+91-9123456781",
      email: "swayam@acpce.ac.in",
      relation: "Husband",
    },
  });

  const patient2User = await storage.createUser({
    abhaId: "22-4444-5555-6666",
    name: "Amit Patel",
    email: "samyak@acpce.ac.in",
    phone: "+91-9234567890",
    dateOfBirth: "1978-11-05",
    gender: "Male",
    address: "789 Garden Street, Pune, Maharashtra 411001",
    role: "patient",
  });

  await storage.createPatient({
    userId: patient2User.id,
    bloodGroup: "A+",
    height: 175,
    weight: 78,
    medicalConditions: ["Asthma"],
    allergies: [],
    emergencyContact: {
      name: "Sunita Patel",
      phone: "+91-9234567891",
      email: "divyesh@acpce.ac.in",
      relation: "Wife",
    },
  });

  const pharmacy1User = await storage.createUser({
    abhaId: "22-8888-9999-0000",
    name: "HealthPlus Pharmacy",
    email: "samyak@acpce.ac.in",
    phone: "+91-9345678901",
    dateOfBirth: "2010-01-01",
    gender: "Other",
    address: "101 Main Market, Mumbai, Maharashtra 400015",
    role: "pharmacy",
  });

  await storage.createPharmacy({
    userId: pharmacy1User.id,
    licenseNumber: "PH-MH-2024-001",
    location: "Mumbai, Maharashtra",
    operatingHours: { open: "08:00", close: "22:00" },
    verified: true,
  });

  const prescription1 = await storage.createPrescription({
    patientId: patient1User.id,
    doctorId: doctor1User.id,
    diagnosis: "Acute Upper Respiratory Infection",
    symptoms: ["Fever", "Cough", "Sore throat"],
    medications: [
      {
        name: "Paracetamol",
        dosage: "500mg",
        frequency: "3 times daily",
        duration: "5 days",
        instructions: "Take after meals",
      },
      {
        name: "Azithromycin",
        dosage: "250mg",
        frequency: "Once daily",
        duration: "5 days",
        instructions: "Take on empty stomach",
      },
    ],
    labTests: [],
    notes: "Rest advised. Drink plenty of fluids. Follow up if symptoms persist beyond 5 days.",
    aiInteractionCheck: { safe: true, warnings: [] },
    qrCode: `PRESCRIPTION:${Date.now()}:DOCTOR:${doctor1User.id}:PATIENT:${patient1User.id}:TIMESTAMP:${Date.now()}`,
    digitalSignature: `SIGN_${Date.now()}`,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  await storage.createHealthRecord({
    patientId: patient1User.id,
    doctorId: doctor1User.id,
    type: "lab_report",
    title: "Complete Blood Count (CBC)",
    description: "Routine blood test",
    data: {
      hemoglobin: 13.2,
      wbc: 8500,
      platelets: 250000,
      rbc: 4.5,
    },
    aiSummary: "All values within normal range. Hemoglobin slightly low, consider iron-rich diet.",
  });

  await storage.createHealthRecord({
    patientId: patient1User.id,
    doctorId: doctor1User.id,
    type: "prescription",
    title: "General Checkup Prescription",
    description: "Follow-up prescription from general checkup",
    data: { prescriptionId: prescription1.id },
    aiSummary: "Prescribed Paracetamol and Azithromycin for fever and infection. Monitor temperature for next 3 days.",
  });

  await storage.createAppointment({
    patientId: patient1User.id,
    doctorId: doctor1User.id,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    duration: 30,
    type: "follow-up",
    status: "scheduled",
    notes: "Follow-up for respiratory infection",
  });

  await storage.createReminder({
    userId: patient1User.id,
    type: "medicine",
    title: "Take Paracetamol 500mg",
    message: "500mg - 3 times daily",
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    prescriptionId: prescription1.id,
  });

  await storage.createReminder({
    userId: patient1User.id,
    type: "appointment",
    title: "Follow-up with Dr. Kumar",
    message: "Appointment scheduled at City General Hospital",
    scheduledAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
  });

  await storage.createConsentRecord({
    patientId: patient1User.id,
    doctorId: doctor1User.id,
    granted: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });

  console.log("Database seeded successfully!");
  console.log("Sample credentials:");
  console.log("Doctor - ABHA ID: 22-1234-5678-9012");
  console.log("Patient 1 - ABHA ID: 22-1111-2222-3333");
  console.log("Patient 2 - ABHA ID: 22-4444-5555-6666");
  console.log("Pharmacy - ABHA ID: 22-8888-9999-0000");
}
