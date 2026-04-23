import {
  type User,
  type InsertUser,
  type Doctor,
  type InsertDoctor,
  type Patient,
  type InsertPatient,
  type Pharmacy,
  type InsertPharmacy,
  type Prescription,
  type InsertPrescription,
  type HealthRecord,
  type InsertHealthRecord,
  type Appointment,
  type InsertAppointment,
  type Reminder,
  type InsertReminder,
  type ChatMessage,
  type InsertChatMessage,
  type AIChatHistory,
  type InsertAIChatHistory,
  type ConsentRecord,
  type InsertConsentRecord,
  type EmergencyAlert,
  type InsertEmergencyAlert,
  type OtpRecord,
  type InsertOtpRecord,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByAbhaId(abhaId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsersByRole(role: string): Promise<User[]>;

  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  getAllDoctors(): Promise<Doctor[]>;

  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;

  getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: InsertPharmacy): Promise<Pharmacy>;
  updatePharmacy(id: string, pharmacy: Partial<InsertPharmacy>): Promise<Pharmacy | undefined>;

  getPrescription(id: string): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]>;
  updatePrescription(id: string, prescription: Partial<Prescription>): Promise<Prescription | undefined>;

  getHealthRecord(id: string): Promise<HealthRecord | undefined>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getHealthRecordsByPatientId(patientId: string): Promise<HealthRecord[]>;
  updateHealthRecord(id: string, record: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined>;

  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByPatientId(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;

  getReminder(id: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getRemindersByUserId(userId: string): Promise<Reminder[]>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;

  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBetweenUsers(userId1: string, userId2: string): Promise<ChatMessage[]>;
  markMessageAsRead(id: string): Promise<void>;

  getAIChatHistory(id: string): Promise<AIChatHistory | undefined>;
  createAIChatHistory(chat: InsertAIChatHistory): Promise<AIChatHistory>;
  getAIChatHistoryByUserId(userId: string): Promise<AIChatHistory[]>;

  getConsentRecord(id: string): Promise<ConsentRecord | undefined>;
  createConsentRecord(consent: InsertConsentRecord): Promise<ConsentRecord>;
  getConsentRecordsByPatientId(patientId: string): Promise<ConsentRecord[]>;
  updateConsentRecord(id: string, consent: Partial<ConsentRecord>): Promise<ConsentRecord | undefined>;

  getEmergencyAlert(id: string): Promise<EmergencyAlert | undefined>;
  createEmergencyAlert(alert: InsertEmergencyAlert): Promise<EmergencyAlert>;
  getActiveEmergencyAlerts(): Promise<EmergencyAlert[]>;
  updateEmergencyAlert(id: string, alert: Partial<EmergencyAlert>): Promise<EmergencyAlert | undefined>;

  // OTP methods (legacy - for backward compatibility)
  storeOTP(abhaId: string, otp: string): Promise<void>;
  verifyOTP(abhaId: string, otp: string): Promise<boolean>;

  // New OTP methods
  createOTPRecord(otp: InsertOtpRecord): Promise<OtpRecord>;
  getOTPRecord(email: string, phone: string, abhaId: string): Promise<OtpRecord | undefined>;
  verifyOTPRecord(email: string, phone: string, abhaId: string, otp: string): Promise<boolean>;
  updateOTPRecord(id: string, updates: Partial<OtpRecord>): Promise<OtpRecord | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private doctors: Map<string, Doctor>;
  private patients: Map<string, Patient>;
  private pharmacies: Map<string, Pharmacy>;
  private prescriptions: Map<string, Prescription>;
  private healthRecords: Map<string, HealthRecord>;
  private appointments: Map<string, Appointment>;
  private reminders: Map<string, Reminder>;
  private chatMessages: Map<string, ChatMessage>;
  private aiChatHistory: Map<string, AIChatHistory>;
  private consentRecords: Map<string, ConsentRecord>;
  private emergencyAlerts: Map<string, EmergencyAlert>;
  private otpStore: Map<string, { otp: string; expiresAt: Date }>;
  private otpRecords: Map<string, OtpRecord>;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.patients = new Map();
    this.pharmacies = new Map();
    this.prescriptions = new Map();
    this.healthRecords = new Map();
    this.appointments = new Map();
    this.reminders = new Map();
    this.chatMessages = new Map();
    this.aiChatHistory = new Map();
    this.consentRecords = new Map();
    this.emergencyAlerts = new Map();
    this.otpStore = new Map();
    this.otpRecords = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByAbhaId(abhaId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.abhaId === abhaId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.role === role);
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    return Array.from(this.doctors.values()).find((doctor) => doctor.userId === userId);
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = randomUUID();
    const doctor: Doctor = {
      id,
      userId: insertDoctor.userId,
      specialization: insertDoctor.specialization,
      experience: insertDoctor.experience,
      hospitalName: insertDoctor.hospitalName,
      hprId: insertDoctor.hprId,
      consultationFee: insertDoctor.consultationFee ?? 0,
      availability: (insertDoctor.availability ?? []) as { day: string; slots: string[] }[],
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async updateDoctor(id: string, doctorData: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const doctor = this.doctors.get(id);
    if (!doctor) return undefined;
    const updated: Doctor = {
      ...doctor,
      ...doctorData,
      consultationFee: doctorData.consultationFee ?? doctor.consultationFee,
      availability: (doctorData.availability ?? doctor.availability) as { day: string; slots: string[] }[],
    };
    this.doctors.set(id, updated);
    return updated;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find((patient) => patient.userId === userId);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = {
      id,
      userId: insertPatient.userId,
      bloodGroup: insertPatient.bloodGroup ?? "",
      height: insertPatient.height ?? 0,
      weight: insertPatient.weight ?? 0,
      medicalConditions: insertPatient.medicalConditions ?? [],
      allergies: insertPatient.allergies ?? [],
      emergencyContact: (insertPatient.emergencyContact as any) ?? { name: "", phone: "", relation: "", email: undefined },
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, patientData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    const updated: Patient = { ...patient, ...patientData as Partial<Patient> };
    this.patients.set(id, updated);
    return updated;
  }

  async getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined> {
    return Array.from(this.pharmacies.values()).find((pharmacy) => pharmacy.userId === userId);
  }

  async createPharmacy(insertPharmacy: InsertPharmacy): Promise<Pharmacy> {
    const id = randomUUID();
    const pharmacy: Pharmacy = {
      id,
      userId: insertPharmacy.userId,
      licenseNumber: insertPharmacy.licenseNumber,
      location: insertPharmacy.location,
      operatingHours: insertPharmacy.operatingHours ?? { open: "09:00", close: "21:00" },
      verified: insertPharmacy.verified ?? false,
    };
    this.pharmacies.set(id, pharmacy);
    return pharmacy;
  }

  async updatePharmacy(id: string, pharmacyData: Partial<InsertPharmacy>): Promise<Pharmacy | undefined> {
    const pharmacy = this.pharmacies.get(id);
    if (!pharmacy) return undefined;
    const updated = { ...pharmacy, ...pharmacyData };
    this.pharmacies.set(id, updated);
    return updated;
  }

  async getPrescription(id: string): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = randomUUID();
    const prescription: Prescription = {
      id,
      patientId: insertPrescription.patientId,
      doctorId: insertPrescription.doctorId,
      diagnosis: insertPrescription.diagnosis,
      symptoms: insertPrescription.symptoms ?? [],
      medications: (insertPrescription.medications ?? []) as {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
      }[],
      labTests: insertPrescription.labTests ?? [],
      notes: insertPrescription.notes ?? "",
      aiInteractionCheck: (insertPrescription.aiInteractionCheck ?? { safe: true, warnings: [] }) as { safe: boolean; warnings: string[] },
      qrCode: insertPrescription.qrCode ?? "",
      digitalSignature: insertPrescription.digitalSignature ?? "",
      createdAt: new Date(),
      validUntil: insertPrescription.validUntil ?? null,
      dispensedAt: null,
      dispensedBy: null,
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter((p) => p.patientId === patientId);
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter((p) => p.doctorId === doctorId);
  }

  async updatePrescription(id: string, prescriptionData: Partial<Prescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    const updated = { ...prescription, ...prescriptionData };
    this.prescriptions.set(id, updated);
    return updated;
  }

  async getHealthRecord(id: string): Promise<HealthRecord | undefined> {
    return this.healthRecords.get(id);
  }

  async createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord> {
    const id = randomUUID();
    const record: HealthRecord = {
      id,
      patientId: insertRecord.patientId,
      doctorId: insertRecord.doctorId ?? null,
      type: insertRecord.type,
      title: insertRecord.title,
      description: insertRecord.description ?? "",
      fileUrl: insertRecord.fileUrl ?? "",
      data: insertRecord.data ?? {},
      aiSummary: insertRecord.aiSummary ?? "",
      createdAt: new Date(),
    };
    this.healthRecords.set(id, record);
    return record;
  }

  async getHealthRecordsByPatientId(patientId: string): Promise<HealthRecord[]> {
    return Array.from(this.healthRecords.values()).filter((r) => r.patientId === patientId);
  }

  async updateHealthRecord(id: string, recordData: Partial<InsertHealthRecord>): Promise<HealthRecord | undefined> {
    const record = this.healthRecords.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...recordData };
    this.healthRecords.set(id, updated);
    return updated;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      id,
      patientId: insertAppointment.patientId,
      doctorId: insertAppointment.doctorId,
      scheduledAt: insertAppointment.scheduledAt,
      duration: insertAppointment.duration,
      type: insertAppointment.type,
      status: insertAppointment.status ?? "scheduled",
      notes: insertAppointment.notes ?? "",
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter((a) => a.patientId === patientId);
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter((a) => a.doctorId === doctorId);
  }

  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    const updated = { ...appointment, ...appointmentData };
    this.appointments.set(id, updated);
    return updated;
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    return this.reminders.get(id);
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const reminder: Reminder = {
      id,
      userId: insertReminder.userId,
      type: insertReminder.type,
      title: insertReminder.title,
      message: insertReminder.message,
      scheduledAt: insertReminder.scheduledAt,
      completed: insertReminder.completed ?? false,
      prescriptionId: insertReminder.prescriptionId ?? null,
      appointmentId: insertReminder.appointmentId ?? null,
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async getRemindersByUserId(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter((r) => r.userId === userId);
  }

  async updateReminder(id: string, reminderData: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder) return undefined;
    const updated = { ...reminder, ...reminderData };
    this.reminders.set(id, updated);
    return updated;
  }

  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      senderId: insertMessage.senderId,
      receiverId: insertMessage.receiverId,
      message: insertMessage.message,
      language: insertMessage.language,
      translatedMessage: insertMessage.translatedMessage ?? "",
      read: false,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesBetweenUsers(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (m) =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => (a.createdAt && b.createdAt ? a.createdAt.getTime() - b.createdAt.getTime() : 0));
  }

  async markMessageAsRead(id: string): Promise<void> {
    const message = this.chatMessages.get(id);
    if (message) {
      message.read = true;
      this.chatMessages.set(id, message);
    }
  }

  async getAIChatHistory(id: string): Promise<AIChatHistory | undefined> {
    return this.aiChatHistory.get(id);
  }

  async createAIChatHistory(insertChat: InsertAIChatHistory): Promise<AIChatHistory> {
    const id = randomUUID();
    const chat: AIChatHistory = {
      ...insertChat,
      id,
      createdAt: new Date(),
    };
    this.aiChatHistory.set(id, chat);
    return chat;
  }

  async getAIChatHistoryByUserId(userId: string): Promise<AIChatHistory[]> {
    return Array.from(this.aiChatHistory.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => (a.createdAt && b.createdAt ? a.createdAt.getTime() - b.createdAt.getTime() : 0));
  }

  async getConsentRecord(id: string): Promise<ConsentRecord | undefined> {
    return this.consentRecords.get(id);
  }

  async createConsentRecord(insertConsent: InsertConsentRecord): Promise<ConsentRecord> {
    const id = randomUUID();
    const consent: ConsentRecord = {
      id,
      patientId: insertConsent.patientId,
      doctorId: insertConsent.doctorId,
      granted: insertConsent.granted,
      expiresAt: insertConsent.expiresAt ?? null,
      createdAt: new Date(),
      revokedAt: null,
    };
    this.consentRecords.set(id, consent);
    return consent;
  }

  async getConsentRecordsByPatientId(patientId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values()).filter((c) => c.patientId === patientId);
  }

  async updateConsentRecord(id: string, consentData: Partial<ConsentRecord>): Promise<ConsentRecord | undefined> {
    const consent = this.consentRecords.get(id);
    if (!consent) return undefined;
    const updated = { ...consent, ...consentData };
    this.consentRecords.set(id, updated);
    return updated;
  }

  async getEmergencyAlert(id: string): Promise<EmergencyAlert | undefined> {
    return this.emergencyAlerts.get(id);
  }

  async createEmergencyAlert(insertAlert: InsertEmergencyAlert): Promise<EmergencyAlert> {
    const id = randomUUID();
    const alert: EmergencyAlert = {
      id,
      userId: insertAlert.userId,
      location: insertAlert.location ?? { lat: 0, lng: 0, address: "" },
      vitals: (insertAlert.vitals ?? {}) as { heartRate?: number; bloodPressure?: string; temperature?: number },
      status: insertAlert.status ?? "active",
      respondedBy: insertAlert.respondedBy ?? null,
      createdAt: new Date(),
      resolvedAt: null,
    };
    this.emergencyAlerts.set(id, alert);
    return alert;
  }

  async getActiveEmergencyAlerts(): Promise<EmergencyAlert[]> {
    return Array.from(this.emergencyAlerts.values()).filter((a) => a.status === "active");
  }

  async updateEmergencyAlert(id: string, alertData: Partial<EmergencyAlert>): Promise<EmergencyAlert | undefined> {
    const alert = this.emergencyAlerts.get(id);
    if (!alert) return undefined;
    const updated = { ...alert, ...alertData };
    this.emergencyAlerts.set(id, updated);
    return updated;
  }

  // OTP Methods (Legacy - for backward compatibility)
  async storeOTP(abhaId: string, otp: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.otpStore.set(abhaId, { otp, expiresAt });
  }

  async verifyOTP(abhaId: string, otp: string): Promise<boolean> {
    const stored = this.otpStore.get(abhaId);
    if (!stored) return false;
    if (stored.expiresAt < new Date()) {
      this.otpStore.delete(abhaId);
      return false;
    }
    if (stored.otp !== otp) return false;
    this.otpStore.delete(abhaId);
    return true;
  }

  // Simple OTP storage - keyed by ABHA ID
  private otpStore2: Map<string, { otp: string; expiresAt: Date; attempts: number; email: string }> = new Map();

  // New OTP Record Methods
  async createOTPRecord(otpData: InsertOtpRecord): Promise<OtpRecord> {
    const id = randomUUID();
    const abhaId = (otpData.abhaId || "").trim();
    const email = (otpData.email || "").trim();
    
    const record: OtpRecord = {
      id,
      email,
      phone: otpData.phone || "",
      abhaId,
      otp: otpData.otp,
      channel: otpData.channel,
      expiresAt: otpData.expiresAt,
      verified: false,
      attempts: 0,
      createdAt: new Date(),
    };
    
    this.otpRecords.set(id, record);
    this.otpStore2.set(abhaId, {
      otp: otpData.otp,
      expiresAt: otpData.expiresAt,
      attempts: 0,
      email,
    });
    
    console.error(`[OTP] CREATE: abhaId=${abhaId}, email=${email}, otp=${otpData.otp}, expires=${otpData.expiresAt.toISOString()}`);
    return record;
  }

  async getOTPRecord(email: string, phone: string, abhaId: string): Promise<OtpRecord | undefined> {
    const normalizedAbhaId = (abhaId || "").trim();
    
    // Get from simple cache by ABHA ID
    const cached = this.otpStore2.get(normalizedAbhaId);
    if (cached) {
      console.error(`[OTP] GET: Found for ${normalizedAbhaId}, expired=${cached.expiresAt < new Date()}`);
      
      if (cached.expiresAt < new Date()) {
        console.error(`[OTP] GET: Record expired, removing`);
        this.otpStore2.delete(normalizedAbhaId);
        return undefined;
      }
      
      // Find the matching record in otpRecords to return full OtpRecord
      const fullRecord = Array.from(this.otpRecords.values()).find(
        r => r.abhaId === normalizedAbhaId
      );
      
      if (fullRecord) {
        console.error(`[OTP] GET: Returning full record`);
        return fullRecord;
      }
    }
    
    console.error(`[OTP] GET: No record found for ${normalizedAbhaId}`);
    return undefined;
  }

  async verifyOTPRecord(email: string, phone: string, abhaId: string, otp: string): Promise<boolean> {
    const normalizedAbhaId = (abhaId || "").trim();
    
    console.error(`[OTP] VERIFY: abhaId=${normalizedAbhaId}, otp=${otp}`);
    
    const cached = this.otpStore2.get(normalizedAbhaId);
    if (!cached) {
      console.error(`[OTP] VERIFY: No record found`);
      return false;
    }

    // Check expiry
    if (cached.expiresAt < new Date()) {
      console.error(`[OTP] VERIFY: Expired`);
      this.otpStore2.delete(normalizedAbhaId);
      return false;
    }

    // Check attempts
    if (cached.attempts >= 3) {
      console.error(`[OTP] VERIFY: Too many attempts`);
      return false;
    }

    // Check OTP
    if (cached.otp !== otp) {
      console.error(`[OTP] VERIFY: Mismatch - expected ${cached.otp}, got ${otp}`);
      cached.attempts++;
      return false;
    }

    // Success - clear the record
    console.error(`[OTP] VERIFY: ✅ SUCCESS`);
    this.otpStore2.delete(normalizedAbhaId);
    return true;
  }

  async updateOTPRecord(id: string, updates: Partial<OtpRecord>): Promise<OtpRecord | undefined> {
    const record = this.otpRecords.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    this.otpRecords.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
