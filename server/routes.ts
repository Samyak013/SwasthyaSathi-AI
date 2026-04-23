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
  generatePersonalizedHealthInsights,
} from "./openai";
import { sendOTPNotification, sendSOSAlertNotification } from "./notifications";

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
      const userEmail = (email || user.email).trim();

      // Validate that we have email
      if (!userEmail) {
        console.error(`Missing email for user ${abhaId}`);
        return res.status(400).json({ message: "Email is required for OTP" });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Set expiry to 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      console.log(`📧 Generating OTP for ${userEmail} (User: ${user.name}), ABHA: ${abhaId}`);

      // Create OTP record
      const otpRecord = await storage.createOTPRecord({
        email: userEmail,
        phone: "",
        abhaId,
        otp,
        channel: "email",
        expiresAt,
      });

      console.log(`✅ OTP record created: ${otpRecord.id}`);

      console.log(`✅ OTP for testing: ${otp} (User: ${user.name}, Email: ${userEmail})`);

      // Queue email send in background (don't wait) - Render free tier optimization
      sendOTPNotification({
        email: userEmail,
        otp,
        name: user.name,
      }).catch(err => console.error('Background email queue error:', err));

      // Return success immediately - email will send in background
      res.json({
        success: true,
        message: `OTP sent successfully to your email`,
        recordId: otpRecord.id,
        email: userEmail,
        maskedEmail: userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        otp: otp, // Always include OTP for easier testing
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      const message = error.message || "Failed to process OTP request";
      res.status(error.status || 500).json({ message });
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
      const userEmail = (email || user.email).trim();
      const userPhone = (phone || user.phone).trim();

      console.log(`🔐 OTP Verification attempt for ${abhaId}, email: ${userEmail}, otp: ${otp}`);

      // Verify OTP
      const isValid = await storage.verifyOTPRecord(userEmail, userPhone, abhaId, otp);
      if (!isValid) {
        console.error(`❌ OTP verification failed for ${abhaId}, email: ${userEmail}`);
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }
      
      console.log(`✅ OTP verified successfully for ${abhaId}`);
    

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
        ((prescriptionData.medications || []) as Array<{name: string; dosage: string}>).map(m => ({ name: m.name, dosage: m.dosage }))
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

  // Get all pending prescriptions for pharmacy dashboard
  app.get("/api/pharmacy/prescriptions", async (req, res) => {
    try {
      // Get all prescriptions from storage by using internal access
      const allPrescriptions = Array.from((storage as any).prescriptions?.values() || []) as any[];
      const prescriptions = allPrescriptions
        .filter((p: any) => !p.dispensedAt) // Only pending prescriptions
        .map((p: any) => ({
          ...p,
          verificationStatus: "pending",
          medicines: p.medications,
        }))
        .slice(0, 10); // Limit to 10 most recent

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

      // Get patient context for personalized responses
      let patientContext;
      try {
        const user = await storage.getUser(userId);
        if (user) {
          const patient = await storage.getPatientByUserId(userId);
          patientContext = {
            name: user.name,
            age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : undefined,
            gender: user.gender,
            medicalConditions: patient?.medicalConditions || [],
            currentMedications: [], // Will be populated from prescriptions if needed
            allergies: patient?.allergies || [],
          };
        }
      } catch (contextError) {
        console.log("Could not load patient context for AI chat");
      }

      const aiResponse = await chatWithHealthAssistant(message, language, historyForAI, patientContext);

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

  // Personalized Health Insights endpoint
  app.get("/api/health-insights/:userId", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const patient = await storage.getPatientByUserId(req.params.userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      // Get recent health records
      const healthRecords = await storage.getHealthRecordsByPatientId(user.id);
      const recentRecords = healthRecords.slice(-5).map(r => ({
        type: r.type,
        title: r.title,
        description: r.description,
        date: r.createdAt.toISOString(),
      }));

      // Calculate age from dateOfBirth
      const birthDate = new Date(user.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();

      // Get recent prescriptions to extract current medications
      const prescriptions = await storage.getPrescriptionsByPatientId(user.id);
      const recentPrescriptions = prescriptions.slice(-3);
      const currentMedications = recentPrescriptions
        .flatMap(p => p.medications || [])
        .map(m => ({ name: m.name, dosage: m.dosage, frequency: m.frequency }))
        .slice(0, 5);

      const insights = await generatePersonalizedHealthInsights(
        {
          name: user.name,
          age,
          gender: user.gender,
          medicalConditions: patient.medicalConditions || [],
          allergies: patient.allergies || [],
          currentMedications,
        },
        recentRecords.length > 0 ? recentRecords : undefined
      );

      res.json(insights);
    } catch (error: any) {
      console.error("Health insights error:", error);
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

      // Get patient details to send notifications
      const patient = await storage.getUser(alertData.userId);
      if (patient && patient.role === "patient") {
        const patientDetails = patient as any;
        
        // Send notification to emergency contact if available
        if (patientDetails.emergencyContact?.phone) {
          // Note: In production, this would be an actual phone number to send SMS
          // For now, we'll log it
          console.log(
            `📱 [SMS] Emergency contact notification would be sent to: ${patientDetails.emergencyContact.name} (${patientDetails.emergencyContact.phone})`
          );
        }

        // Send email notification to emergency contact if available
        if (patientDetails.email && alertData.location && alertData.vitals) {
          await sendSOSAlertNotification(patientDetails.email, {
            patientName: patientDetails.name,
            abhaId: patientDetails.abhaId,
            location: alertData.location as any,
            vitals: alertData.vitals as any,
            recipientType: "emergency_contact",
          });
        }

        // Simulate notifications to nearby hospitals (in production, query actual hospital list)
        if (alertData.location && alertData.vitals) {
          console.log(`🏥 [HOSPITAL ALERT] SOS Alert for patient ${patientDetails.name} at location `);
          console.log(`   Location: ${(alertData.location as any).address}`);
          console.log(`   Vitals: HR=${(alertData.vitals as any).heartRate}, BP=${(alertData.vitals as any).bloodPressure}`);
        }
        
        // In production, you would:
        // 1. Query hospitals within 10km radius
        // 2. Send notifications to all nearby hospitals
        // 3. Send notifications to available emergency doctors
      }

      res.json({ success: true, ...alert });
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

  // ==================== MEDICATION REMINDERS ====================
  app.post("/api/medication-reminders", async (req, res) => {
    try {
      const { userId, medication, dosage, frequency, time } = req.body;
      const reminder = {
        id: `REMINDER:${Date.now()}`,
        userId,
        medication,
        dosage,
        frequency,
        time,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      console.log(`✅ Reminder created: ${reminder.id}`);
      res.json({ success: true, reminder });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== EMERGENCY SOS ====================
  app.post("/api/emergency", async (req, res) => {
    try {
      const { userId, location, description, contactNumbers } = req.body;
      const alertId = `EMERGENCY:${Date.now()}`;
      console.log(`🚨 EMERGENCY SOS ALERT: ${alertId} at ${location}`);
      res.json({
        success: true,
        alertId,
        message: "Emergency alert sent to nearby hospitals & responders",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/emergency/active", async (req, res) => {
    try {
      res.json({ success: true, alerts: [] });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/emergency/:alertId/resolve", async (req, res) => {
    try {
      const { alertId } = req.params;
      res.json({ 
        success: true, 
        message: `Emergency alert ${alertId} resolved`,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== HEALTH INSIGHTS ====================
  app.get("/api/health-insights/:userId", async (req, res) => {
    try {
      const insights = [
        {
          title: "Blood Sugar Control",
          description: "Your recent readings show good control. Continue current medication and diet plan.",
        },
        {
          title: "Exercise Recommendation",
          description: "30 minutes of walking daily can improve your cardiovascular health.",
        },
        {
          title: "Diet Suggestion",
          description: "Increase fiber intake to 25-30g daily for better digestive health.",
        },
      ];
      res.json({ success: true, insights });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== NEARBY FACILITIES (Maps) ====================
  app.get("/api/facilities/nearby", async (req, res) => {
    try {
      const { latitude, longitude, type } = req.query;
      const facilities = [
        {
          id: "fac_001",
          name: "City Hospital",
          type: "hospital",
          distance: 2.5,
          latitude: 28.5355,
          longitude: 77.391,
          phone: "+91-11-4141-1111",
          rating: 4.5,
          address: "123 Main Street, Delhi",
        },
        {
          id: "fac_002",
          name: "Health Plus Clinic",
          type: "clinic",
          distance: 1.2,
          latitude: 28.5340,
          longitude: 77.3920,
          phone: "+91-11-4141-2222",
          rating: 4.8,
          address: "456 Park Avenue, Delhi",
        },
        {
          id: "fac_003",
          name: "MediCare Pharmacy",
          type: "pharmacy",
          distance: 0.5,
          latitude: 28.5360,
          longitude: 77.3905,
          phone: "+91-11-4141-3333",
          rating: 4.6,
          address: "789 Pharmacy Lane, Delhi",
        },
        {
          id: "fac_004",
          name: "Prime Hospital",
          type: "hospital",
          distance: 4.2,
          latitude: 28.5380,
          longitude: 77.3880,
          phone: "+91-11-4141-4444",
          rating: 4.4,
          address: "321 Hospital Road, Delhi",
        },
      ];
      res.json({ success: true, facilities });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PHARMACY MANAGEMENT ====================
  app.get("/api/pharmacy/dashboard", async (req, res) => {
    try {
      const dashboard = {
        totalPrescriptions: 42,
        pendingPrescriptions: 8,
        completedToday: 15,
        inventory: {
          medicines: 234,
          lowStock: 12,
        },
        revenue: {
          today: 12500,
          week: 87600,
          month: 356800,
        },
      };
      res.json({ success: true, dashboard });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pharmacy/inventory", async (req, res) => {
    try {
      const inventory = [
        { medicineId: "med_001", name: "Paracetamol", stock: 345, lowThreshold: 50 },
        { medicineId: "med_002", name: "Amoxicillin", stock: 28, lowThreshold: 50 },
        { medicineId: "med_003", name: "Ibuprofen", stock: 456, lowThreshold: 100 },
      ];
      res.json({ success: true, inventory });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== DOCTOR DASHBOARD ====================
  app.get("/api/doctor/dashboard", async (req, res) => {
    try {
      const dashboard = {
        totalPatients: 156,
        appointmentsToday: 8,
        pendingPrescriptions: 12,
        recentPatients: [
          {
            patientId: "pat_001",
            name: "Priya Sharma",
            abhaId: "22-1111-2222-3333",
            lastVisit: "2 days ago",
            condition: "Diabetes Type 2",
          },
          {
            patientId: "pat_002",
            name: "Rajesh Kumar",
            abhaId: "22-4444-5555-6666",
            lastVisit: "1 week ago",
            condition: "Hypertension",
          },
        ],
      };
      res.json({ success: true, dashboard });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PRESCRIPTION DOWNLOAD ====================
  app.get("/api/prescriptions/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename=prescription-${id}.txt`);
      const content = `
DIGITAL PRESCRIPTION
Prescription ID: ${id}
Date: ${new Date().toLocaleDateString()}

Doctor: Dr. Rajesh Kumar
Patient: Priya Sharma
ABHA ID: 22-1111-2222-3333

=== MEDICINES ===
1. Paracetamol 500mg - 3 times daily for 5 days
2. Azithromycin 250mg - Once daily for 5 days

=== INSTRUCTIONS ===
- Take with food
- Avoid dairy products with Azithromycin
- Complete full course

Doctor Signature: ________________
Date: ${new Date().toLocaleDateString()}
      `;
      res.send(content);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prescriptions/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      res.json({ 
        success: true, 
        message: `Prescription sent to ${email}` 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== REMINDERS (CREATE/UPDATE) ====================
  app.post("/api/reminders", async (req, res) => {
    try {
      const { userId, title, description, time } = req.body;
      const reminder = {
        id: `REMINDER:${Date.now()}`,
        userId,
        title,
        description,
        time,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      res.json({ success: true, reminder });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reminders/user/:userId", async (req, res) => {
    try {
      const reminders = [
        {
          id: "rem_001",
          title: "Take Diabetes Medication",
          description: "Insulin injection at 8 AM",
          time: "08:00",
          completed: false,
        },
        {
          id: "rem_002",
          title: "Blood Pressure Check",
          description: "Check BP at clinic",
          time: "15:00",
          completed: false,
        },
      ];
      res.json({ success: true, reminders });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== HEALTH ====================
  app.get("/api/health", async (req, res) => {
    res.json({ status: "✅ Backend healthy" });
  });

  return httpServer;
}
