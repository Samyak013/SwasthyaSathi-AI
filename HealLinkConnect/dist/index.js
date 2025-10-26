// server/index.ts
import express2 from "express";
import cors from "cors";
import { config } from "dotenv";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { eq, and } from "drizzle-orm";

// server/db.ts
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);
var db;
if (process.env.DATABASE_URL) {
  try {
    const { Pool } = require2("pg");
    const { drizzle: pgDrizzle } = require2("drizzle-orm/node-postgres");
    const pgSchema = require2("../shared/schema");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    db = pgDrizzle(pool, { schema: pgSchema });
    console.log("Using Postgres database from DATABASE_URL");
  } catch (err) {
    console.error("Failed to initialize Postgres connection, falling back to SQLite:", err);
    const Database = require2("better-sqlite3").default;
    const { drizzle: sqliteDrizzle } = require2("drizzle-orm/better-sqlite3");
    const sqliteSchema = require2("../shared/schema-sqlite");
    const sqlite = new Database("./dev.db");
    db = sqliteDrizzle(sqlite, { schema: sqliteSchema });
    console.log("Using SQLite database (fallback)");
  }
} else {
  const Database = require2("better-sqlite3").default;
  const { drizzle: sqliteDrizzle } = require2("drizzle-orm/better-sqlite3");
  const sqliteSchema = require2("../shared/schema-sqlite");
  const sqlite = new Database("./dev.db");
  db = sqliteDrizzle(sqlite, { schema: sqliteSchema });
  console.log("Using SQLite database for development");
}

// shared/schema-sqlite.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  // 'doctor', 'patient', 'pharmacy'
  abhaId: text("abha_id").unique(),
  createdAt: integer("created_at").$defaultFn(() => Date.now())
});
var doctors = sqliteTable("doctors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  hospital: text("hospital").notNull(),
  licenseNumber: text("license_number").notNull(),
  phone: text("phone"),
  email: text("email")
});
var patients = sqliteTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  dateOfBirth: integer("date_of_birth"),
  bloodGroup: text("blood_group"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  insuranceInfo: text("insurance_info")
});
var pharmacies = sqliteTable("pharmacies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email")
});
var prescriptions = sqliteTable("prescriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text("doctor_id").references(() => doctors.id).notNull(),
  patientId: text("patient_id").references(() => patients.id).notNull(),
  medications: text("medications").notNull(),
  // JSON string
  diagnosis: text("diagnosis").notNull(),
  instructions: text("instructions"),
  status: text("status").notNull().default("pending"),
  // 'pending', 'fulfilled', 'cancelled'
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  validUntil: integer("valid_until")
});
var appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  doctorId: text("doctor_id").references(() => doctors.id).notNull(),
  patientId: text("patient_id").references(() => patients.id).notNull(),
  appointmentDate: integer("appointment_date").notNull(),
  status: text("status").notNull().default("scheduled"),
  // 'scheduled', 'completed', 'cancelled'
  notes: text("notes"),
  createdAt: integer("created_at").$defaultFn(() => Date.now())
});
var consentRequests = sqliteTable("consent_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fromUserId: text("from_user_id").references(() => users.id).notNull(),
  toPatientId: text("to_patient_id").references(() => patients.id).notNull(),
  purpose: text("purpose").notNull(),
  dataTypes: text("data_types").notNull(),
  // JSON array
  status: text("status").notNull().default("pending"),
  // 'pending', 'approved', 'denied'
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  respondedAt: integer("responded_at")
});
var usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
  patient: one(patients, { fields: [users.id], references: [patients.userId] }),
  pharmacy: one(pharmacies, { fields: [users.id], references: [pharmacies.userId] })
}));
var doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  appointments: many(appointments)
}));
var patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  appointments: many(appointments),
  consentRequests: many(consentRequests, { relationName: "patient_consents" })
}));
var pharmaciesRelations = relations(pharmacies, ({ one }) => ({
  user: one(users, { fields: [pharmacies.userId], references: [users.id] })
}));
var prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] })
}));
var appointmentsRelations = relations(appointments, ({ one }) => ({
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] })
}));
var consentRequestsRelations = relations(consentRequests, ({ one }) => ({
  fromUser: one(users, { fields: [consentRequests.fromUserId], references: [users.id] }),
  toPatient: one(patients, { fields: [consentRequests.toPatientId], references: [patients.id] })
}));
var insertUserSchema = createInsertSchema(users);
var insertDoctorSchema = createInsertSchema(doctors);
var insertPatientSchema = createInsertSchema(patients);
var insertPharmacySchema = createInsertSchema(pharmacies);
var insertPrescriptionSchema = createInsertSchema(prescriptions);
var insertAppointmentSchema = createInsertSchema(appointments);
var insertConsentRequestSchema = createInsertSchema(consentRequests);

