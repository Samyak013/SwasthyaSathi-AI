import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'doctor', 'patient', 'pharmacy'
  abhaId: text("abha_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  hospital: text("hospital").notNull(),
  licenseNumber: text("license_number").notNull(),
  phone: text("phone"),
  email: text("email"),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  bloodGroup: text("blood_group"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  insuranceInfo: text("insurance_info"),
});

export const pharmacies = pgTable("pharmacies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
});

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  medicines: jsonb("medicines").notNull(), // Array of medicine objects
  instructions: text("instructions"),
  status: text("status").default("pending"), // 'pending', 'dispensed', 'cancelled'
  abhaRef: text("abha_ref"), // ABHA reference ID
  createdAt: timestamp("created_at").defaultNow(),
  dispensedAt: timestamp("dispensed_at"),
  pharmacyId: varchar("pharmacy_id").references(() => pharmacies.id),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  type: text("type").notNull(), // 'checkup', 'follow-up', 'consultation'
  status: text("status").default("scheduled"), // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consentRequests = pgTable("consent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const healthRecords = pgTable("health_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  type: text("type").notNull(), // 'lab', 'imaging', 'visit', 'prescription'
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  recordDate: timestamp("record_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  patient: one(patients, { fields: [users.id], references: [patients.userId] }),
  pharmacy: one(pharmacies, { fields: [users.id], references: [pharmacies.userId] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
  consentRequests: many(consentRequests),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
  consentRequests: many(consentRequests),
  healthRecords: many(healthRecords),
}));

export const pharmaciesRelations = relations(pharmacies, ({ one, many }) => ({
  user: one(users, { fields: [pharmacies.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  pharmacy: one(pharmacies, { fields: [prescriptions.pharmacyId], references: [pharmacies.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true }).extend({
  specialization: z.string().min(2, "Specialization is required"),
  licenseNumber: z.string().min(5, "Valid license number is required"),
  hospital: z.string().min(2, "Hospital name is required")
});
export const insertPatientSchema = createInsertSchema(patients).omit({ id: true }).extend({
  dateOfBirth: z.coerce.date().refine((date) => !isNaN(date.getTime()), 'Invalid date').optional()
});
export const insertPharmacySchema = createInsertSchema(pharmacies).omit({ id: true }).extend({
  licenseNumber: z.string().min(5, "Valid license number is required"),
  address: z.string().min(10, "Complete address is required")
});
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true, dispensedAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertConsentRequestSchema = createInsertSchema(consentRequests).omit({ id: true, requestedAt: true, respondedAt: true });
export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type InsertPharmacy = z.infer<typeof insertPharmacySchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type ConsentRequest = typeof consentRequests.$inferSelect;
export type InsertConsentRequest = z.infer<typeof insertConsentRequestSchema>;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
