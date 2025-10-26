import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'doctor', 'patient', 'pharmacy'
  abhaId: text("abha_id").unique(),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});

export const doctors = sqliteTable("doctors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  hospital: text("hospital").notNull(),
  licenseNumber: text("license_number").notNull(),
  phone: text("phone"),
  email: text("email"),
});

export const patients = sqliteTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dateOfBirth: integer("date_of_birth"),
  bloodGroup: text("blood_group"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  insuranceInfo: text("insurance_info"),
});

export const pharmacies = sqliteTable("pharmacies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
});

export const prescriptions = sqliteTable("prescriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text("doctor_id").references(() => doctors.id).notNull(),
  patientId: text("patient_id").references(() => patients.id).notNull(),
  medications: text("medications").notNull(), // JSON string
  diagnosis: text("diagnosis").notNull(),
  instructions: text("instructions"),
  status: text("status").notNull().default("pending"), // 'pending', 'fulfilled', 'cancelled'
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  validUntil: integer("valid_until"),
});

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text("doctor_id").references(() => doctors.id).notNull(),
  patientId: text("patient_id").references(() => patients.id).notNull(),
  appointmentDate: integer("appointment_date").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});

export const consentRequests = sqliteTable("consent_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text("from_user_id").references(() => users.id).notNull(),
  toPatientId: text("to_patient_id").references(() => patients.id).notNull(),
  purpose: text("purpose").notNull(),
  dataTypes: text("data_types").notNull(), // JSON array
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'denied'
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  respondedAt: integer("responded_at"),
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
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
  consentRequests: many(consentRequests, { relationName: "patient_consents" }),
}));

export const pharmaciesRelations = relations(pharmacies, ({ one }) => ({
  user: one(users, { fields: [pharmacies.userId], references: [users.id] }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
}));

export const consentRequestsRelations = relations(consentRequests, ({ one }) => ({
  fromUser: one(users, { fields: [consentRequests.fromUserId], references: [users.id] }),
  toPatient: one(patients, { fields: [consentRequests.toPatientId], references: [patients.id] }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertDoctorSchema = createInsertSchema(doctors);
export const insertPatientSchema = createInsertSchema(patients);
export const insertPharmacySchema = createInsertSchema(pharmacies);
export const insertPrescriptionSchema = createInsertSchema(prescriptions);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertConsentRequestSchema = createInsertSchema(consentRequests);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Pharmacy = typeof pharmacies.$inferSelect;
export type NewPharmacy = typeof pharmacies.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type ConsentRequest = typeof consentRequests.$inferSelect;
export type NewConsentRequest = typeof consentRequests.$inferInsert;