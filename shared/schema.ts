import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  abhaId: varchar("abha_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  address: text("address").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull(),
  hospitalName: text("hospital_name").notNull(),
  hprId: text("hpr_id").notNull(),
  consultationFee: integer("consultation_fee").default(0).notNull(),
  availability: json("availability").$type<{ day: string; slots: string[] }[]>().default([]).notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bloodGroup: varchar("blood_group", { length: 10 }).default("").notNull(),
  height: integer("height").default(0).notNull(),
  weight: integer("weight").default(0).notNull(),
  medicalConditions: text("medical_conditions").array().default([]).notNull(),
  allergies: text("allergies").array().default([]).notNull(),
  emergencyContact: json("emergency_contact").$type<{ name: string; phone: string; email?: string; relation: string }>().default({ name: "", phone: "", relation: "" }).notNull(),
});

export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  licenseNumber: text("license_number").notNull(),
  location: text("location").notNull(),
  operatingHours: json("operating_hours").$type<{ open: string; close: string }>().default({ open: "09:00", close: "21:00" }).notNull(),
  verified: boolean("verified").default(false).notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  symptoms: text("symptoms").array().default([]).notNull(),
  medications: json("medications").$type<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[]>().default([]).notNull(),
  labTests: text("lab_tests").array().default([]).notNull(),
  notes: text("notes").default("").notNull(),
  aiInteractionCheck: json("ai_interaction_check").$type<{ safe: boolean; warnings: string[] }>().default({ safe: true, warnings: [] }).notNull(),
  qrCode: text("qr_code").default("").notNull(),
  digitalSignature: text("digital_signature").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  validUntil: timestamp("valid_until"),
  dispensedAt: timestamp("dispensed_at"),
  dispensedBy: varchar("dispensed_by"),
});

export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  fileUrl: text("file_url").default("").notNull(),
  data: json("data").default({}).notNull(),
  aiSummary: text("ai_summary").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  completed: boolean("completed").default(false).notNull(),
  prescriptionId: varchar("prescription_id").references(() => prescriptions.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  translatedMessage: text("translated_message").default("").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiChatHistory = pgTable("ai_chat_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(),
  message: text("message").notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull().references(() => users.id),
  granted: boolean("granted").notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const emergencyAlerts = pgTable("emergency_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  location: json("location").$type<{ lat: number; lng: number; address: string }>().default({ lat: 0, lng: 0, address: "" }).notNull(),
  vitals: json("vitals").$type<{ heartRate?: number; bloodPressure?: string; temperature?: number }>().default({}).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  respondedBy: varchar("responded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const otpRecords = pgTable("otp_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  abhaId: varchar("abha_id").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // 'email' or 'sms'
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertPharmacySchema = createInsertSchema(pharmacies).omit({
  id: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  dispensedAt: true,
  dispensedBy: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  read: true,
});

export const insertAIChatHistorySchema = createInsertSchema(aiChatHistory).omit({
  id: true,
  createdAt: true,
});

export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({
  id: true,
  createdAt: true,
  revokedAt: true,
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertOtpRecordSchema = createInsertSchema(otpRecords).omit({
  id: true,
  createdAt: true,
  verified: true,
  attempts: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;

export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertAIChatHistory = z.infer<typeof insertAIChatHistorySchema>;
export type AIChatHistory = typeof aiChatHistory.$inferSelect;

export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;

export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;

export type InsertOtpRecord = z.infer<typeof insertOtpRecordSchema>;
export type OtpRecord = typeof otpRecords.$inferSelect;
