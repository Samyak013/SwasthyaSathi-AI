import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  doctors, 
  patients, 
  pharmacies, 
  prescriptions, 
  appointments,
  type User,
  type Doctor,
  type Patient, 
  type Pharmacy,
  type Prescription,
  type Appointment,
  type NewUser,
  type NewDoctor,
  type NewPatient,
  type NewPharmacy,
  type NewPrescription,
  type NewAppointment
} from "../shared/schema-sqlite";

export interface Storage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: NewUser): Promise<User>;
  
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  createDoctor(doctorData: NewDoctor): Promise<Doctor>;
  getDoctors(): Promise<Doctor[]>;
  
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  createPatient(patientData: NewPatient): Promise<Patient>;
  getPatients(): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient | undefined>;
  
  getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacyData: NewPharmacy): Promise<Pharmacy>;
  getPharmacies(): Promise<Pharmacy[]>;
  
  getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]>;
  createPrescription(prescriptionData: NewPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: string, status: string, pharmacyId?: string): Promise<void>;
  
  getAppointmentsByPatientId(patientId: string): Promise<Appointment[]>;
  getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  createAppointment(appointmentData: NewAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<void>;
  
  // Additional methods for dashboard functionality
  getTodaysAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  getPatientByAbhaId(abhaId: string): Promise<Patient | undefined>;
  createConsentRequest(data: any): Promise<any>;
  getConsentRequestsByPatientId(patientId: string): Promise<any[]>;
  updateConsentStatus(id: string, status: string): Promise<void>;
  getHealthRecordsByPatientId(patientId: string): Promise<any[]>;
  getPendingPrescriptionsForPharmacy(): Promise<Prescription[]>;
  
  sessionStore: any;
}

class DatabaseStorage implements Storage {
  sessionStore: any;

  constructor() {
    this.initializeSessionStore();
  }

  private async initializeSessionStore() {
    try {
      // Dynamic import for ES modules
      const session = await import('express-session');
      const memorystore = await import('memorystore');
      const MemoryStore = memorystore.default(session.default);
      
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    } catch (error) {
      console.error('Failed to initialize session store:', error);
      this.sessionStore = null;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: NewUser): Promise<User> {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      role: userData.role,
      abhaId: userData.abhaId
    }).returning();
    return user;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor || undefined;
  }

  async createDoctor(doctorData: NewDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values({
      userId: doctorData.userId,
      name: doctorData.name,
      specialization: doctorData.specialization,
      hospital: doctorData.hospital,
      licenseNumber: doctorData.licenseNumber,
      phone: doctorData.phone,
      email: doctorData.email
    }).returning();
    return doctor;
  }

  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors);
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient || undefined;
  }

  async createPatient(patientData: NewPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values({
      userId: patientData.userId,
      name: patientData.name,
      dateOfBirth: patientData.dateOfBirth,
      bloodGroup: patientData.bloodGroup,
      phone: patientData.phone,
      email: patientData.email,
      address: patientData.address,
      emergencyContact: patientData.emergencyContact,
      insuranceInfo: patientData.insuranceInfo
    }).returning();
    return patient;
  }

  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.userId, userId));
    return pharmacy || undefined;
  }

  async createPharmacy(pharmacyData: NewPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db.insert(pharmacies).values({
      userId: pharmacyData.userId,
      name: pharmacyData.name,
      address: pharmacyData.address,
      licenseNumber: pharmacyData.licenseNumber,
      phone: pharmacyData.phone,
      email: pharmacyData.email
    }).returning();
    return pharmacy;
  }

  async getPharmacies(): Promise<Pharmacy[]> {
    return await db.select().from(pharmacies);
  }

  async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId));
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions).where(eq(prescriptions.doctorId, doctorId));
  }

  async createPrescription(prescriptionData: NewPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values({
      patientId: prescriptionData.patientId,
      doctorId: prescriptionData.doctorId,
      medications: prescriptionData.medications,
      diagnosis: prescriptionData.diagnosis,
      instructions: prescriptionData.instructions,
      validUntil: prescriptionData.validUntil,
      status: prescriptionData.status || 'pending'
    }).returning();
    return prescription;
  }

  async updatePrescriptionStatus(id: string, status: string, pharmacyId?: string): Promise<void> {
    await db.update(prescriptions)
      .set({ status })
      .where(eq(prescriptions.id, id));
  }

  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.patientId, patientId));
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));
  }

  async createAppointment(appointmentData: NewAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values({
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      status: appointmentData.status || 'scheduled',
      notes: appointmentData.notes
    }).returning();
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<void> {
    await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id));
  }

  // Additional methods needed by routes
  async getTodaysAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    
    return await db.select().from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId)
        // Note: More complex date filtering would be needed for production
        // For now, returning all appointments for the doctor
      ));
  }

  async getPatientByAbhaId(abhaId: string): Promise<Patient | undefined> {
    // First find user by abhaId, then get patient
    const [user] = await db.select().from(users).where(eq(users.abhaId, abhaId));
    if (!user) return undefined;
    
    const [patient] = await db.select().from(patients).where(eq(patients.userId, user.id));
    return patient || undefined;
  }

  async createConsentRequest(data: any): Promise<any> {
    // For now, return a mock consent request
    // This would need the actual consentRequests table implementation
    return {
      id: Math.random().toString(36).substr(2, 9),
      fromUserId: data.fromUserId,
      toPatientId: data.toPatientId,
      purpose: data.purpose,
      status: 'pending',
      createdAt: Date.now()
    };
  }

  async getConsentRequestsByPatientId(patientId: string): Promise<any[]> {
    // Mock implementation - would need actual consentRequests table
    return [];
  }

  async updateConsentStatus(id: string, status: string): Promise<void> {
    // Mock implementation - would need actual consentRequests table
    console.log(`Updating consent ${id} to status: ${status}`);
  }

  async getHealthRecordsByPatientId(patientId: string): Promise<any[]> {
    // Mock implementation - would need actual healthRecords table
    return [];
  }

  async getPendingPrescriptionsForPharmacy(): Promise<Prescription[]> {
    return await db.select().from(prescriptions)
      .where(eq(prescriptions.status, 'pending'));
  }
}

export const storage = new DatabaseStorage();