import { 
  users, doctors, patients, pharmacies, prescriptions, appointments, consentRequests,
  type User, type NewUser, type Doctor, type NewDoctor, type Patient, type NewPatient,
  type Pharmacy, type NewPharmacy, type Prescription, type NewPrescription, 
  type Appointment, type NewAppointment, type ConsentRequest, type NewConsentRequest
} from "../shared/schema-sqlite";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: NewUser): Promise<User>;
  
  // Doctor methods
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  createDoctor(doctor: NewDoctor): Promise<Doctor>;
  getDoctorById(id: string): Promise<Doctor | undefined>;
  
  // Patient methods
  getPatientByUserId(userId: string): Promise<Patient | undefined>;
  createPatient(patient: NewPatient): Promise<Patient>;
  getPatientById(id: string): Promise<Patient | undefined>;
  getPatientByAbhaId(abhaId: string): Promise<Patient | undefined>;
  
  // Pharmacy methods
  getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined>;
  createPharmacy(pharmacy: NewPharmacy): Promise<Pharmacy>;
  getPharmacyById(id: string): Promise<Pharmacy | undefined>;
  
  // Prescription methods
  createPrescription(prescription: NewPrescription): Promise<Prescription>;
  getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]>;
  getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]>;
  getPendingPrescriptionsForPharmacy(): Promise<Prescription[]>;
  updatePrescriptionStatus(id: string, status: string, pharmacyId?: string): Promise<void>;
  
  // Appointment methods
  createAppointment(appointment: NewAppointment): Promise<Appointment>;
  getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  getAppointmentsByPatientId(patientId: string): Promise<Appointment[]>;
  getTodaysAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]>;
  
  // Consent methods
  createConsentRequest(consent: NewConsentRequest): Promise<ConsentRequest>;
  getConsentRequestsByPatientId(patientId: string): Promise<ConsentRequest[]>;
  updateConsentStatus(id: string, status: string): Promise<void>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use memory store for SQLite development
    const session = require('express-session');
    const MemoryStore = require('memorystore')(session);
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor || undefined;
  }

  async createDoctor(insertDoctor: NewDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }

  async getDoctorById(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async getPatientByUserId(userId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient || undefined;
  }

  async createPatient(insertPatient: NewPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async getPatientById(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByAbhaId(abhaId: string): Promise<Patient | undefined> {
    const [user] = await db.select().from(users).where(eq(users.abhaId, abhaId));
    if (!user) return undefined;
    
    const [patient] = await db.select().from(patients).where(eq(patients.userId, user.id));
    return patient || undefined;
  }

  async getPharmacyByUserId(userId: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.userId, userId));
    return pharmacy || undefined;
  }

  async createPharmacy(insertPharmacy: NewPharmacy): Promise<Pharmacy> {
    const [pharmacy] = await db.insert(pharmacies).values(insertPharmacy).returning();
    return pharmacy;
  }

  async getPharmacyById(id: string): Promise<Pharmacy | undefined> {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.id, id));
    return pharmacy || undefined;
  }

  async createPrescription(insertPrescription: NewPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(insertPrescription).returning();
    return prescription;
  }

  async getPrescriptionsByPatientId(patientId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getPrescriptionsByDoctorId(doctorId: string): Promise<Prescription[]> {
    return await db.select().from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getPendingPrescriptionsForPharmacy(): Promise<Prescription[]> {
    return await db.select().from(prescriptions)
      .where(eq(prescriptions.status, 'pending'))
      .orderBy(desc(prescriptions.createdAt));
  }

  async updatePrescriptionStatus(id: string, status: string, pharmacyId?: string): Promise<void> {
    await db.update(prescriptions)
      .set({ status })
      .where(eq(prescriptions.id, id));
  }

  async createAppointment(insertAppointment: NewAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async getAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByPatientId(patientId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));
  }

  async getTodaysAppointmentsByDoctorId(doctorId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
    
    return await db.select().from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        sql`${appointments.appointmentDate} >= ${startOfDay} AND ${appointments.appointmentDate} < ${endOfDay}`
      ))
      .orderBy(appointments.appointmentDate);
  }

  async createConsentRequest(insertConsent: NewConsentRequest): Promise<ConsentRequest> {
    const [consent] = await db.insert(consentRequests).values(insertConsent).returning();
    return consent;
  }

  async getConsentRequestsByPatientId(patientId: string): Promise<ConsentRequest[]> {
    return await db.select().from(consentRequests)
      .where(eq(consentRequests.toPatientId, patientId))
      .orderBy(desc(consentRequests.createdAt));
  }

  async updateConsentStatus(id: string, status: string): Promise<void> {
    await db.update(consentRequests)
      .set({ status, respondedAt: Date.now() })
      .where(eq(consentRequests.id, id));
  }

  // Simplified health record methods - return empty for now
  async createHealthRecord(record: any): Promise<any> {
    return {};
  }

  async getHealthRecordsByPatientId(patientId: string): Promise<any[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();