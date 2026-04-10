import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertDoctorSchema,
  insertPatientSchema,
  insertPharmacySchema,
  insertPrescriptionSchema,
  insertHealthRecordSchema,
  insertAppointmentSchema,
  insertReminderSchema,
  insertChatMessageSchema,
  insertAIChatHistorySchema,
  insertConsentRecordSchema,
  insertEmergencyAlertSchema,
} from "@shared/schema";
import {
  checkDrugInteractions,
  suggestDiagnosis,
  generateHealthRecordSummary,
  chatWithHealthAssistant,
  translateMessage,
  generatePrescriptionQRData,
  verifyPrescriptionQR,
  generateAnalyticsInsights,
} from "./openai";
import { sendOTPNotification } from "./notifications";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  const wss = new WebSocketServer({ noServer: true });

  const connectedClients = new Map<string, any>();

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on("connection", (ws) => {
    let userId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "auth") {
          userId = message.userId;
          if (userId) {
            connectedClients.set(userId, ws);
          }
        }

        if (message.type === "chat" && userId) {
          const chatMessage = await storage.createChatMessage({
            senderId: userId,
            receiverId: message.receiverId,
            message: message.message,
            language: message.language,
            translatedMessage: message.language !== "en" ? await translateMessage(message.message, "en") : "",
          });

          const receiverWs = connectedClients.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === 1) {
            receiverWs.send(JSON.stringify({ type: "chat", message: chatMessage }));
          }

          ws.send(JSON.stringify({ type: "chat_sent", messageId: chatMessage.id }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      if (userId) {
        connectedClients.delete(userId);
      }
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existing = await storage.getUserByAbhaId(userData.abhaId);
      if (existing) {
        return res.status(400).json({ message: "User with this ABHA ID already exists" });
      }

      const user = await storage.createUser(userData);

      if (user.role === "doctor") {
        const doctorData = z.object({
          specialization: z.string(),
          experience: z.number(),
          hospitalName: z.string(),
          hprId: z.string(),
        }).parse(req.body.doctorDetails);

        await storage.createDoctor({
          userId: user.id,
          ...doctorData,
        });
      } else if (user.role === "patient") {
        const patientData = z.object({
          bloodGroup: z.string().optional(),
          height: z.number().optional(),
          weight: z.number().optional(),
          medicalConditions: z.array(z.string()).optional(),
          allergies: z.array(z.string()).optional(),
          emergencyContact: z.object({
            name: z.string(),
            phone: z.string(),
            relation: z.string(),
          }).optional(),
        }).parse(req.body.patientDetails || {});

        await storage.createPatient({
          userId: user.id,
          ...patientData,
        });
      } else if (user.role === "pharmacy") {
        const pharmacyData = z.object({
          licenseNumber: z.string(),
          location: z.string(),
          operatingHours: z.object({
            open: z.string(),
            close: z.string(),
          }).optional(),
        }).parse(req.body.pharmacyDetails);

        await storage.createPharmacy({
          userId: user.id,
          ...pharmacyData,
        });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { abhaId, email, phone } = req.body;
      
      // Find user by ABHA ID
      const user = await storage.getUserByAbhaId(abhaId);
      if (!user) {
        console.error(`User not found for ABHA ID: ${abhaId}`);
        return res.status(404).json({ message: "User not found with this ABHA ID" });
      }

      // Use provided values or fall back to user data
      const userEmail = email || user.email;

      // Validate that we have email
      if (!userEmail) {
        console.error(`Missing email for user ${abhaId}`);
        return res.status(400).json({ message: "Email is required for OTP" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiry to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Create OTP record
      const otpRecord = await storage.createOTPRecord({
        email: userEmail,
        phone: "",
        abhaId,
        otp,
        channel: "email",
        expiresAt,
      });

      // Send OTP via email
      const notificationSent = await sendOTPNotification({
        email: userEmail,
        otp,
        name: user.name,
      });

      if (!notificationSent && process.env.NODE_ENV === 'production') {
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      // Log for development
      console.log(`✅ OTP sent via email to ${otpRecord.id}`);
      console.log(`   Email: ${userEmail}`);
      console.log(`   OTP: ${otp}`);

      res.json({
        success: true,
        message: `OTP sent successfully to your email`,
        recordId: otpRecord.id,
        email: userEmail,
        maskedEmail: userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { abhaId, email, phone, otp } = req.body;

      // Validate input
      if (!abhaId || !otp) {
        return res.status(400).json({ message: "ABHA ID and OTP are required" });
      }

      // Find user
      const user = await storage.getUserByAbhaId(abhaId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Use provided values or fall back to user data
      const userEmail = email || user.email;
      const userPhone = phone || user.phone;

      // Verify OTP
      const isValid = await storage.verifyOTPRecord(userEmail, userPhone, abhaId, otp);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }

      // Get user profile data
      let profileData = null;
      if (user.role === "doctor") {
        profileData = await storage.getDoctorByUserId(user.id);
      } else if (user.role === "patient") {
        profileData = await storage.getPatientByUserId(user.id);
      } else if (user.role === "pharmacy") {
        profileData = await storage.getPharmacyByUserId(user.id);
      }

      res.json({
        success: true,
        message: "OTP verified successfully",
        user,
        profileData,
      });
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      const doctorsWithUsers = await Promise.all(
        doctors.map(async (doctor) => {
          const user = await storage.getUser(doctor.userId);
          return { ...doctor, user };
        })
      );
      res.json(doctorsWithUsers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/doctors/search/:abhaId", async (req, res) => {
    try {
      const patient = await storage.getUserByAbhaId(req.params.abhaId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      
      const interactionCheck = await checkDrugInteractions(
        (prescriptionData.medications || []).map(m => ({ name: m.name, dosage: m.dosage }))
      );
      const qrCode = await generatePrescriptionQRData(
        "temp-id",
        prescriptionData.doctorId,
        prescriptionData.patientId
      );

      const prescription = await storage.createPrescription({
        ...prescriptionData,
        aiInteractionCheck: interactionCheck,
        qrCode,
        digitalSignature: `SIGN_${Date.now()}`,
      });

      const medications = prescription.medications || [];
      for (const med of medications) {
        await storage.createReminder({
          userId: prescription.patientId,
          type: "medicine",
          title: `Take ${med.name}`,
          message: `${med.dosage} - ${med.frequency}`,
          scheduledAt: new Date(Date.now() + 3600000),
          prescriptionId: prescription.id,
        });
      }

      res.json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/prescriptions/patient/:patientId", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptionsByPatientId(req.params.patientId);
      const enrichedPrescriptions = await Promise.all(
        prescriptions.map(async (prescription) => {
          let doctorName = "Unknown Doctor";
          let doctorSpecialization = "";
          if (prescription.doctorId) {
            const doctor = await storage.getUser(prescription.doctorId);
            if (doctor) {
              doctorName = doctor.name;
              const doctorProfile = await storage.getDoctorByUserId(doctor.id);
              if (doctorProfile) {
                doctorSpecialization = doctorProfile.specialization;
              }
            }
          }
          return {
            ...prescription,
            doctorName,
            doctorSpecialization,
            prescriptionDate: prescription.createdAt,
            prescriptionId: prescription.qrCode || prescription.id,
            verificationStatus: prescription.dispensedAt ? "verified" : "pending",
            medicines: prescription.medications,
          };
        })
      );
      res.json(enrichedPrescriptions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/prescriptions/doctor/:doctorId", async (req, res) => {
    try {
      const prescriptions = await storage.getPrescriptionsByDoctorId(req.params.doctorId);
      res.json(prescriptions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/prescriptions/verify", async (req, res) => {
    try {
      const { qrCode } = req.body;
      const result = await verifyPrescriptionQR(qrCode);
      
      if (result.valid && result.prescriptionId) {
        const prescription = await storage.getPrescription(result.prescriptionId);
        res.json({ valid: true, prescription });
      } else {
        res.json({ valid: false, error: result.error });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/prescriptions/:id/dispense", async (req, res) => {
    try {
      const { pharmacyId } = req.body;
      const prescription = await storage.updatePrescription(req.params.id, {
        dispensedAt: new Date(),
        dispensedBy: pharmacyId,
      });
      res.json(prescription);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/health-records", async (req, res) => {
    try {
      const recordData = insertHealthRecordSchema.parse(req.body);
      
      let aiSummary = "";
      if (recordData.data) {
        const summary = await generateHealthRecordSummary(recordData.data);
        aiSummary = summary.summary;
      }

      const record = await storage.createHealthRecord({
        ...recordData,
        aiSummary,
      });

      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/health-records/patient/:patientId", async (req, res) => {
    try {
      const records = await storage.getHealthRecordsByPatientId(req.params.patientId);
      const enrichedRecords = await Promise.all(
        records.map(async (record) => {
          let doctorName = "Unknown Doctor";
          if (record.doctorId) {
            const doctor = await storage.getUser(record.doctorId);
            if (doctor) {
              doctorName = doctor.name;
            }
          }
          return {
            ...record,
            recordType: record.type,
            recordDate: record.createdAt,
            summary: record.description,
            doctorName,
          };
        })
      );
      res.json(enrichedRecords);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);

      await storage.createReminder({
        userId: appointment.patientId,
        type: "appointment",
        title: "Upcoming Appointment",
        message: `Appointment scheduled at ${appointment.scheduledAt.toLocaleString()}`,
        scheduledAt: new Date(appointment.scheduledAt.getTime() - 3600000),
        appointmentId: appointment.id,
      });

      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByPatientId(req.params.patientId);
      res.json(appointments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDoctorId(req.params.doctorId);
      res.json(appointments);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/reminders/:userId", async (req, res) => {
    try {
      const reminders = await storage.getRemindersByUserId(req.params.userId);
      res.json(reminders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/reminders/:id/complete", async (req, res) => {
    try {
      const reminder = await storage.updateReminder(req.params.id, { completed: true });
      res.json(reminder);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/chat/:userId1/:userId2", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesBetweenUsers(
        req.params.userId1,
        req.params.userId2
      );
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { userId, message, language } = req.body;
      
      await storage.createAIChatHistory({
        userId,
        role: "user",
        message,
        language,
      });

      const chatHistory = await storage.getAIChatHistoryByUserId(userId);
      const historyForAI = chatHistory.slice(-10).map((h) => ({
        role: h.role,
        message: h.message,
      }));

      const aiResponse = await chatWithHealthAssistant(message, language, historyForAI);

      await storage.createAIChatHistory({
        userId,
        role: "assistant",
        message: aiResponse,
        language,
      });

      res.json({ message: aiResponse });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/ai-chat/history/:userId", async (req, res) => {
    try {
      const history = await storage.getAIChatHistoryByUserId(req.params.userId);
      res.json(history);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/diagnosis/suggest", async (req, res) => {
    try {
      const { symptoms, medicalHistory } = req.body;
      const suggestions = await suggestDiagnosis(symptoms, medicalHistory);
      res.json(suggestions);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/consent", async (req, res) => {
    try {
      const consentData = insertConsentRecordSchema.parse(req.body);
      const consent = await storage.createConsentRecord(consentData);
      res.json(consent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/consent/patient/:patientId", async (req, res) => {
    try {
      const consents = await storage.getConsentRecordsByPatientId(req.params.patientId);
      res.json(consents);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/consent/:id/revoke", async (req, res) => {
    try {
      const consent = await storage.updateConsentRecord(req.params.id, {
        granted: false,
        revokedAt: new Date(),
      });
      res.json(consent);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/emergency", async (req, res) => {
    try {
      const alertData = insertEmergencyAlertSchema.parse(req.body);
      const alert = await storage.createEmergencyAlert(alertData);
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/emergency/active", async (req, res) => {
    try {
      const alerts = await storage.getActiveEmergencyAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/emergency/:id/resolve", async (req, res) => {
    try {
      const { responderId } = req.body;
      const alert = await storage.updateEmergencyAlert(req.params.id, {
        status: "resolved",
        respondedBy: responderId,
        resolvedAt: new Date(),
      });
      res.json(alert);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/analytics/insights", async (req, res) => {
    try {
      const { data } = req.body;
      const insights = await generateAnalyticsInsights(data);
      res.json(insights);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return httpServer;
}