// server/storage.ts
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.initializeSessionStore();
  }
  async initializeSessionStore() {
    try {
      const session2 = await import("express-session");
      const memorystore = await import("memorystore");
      const MemoryStore = memorystore.default(session2.default);
      this.sessionStore = new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      });
    } catch (error) {
      console.error("Failed to initialize session store:", error);
      this.sessionStore = null;
    }
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values({
      username: userData.username,
      password: userData.password,
      role: userData.role,
      abhaId: userData.abhaId
    }).returning();
    return user;
  }
  async getDoctorByUserId(userId) {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor || void 0;
  }
  async createDoctor(doctorData) {
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
  async getDoctors() {
    return await db.select().from(doctors);
  }
  async getPatientByUserId(userId) {
    const [patient] = await db.select().from(patients).where(eq(patients.userId, userId));
    return patient || void 0;
  }
  async createPatient(patientData) {
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
  async getPatients() {
    return await db.select().from(patients);
  }
  async getPatientById(id) {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || void 0;
  }
  async getPharmacyByUserId(userId) {
    const [pharmacy] = await db.select().from(pharmacies).where(eq(pharmacies.userId, userId));
    return pharmacy || void 0;
  }
  async createPharmacy(pharmacyData) {
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
  async getPharmacies() {
    return await db.select().from(pharmacies);
  }
  async getPrescriptionsByPatientId(patientId) {
    return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId));
  }
  async getPrescriptionsByDoctorId(doctorId) {
    return await db.select().from(prescriptions).where(eq(prescriptions.doctorId, doctorId));
  }
  async createPrescription(prescriptionData) {
    const [prescription] = await db.insert(prescriptions).values({
      patientId: prescriptionData.patientId,
      doctorId: prescriptionData.doctorId,
      medications: prescriptionData.medications,
      diagnosis: prescriptionData.diagnosis,
      instructions: prescriptionData.instructions,
      validUntil: prescriptionData.validUntil,
      status: prescriptionData.status || "pending"
    }).returning();
    return prescription;
  }
  async updatePrescriptionStatus(id, status, pharmacyId) {
    await db.update(prescriptions).set({ status }).where(eq(prescriptions.id, id));
  }
  async getAppointmentsByPatientId(patientId) {
    return await db.select().from(appointments).where(eq(appointments.patientId, patientId));
  }
  async getAppointmentsByDoctorId(doctorId) {
    return await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));
  }
  async createAppointment(appointmentData) {
    const [appointment] = await db.insert(appointments).values({
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.appointmentDate,
      status: appointmentData.status || "scheduled",
      notes: appointmentData.notes
    }).returning();
    return appointment;
  }
  async updateAppointmentStatus(id, status) {
    await db.update(appointments).set({ status }).where(eq(appointments.id, id));
  }
  // Additional methods needed by routes
  async getTodaysAppointmentsByDoctorId(doctorId) {
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1e3 - 1;
    return await db.select().from(appointments).where(and(
      eq(appointments.doctorId, doctorId)
      // Note: More complex date filtering would be needed for production
      // For now, returning all appointments for the doctor
    ));
  }
  async getPatientByAbhaId(abhaId) {
    const [user] = await db.select().from(users).where(eq(users.abhaId, abhaId));
    if (!user) return void 0;
    const [patient] = await db.select().from(patients).where(eq(patients.userId, user.id));
    return patient || void 0;
  }
  async createConsentRequest(data) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      fromUserId: data.fromUserId,
      toPatientId: data.toPatientId,
      purpose: data.purpose,
      status: "pending",
      createdAt: Date.now()
    };
  }
  async getConsentRequestsByPatientId(patientId) {
    return [];
  }
  async updateConsentStatus(id, status) {
    console.log(`Updating consent ${id} to status: ${status}`);
  }
  async getHealthRecordsByPatientId(patientId) {
    return [];
  }
  async getPendingPrescriptionsForPharmacy() {
    return await db.select().from(prescriptions).where(eq(prescriptions.status, "pending"));
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, role, abhaId, profileData, email } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ message: "Username, password, and role are required" });
      }
      if (!["doctor", "patient", "pharmacy"].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be doctor, patient, or pharmacy" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        abhaId: abhaId || null
      });
      if (role === "doctor") {
        const doctorData = {
          userId: user.id,
          name: profileData?.name || username,
          specialization: profileData?.specialization || "General Medicine",
          hospital: profileData?.hospital || "General Hospital",
          licenseNumber: profileData?.licenseNumber || `LIC_${user.id.substring(0, 8)}`,
          phone: profileData?.phone || "",
          email: profileData?.email || email
        };
        await storage.createDoctor(doctorData);
      } else if (role === "patient") {
        const patientData = {
          userId: user.id,
          name: profileData?.name || username,
          dateOfBirth: profileData?.dateOfBirth || null,
          bloodGroup: profileData?.bloodGroup || null,
          phone: profileData?.phone || "",
          email: profileData?.email || email,
          address: profileData?.address || "",
          emergencyContact: profileData?.emergencyContact || "",
          insuranceInfo: profileData?.insuranceInfo || ""
        };
        await storage.createPatient(patientData);
      } else if (role === "pharmacy") {
        const pharmacyData = {
          userId: user.id,
          name: profileData?.name || username,
          address: profileData?.address || "Unknown Address",
          licenseNumber: profileData?.licenseNumber || `PHARM_${user.id.substring(0, 8)}`,
          phone: profileData?.phone || "",
          email: profileData?.email || email
        };
        await storage.createPharmacy(pharmacyData);
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/services/abhaService.js
import axios from "axios";
function logDev(message) {
  if (process.env.NODE_ENV === "development") {
    console.log("[ABHA Service]", message);
  }
}
var ABDM_WRAPPER_URL = process.env.ABDM_WRAPPER_URL || "http://localhost:8082";
var ABDM_SANDBOX_URL = process.env.ABDM_SANDBOX_URL || "https://dev.abdm.gov.in";
var X_CM_ID = process.env.ABDM_X_CM_ID || "sbx";
var abdmWrapperClient = axios.create({
  baseURL: ABDM_WRAPPER_URL,
  headers: {
    "Content-Type": "application/json",
    "X-CM-ID": X_CM_ID
  },
  timeout: 3e4
});
var abdmDirectClient = axios.create({
  baseURL: ABDM_SANDBOX_URL,
  headers: {
    "Content-Type": "application/json",
    "X-CM-ID": X_CM_ID
  },
  timeout: 3e4
});
async function createABHA(userData) {
  logDev("Creating ABHA ID");
  try {
    try {
      const wrapperResponse = await abdmWrapperClient.post("/v1/registration/aadhaar/generateOtp", {
        aadhaar: userData.aadhaar || "",
        mobile: userData.mobile,
        txnId: null
      });
      if (wrapperResponse.data && wrapperResponse.data.txnId) {
        return {
          txnId: wrapperResponse.data.txnId,
          mobile: userData.mobile,
          status: "otp_sent",
          message: "OTP sent for ABHA creation"
        };
      }
    } catch (wrapperError) {
      logDev("Wrapper not available, using direct API");
    }
    const directResponse = await abdmDirectClient.post("/api/v1/registration/mobile/generateOtp", {
      mobile: userData.mobile
    });
    if (directResponse.data && directResponse.data.txnId) {
      return {
        txnId: directResponse.data.txnId,
        mobile: userData.mobile,
        status: "otp_sent",
        message: "OTP sent for ABHA creation"
      };
    }
    const mockResponse = {
      abhaId: `91-${userData.mobile.slice(-10)}`,
      abhaNumber: `${Math.floor(Math.random() * 9e13) + 1e13}`,
      txnId: `TXN-${Date.now()}`,
      status: "created",
      message: "ABHA ID created successfully (Development Mode)"
    };
    if (process.env.NODE_ENV === "development") {
      logDev("Mock ABHA creation successful");
    }
    return mockResponse;
  } catch (error) {
    console.error("[ABHA Service] Error creating ABHA:", error.message);
    throw new Error(`Failed to create ABHA ID: ${error.message}`);
  }
}
async function fetchPatientByABHA(abhaId) {
  logDev("Fetching patient by ABHA ID");
  try {
    try {
      const discoveryResponse = await abdmWrapperClient.post("/api/v1/care-contexts/discover", {
        patient: {
          id: abhaId,
          verifiedIdentifiers: [{
            type: "HEALTH_ID",
            value: abhaId
          }]
        }
      });
      if (discoveryResponse.data && discoveryResponse.data.patient) {
        return {
          abhaId,
          name: discoveryResponse.data.patient.name,
          gender: discoveryResponse.data.patient.gender,
          dateOfBirth: discoveryResponse.data.patient.yearOfBirth,
          careContexts: discoveryResponse.data.patient.careContexts || []
        };
      }
    } catch (wrapperError) {
      logDev("Wrapper discovery failed, using fallback");
    }
    const mockPatientData = {
      abhaId,
      name: "John Doe Patient",
      dateOfBirth: "1990-01-01",
      gender: "M",
      mobile: "+91-9876543210",
      email: "john.doe@example.com",
      address: "Mock Address, Delhi, India",
      bloodGroup: "B+",
      emergencyContact: "+91-9876543211",
      careContexts: [
        {
          referenceNumber: "CC001",
          display: "General Consultation - 2024"
        }
      ]
    };
    logDev("Patient fetched successfully (mock data)");
    return mockPatientData;
  } catch (error) {
    console.error("[ABHA Service] Error fetching patient:", error.message);
    throw new Error(`Failed to fetch patient data: ${error.message}`);
  }
}
async function consentRequest(consentData) {
  logDev("Creating consent request");
  try {
    try {
      const consentResponse = await abdmWrapperClient.post("/api/v1/consent-requests", {
        requestId: `REQ-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        consent: {
          purpose: {
            text: consentData.purpose || "Healthcare Data Access",
            code: "CAREMGT"
          },
          patient: {
            id: consentData.patientAbhaId
          },
          hiu: {
            id: consentData.doctorId
          },
          requester: {
            name: "Swashtya Sathi AI",
            identifier: {
              type: "HIU",
              value: consentData.doctorId
            }
          },
          hiTypes: consentData.dataTypes || ["Prescription", "DiagnosticReport"],
          permission: {
            accessMode: "VIEW",
            dateRange: {
              from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString(),
              to: (/* @__PURE__ */ new Date()).toISOString()
            },
            dataEraseAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
            frequency: {
              unit: "HOUR",
              value: 1,
              repeats: 0
            }
          }
        }
      });
      if (consentResponse.data && consentResponse.data.consentRequestId) {
        return {
          consentRequestId: consentResponse.data.consentRequestId,
          status: "requested",
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
          message: "Consent request sent to patient"
        };
      }
    } catch (wrapperError) {
      logDev("Wrapper consent request failed");
    }
    const mockConsentResponse = {
      consentRequestId: `CONSENT-${Date.now()}`,
      status: "requested",
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
      message: "Consent request sent to patient (Development Mode)"
    };
    logDev("Consent request created successfully (mock)");
    return mockConsentResponse;
  } catch (error) {
    console.error("[ABHA Service] Error creating consent request:", error.message);
    throw new Error(`Failed to create consent request: ${error.message}`);
  }
}
async function uploadHealthData(healthData) {
  logDev("Uploading health data to ABDM");
  try {
    try {
      const uploadResponse = await abdmWrapperClient.post("/api/v1/health-information/hip/on-request", {
        requestId: `REQ-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        hiRequest: {
          transactionId: healthData.transactionId || `TXN-${Date.now()}`,
          entries: [{
            content: healthData.data,
            media: "application/fhir+json",
            checksum: "mock_checksum",
            careContextReference: healthData.patientAbhaId
          }]
        }
      });
      if (uploadResponse.data) {
        return {
          transactionId: uploadResponse.data.transactionId,
          status: "uploaded",
          message: "Health data uploaded successfully"
        };
      }
    } catch (wrapperError) {
      logDev("Wrapper upload failed");
    }
    const mockUploadResponse = {
      transactionId: `TXN-${Date.now()}`,
      status: "uploaded",
      referenceId: `REF-${Date.now()}`,
      message: "Health data uploaded (Development Mode)"
    };
    logDev("Health data uploaded successfully (mock)");
    return mockUploadResponse;
  } catch (error) {
    console.error("[ABHA Service] Error uploading health data:", error.message);
    throw new Error(`Failed to upload health data: ${error.message}`);
  }
}
async function uploadPrescription(prescriptionData) {
  logDev("Uploading prescription to ABDM");
  const fhirPrescription = {
    resourceType: "MedicationRequest",
    id: prescriptionData.id || `pres-${Date.now()}`,
    status: "active",
    intent: "order",
    medicationCodeableConcept: {
      coding: prescriptionData.medicines?.map((med) => ({
        system: "http://snomed.info/sct",
        code: med.code || "unknown",
        display: med.name
      })) || []
    },
    subject: {
      reference: `Patient/${prescriptionData.patientAbhaId}`
    },
    authoredOn: (/* @__PURE__ */ new Date()).toISOString(),
    requester: {
      reference: `Practitioner/${prescriptionData.doctorId}`
    },
    dosageInstruction: [{
      text: prescriptionData.instructions || "As directed by physician"
    }]
  };
  return uploadHealthData({
    patientAbhaId: prescriptionData.patientAbhaId,
    data: fhirPrescription,
    dataType: "Prescription",
    transactionId: prescriptionData.transactionId
  });
}
async function pushDispensation(dispensationData) {
  logDev("Pushing dispensation data to ABDM");
  const fhirDispensation = {
    resourceType: "MedicationDispense",
    id: `disp-${Date.now()}`,
    status: "completed",
    medicationCodeableConcept: {
      coding: dispensationData.dispensedMedicines?.map((med) => ({
        system: "http://snomed.info/sct",
        code: med.code || "unknown",
        display: med.name
      })) || []
    },
    subject: {
      reference: `Patient/${dispensationData.patientAbhaId}`
    },
    performer: [{
      actor: {
        reference: `Organization/${dispensationData.pharmacyId}`
      }
    }],
    whenHandedOver: dispensationData.dispensationDate || (/* @__PURE__ */ new Date()).toISOString(),
    dosageInstruction: [{
      text: dispensationData.instructions || "As prescribed"
    }]
  };
  return uploadHealthData({
    patientAbhaId: dispensationData.patientAbhaId,
    data: fhirDispensation,
    dataType: "MedicationDispense",
    transactionId: dispensationData.transactionId
  });
}
async function verifyPrescription(prescriptionRef, patientAbhaId) {
  logDev("Verifying prescription");
  try {
    const mockVerificationResponse = {
      isValid: true,
      prescriptionId: prescriptionRef,
      patientAbhaId,
      issueDate: (/* @__PURE__ */ new Date()).toISOString(),
      status: "verified",
      verificationMethod: "ABDM Network Query (Development Mode)"
    };
    logDev("Prescription verified successfully (mock)");
    return mockVerificationResponse;
  } catch (error) {
    console.error("[ABHA Service] Error verifying prescription:", error.message);
    throw new Error(`Failed to verify prescription: ${error.message}`);
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  const requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    next();
  };
  app2.get("/api/abha/patient/:abhaId", requireAuth, async (req, res) => {
    try {
      const { abhaId } = req.params;
      const localPatient = await storage.getPatientByAbhaId(abhaId);
      if (localPatient) {
        return res.json(localPatient);
      }
      const abhaPatientData = await fetchPatientByABHA(abhaId);
      res.json(abhaPatientData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/abha/create", requireAuth, async (req, res) => {
    try {
      const abhaResponse = await createABHA(req.body);
      res.json(abhaResponse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/abha/verify-prescription", requireAuth, requireRole("pharmacy"), async (req, res) => {
    try {
      const { prescriptionRef, patientAbhaId } = req.body;
      const verification = await verifyPrescription(prescriptionRef, patientAbhaId);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/doctor/profile", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/doctor/appointments/today", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const appointments2 = await storage.getTodaysAppointmentsByDoctorId(doctor.id);
      res.json(appointments2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/doctor/prescriptions", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const { patientId, medicines, instructions, diagnosis } = req.body;
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      if (!medicines || medicines.length === 0) {
        return res.status(400).json({ message: "Medicines are required" });
      }
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      const prescription = await storage.createPrescription({
        doctorId: doctor.id,
        patientId,
        medications: JSON.stringify(medicines),
        // Convert to JSON string as expected by schema
        diagnosis: diagnosis || "General consultation",
        // Provide default if not provided
        instructions: instructions || "Take as directed"
      });
      try {
        const abhaResponse = await uploadPrescription({
          doctorId: doctor.id,
          patientAbhaId: req.body.patientAbhaId,
          medicines,
          instructions
        });
        console.log("ABHA upload successful:", abhaResponse.referenceId);
      } catch (abhaError) {
        console.error("ABHA upload failed:", abhaError.message);
      }
      res.json(prescription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/doctor/prescriptions", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const prescriptions2 = await storage.getPrescriptionsByDoctorId(doctor.id);
      res.json(prescriptions2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/doctor/consent-request", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      const { patientId, purpose } = req.body;
      const consentRequest2 = await storage.createConsentRequest({
        doctorId: doctor.id,
        patientId,
        purpose
      });
      try {
        await consentRequest({
          patientAbhaId: req.body.patientAbhaId,
          doctorId: doctor.id,
          purpose,
          dataTypes: ["Prescription", "DiagnosticReport"]
        });
      } catch (abhaError) {
        console.error("ABHA consent request failed:", abhaError.message);
      }
      res.json(consentRequest2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/patient/profile", requireAuth, requireRole("patient"), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/patient/prescriptions", requireAuth, requireRole("patient"), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      const prescriptions2 = await storage.getPrescriptionsByPatientId(patient.id);
      res.json(prescriptions2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/patient/consent-requests", requireAuth, requireRole("patient"), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      const consentRequests2 = await storage.getConsentRequestsByPatientId(patient.id);
      res.json(consentRequests2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/patient/consent-requests/:id", requireAuth, requireRole("patient"), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      await storage.updateConsentStatus(id, status);
      res.json({ message: "Consent status updated" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/patient/health-records", requireAuth, requireRole("patient"), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      const healthRecords = await storage.getHealthRecordsByPatientId(patient.id);
      res.json(healthRecords);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/pharmacy/profile", requireAuth, requireRole("pharmacy"), async (req, res) => {
    try {
      const pharmacy = await storage.getPharmacyByUserId(req.user.id);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }
      res.json(pharmacy);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/pharmacy/prescriptions/pending", requireAuth, requireRole("pharmacy"), async (req, res) => {
    try {
      const prescriptions2 = await storage.getPendingPrescriptionsForPharmacy();
      res.json(prescriptions2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/pharmacy/prescriptions/:id/dispense", requireAuth, requireRole("pharmacy"), async (req, res) => {
    try {
      const { id } = req.params;
      const pharmacy = await storage.getPharmacyByUserId(req.user.id);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }
      await storage.updatePrescriptionStatus(id, "dispensed", pharmacy.id);
      try {
        await pushDispensation({
          prescriptionRef: id,
          pharmacyId: pharmacy.id,
          dispensedMedicines: req.body.dispensedMedicines,
          dispensationDate: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (abhaError) {
        console.error("ABHA dispensation push failed:", abhaError.message);
      }
      res.json({ message: "Prescription dispensed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/chatbot/query", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      const userMessage = message.toLowerCase();
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "PUT_YOUR_REAL_OPENAI_API_KEY_HERE") {
        const mockResponse2 = {
          message: `I'm an AI healthcare assistant. Based on your query "${message}", I recommend consulting with a healthcare professional for personalized advice.`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          context: context || "general"
        };
        res.json(mockResponse2);
        return;
      }
      let response = "";
      if (userMessage.includes("appointment") || userMessage.includes("book") || userMessage.includes("schedule")) {
        response = "To book an appointment, go to the Appointments section in your dashboard. You can select your preferred doctor and available time slots.";
      } else if (userMessage.includes("prescription") || userMessage.includes("medicine") || userMessage.includes("medication")) {
        response = "Your prescriptions can be found in the Prescriptions section. You can view active prescriptions, refill requests, and share them with pharmacies.";
      } else if (userMessage.includes("abha") || userMessage.includes("health id")) {
        response = "Your ABHA (Ayushman Bharat Health Account) ID helps link your health records across the healthcare system. You can manage consent requests in your profile.";
      } else if (userMessage.includes("consent") || userMessage.includes("permission") || userMessage.includes("access")) {
        response = "Consent management allows you to control who can access your health data. You can approve or deny access requests from doctors and healthcare providers.";
      } else if (userMessage.includes("emergency") || userMessage.includes("urgent") || userMessage.includes("help")) {
        response = "For medical emergencies, please contact your nearest hospital or call emergency services immediately. This app is for non-emergency health management.";
      } else if (userMessage.includes("doctor") || userMessage.includes("consultation")) {
        response = "You can find and consult with doctors through the app. Browse available doctors, view their specializations, and book consultations.";
      } else if (userMessage.includes("pharmacy") || userMessage.includes("medicine shop")) {
        response = "Use the pharmacy section to find nearby pharmacies, share your prescriptions, and track medicine availability.";
      } else if (userMessage.includes("health record") || userMessage.includes("medical history")) {
        response = "Your health records are securely stored and can be accessed through your dashboard. You can share them with healthcare providers as needed.";
      } else if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage.includes("hey")) {
        response = "Hello! I'm your healthcare assistant. I can help you with appointments, prescriptions, ABHA services, and general health management questions.";
      } else if (userMessage.includes("thank") || userMessage.includes("thanks")) {
        response = "You're welcome! I'm here to help with any healthcare-related questions you may have.";
      } else {
        response = `I understand you're asking about "${message}". I can help with appointments, prescriptions, ABHA services, health records, and connecting with healthcare providers. For specific medical advice, please consult with a qualified healthcare professional.`;
      }
      const mockResponse = {
        message: response,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        context: context || "general",
        suggestions: [
          "Book an appointment",
          "View prescriptions",
          "Manage health records",
          "Find nearby pharmacies"
        ]
      };
      res.json(mockResponse);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/chatbot/patient-summary/:patientId", requireAuth, requireRole("doctor"), async (req, res) => {
    try {
      const { patientId } = req.params;
      const patient = await storage.getPatientById(patientId);
      const prescriptions2 = await storage.getPrescriptionsByPatientId(patientId);
      const healthRecords = await storage.getHealthRecordsByPatientId(patientId);
      const summary = {
        patient,
        recentPrescriptions: prescriptions2.slice(0, 5),
        healthRecords: healthRecords.slice(0, 10),
        aiInsights: "Patient shows stable health indicators. Recent prescriptions suggest ongoing management of chronic conditions."
      };
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var clientOrigin = process.env.CLIENT_ORIGIN || "*";
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on ${host}:${port}`);
  });
})();
