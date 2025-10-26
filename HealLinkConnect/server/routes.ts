import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

// Import ABHA service
import * as abhaService from './services/abhaService.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Helper function to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Helper function to check role
  const requireRole = (role: string) => (req: any, res: any, next: any) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    next();
  };

  // =============================================================================
  // ABHA Integration Routes
  // =============================================================================

  // Search patient by ABHA ID
  app.get("/api/abha/patient/:abhaId", requireAuth, async (req, res) => {
    try {
      const { abhaId } = req.params;
      
      // First check local database
      const localPatient = await storage.getPatientByAbhaId(abhaId);
      if (localPatient) {
        return res.json(localPatient);
      }
      
      // If not found locally, fetch from ABHA service
      const abhaPatientData = await abhaService.fetchPatientByABHA(abhaId);
      res.json(abhaPatientData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create ABHA ID
  app.post("/api/abha/create", requireAuth, async (req, res) => {
    try {
      const abhaResponse = await abhaService.createABHA(req.body);
      res.json(abhaResponse);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Verify prescription via ABHA
  app.post("/api/abha/verify-prescription", requireAuth, requireRole('pharmacy'), async (req, res) => {
    try {
      const { prescriptionRef, patientAbhaId } = req.body;
      const verification = await abhaService.verifyPrescription(prescriptionRef, patientAbhaId);
      res.json(verification);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================================================
  // Doctor Routes
  // =============================================================================

  // Get doctor profile
  app.get("/api/doctor/profile", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user!.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      res.json(doctor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get today's appointments for doctor
  app.get("/api/doctor/appointments/today", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user!.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      const appointments = await storage.getTodaysAppointmentsByDoctorId(doctor.id);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create prescription
  app.post("/api/doctor/prescriptions", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user!.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      const { patientId, medicines, instructions, diagnosis } = req.body;
      
      // Validate required fields
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      if (!medicines || medicines.length === 0) {
        return res.status(400).json({ message: "Medicines are required" });
      }
      
      // Verify patient exists
      const patient = await storage.getPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const prescription = await storage.createPrescription({
        doctorId: doctor.id,
        patientId,
        medications: JSON.stringify(medicines), // Convert to JSON string as expected by schema
        diagnosis: diagnosis || "General consultation", // Provide default if not provided
        instructions: instructions || "Take as directed"
      });

      // Upload to ABDM (mock implementation)
      try {
        const abhaResponse = await abhaService.uploadPrescription({
          doctorId: doctor.id,
          patientAbhaId: req.body.patientAbhaId,
          medicines,
          instructions
        });
        
        // Note: Could store ABHA reference in a separate field if needed
        console.log('ABHA upload successful:', abhaResponse.referenceId);
      } catch (abhaError: any) {
        console.error('ABHA upload failed:', abhaError.message);
      }

      res.json(prescription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get doctor's prescriptions
  app.get("/api/doctor/prescriptions", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user!.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      
      const prescriptions = await storage.getPrescriptionsByDoctorId(doctor.id);
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create consent request
  app.post("/api/doctor/consent-request", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const doctor = await storage.getDoctorByUserId(req.user!.id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }

      const { patientId, purpose } = req.body;
      
      const consentRequest = await storage.createConsentRequest({
        doctorId: doctor.id,
        patientId,
        purpose
      });

      // Create consent request in ABHA system
      try {
        await abhaService.consentRequest({
          patientAbhaId: req.body.patientAbhaId,
          doctorId: doctor.id,
          purpose,
          dataTypes: ['Prescription', 'DiagnosticReport']
        });
      } catch (abhaError: any) {
        console.error('ABHA consent request failed:', abhaError.message);
      }

      res.json(consentRequest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================================================
  // Patient Routes
  // =============================================================================

  // Get patient profile
  app.get("/api/patient/profile", requireAuth, requireRole('patient'), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      res.json(patient);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's prescriptions
  app.get("/api/patient/prescriptions", requireAuth, requireRole('patient'), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      const prescriptions = await storage.getPrescriptionsByPatientId(patient.id);
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's consent requests
  app.get("/api/patient/consent-requests", requireAuth, requireRole('patient'), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      const consentRequests = await storage.getConsentRequestsByPatientId(patient.id);
      res.json(consentRequests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update consent request status
  app.patch("/api/patient/consent-requests/:id", requireAuth, requireRole('patient'), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      await storage.updateConsentStatus(id, status);
      res.json({ message: "Consent status updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient's health records
  app.get("/api/patient/health-records", requireAuth, requireRole('patient'), async (req, res) => {
    try {
      const patient = await storage.getPatientByUserId(req.user!.id);
      if (!patient) {
        return res.status(404).json({ message: "Patient profile not found" });
      }
      
      const healthRecords = await storage.getHealthRecordsByPatientId(patient.id);
      res.json(healthRecords);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================================================
  // Pharmacy Routes
  // =============================================================================

  // Get pharmacy profile
  app.get("/api/pharmacy/profile", requireAuth, requireRole('pharmacy'), async (req, res) => {
    try {
      const pharmacy = await storage.getPharmacyByUserId(req.user!.id);
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }
      res.json(pharmacy);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get pending prescriptions for pharmacy
  app.get("/api/pharmacy/prescriptions/pending", requireAuth, requireRole('pharmacy'), async (req, res) => {
    try {
      const prescriptions = await storage.getPendingPrescriptionsForPharmacy();
      res.json(prescriptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dispense prescription
  app.patch("/api/pharmacy/prescriptions/:id/dispense", requireAuth, requireRole('pharmacy'), async (req, res) => {
    try {
      const { id } = req.params;
      const pharmacy = await storage.getPharmacyByUserId(req.user!.id);
      
      if (!pharmacy) {
        return res.status(404).json({ message: "Pharmacy profile not found" });
      }

      await storage.updatePrescriptionStatus(id, "dispensed", pharmacy.id);

      // Push dispensation data to ABDM
      try {
        await abhaService.pushDispensation({
          prescriptionRef: id,
          pharmacyId: pharmacy.id,
          dispensedMedicines: req.body.dispensedMedicines,
          dispensationDate: new Date().toISOString()
        });
      } catch (abhaError: any) {
        console.error('ABHA dispensation push failed:', abhaError.message);
      }

      res.json({ message: "Prescription dispensed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =============================================================================
  // AI Chatbot Routes (Placeholder)
  // =============================================================================

  // AI chatbot endpoint
  app.post("/api/chatbot/query", requireAuth, async (req, res) => {
    try {
      const { message, context } = req.body;
      const userMessage = message.toLowerCase();
      
      // Check if OpenAI API key is available
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "PUT_YOUR_REAL_OPENAI_API_KEY_HERE") {
        // TODO: Integrate with OpenAI API for intelligent responses
        const mockResponse = {
          message: `I'm an AI healthcare assistant. Based on your query "${message}", I recommend consulting with a healthcare professional for personalized advice.`,
          timestamp: new Date().toISOString(),
          context: context || 'general'
        };
        res.json(mockResponse);
        return;
      }
      
      // Enhanced mock responses based on common healthcare queries
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
        timestamp: new Date().toISOString(),
        context: context || 'general',
        suggestions: [
          "Book an appointment",
          "View prescriptions", 
          "Manage health records",
          "Find nearby pharmacies"
        ]
      };
      
      res.json(mockResponse);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get patient summary for AI (doctor only)
  app.get("/api/chatbot/patient-summary/:patientId", requireAuth, requireRole('doctor'), async (req, res) => {
    try {
      const { patientId } = req.params;
      
      const patient = await storage.getPatientById(patientId);
      const prescriptions = await storage.getPrescriptionsByPatientId(patientId);
      const healthRecords = await storage.getHealthRecordsByPatientId(patientId);
      
      // TODO: Use AI to generate intelligent summary
      const summary = {
        patient: patient,
        recentPrescriptions: prescriptions.slice(0, 5),
        healthRecords: healthRecords.slice(0, 10),
        aiInsights: "Patient shows stable health indicators. Recent prescriptions suggest ongoing management of chronic conditions."
      };
      
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
