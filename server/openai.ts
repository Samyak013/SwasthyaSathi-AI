import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "../shared/languageConfig";

// Load AI client - prefer Gemini if key is present, fall back to OpenAI
let aiClient: any;
let useGemini = false;

if (process.env.GEMINI_API_KEY) {
  console.log("✅ Using Google Gemini API (Free tier - 60 requests/min)");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  aiClient = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  useGemini = true;
} else if (process.env.OPENAI_API_KEY) {
  console.log("✅ Using OpenAI API");
  aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  useGemini = false;
} else {
  console.warn("⚠️ Neither GEMINI_API_KEY nor OPENAI_API_KEY set — AI calls will return safe defaults.");
  aiClient = null;
}

interface PatientProfile {
  demographicSummary: {
    age: number;
    gender: string;
    occupation: string;
    lifestyle: string[];
    riskFactors: string[];
  };
  medicalSummary: {
    chronicConditions: string[];
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      compliance: string;
    }>;
    allergies: string[];
    previousProcedures: string[];
  };
  vitalTrends: {
    bloodPressure: string[];
    heartRate: string[];
    weight: string[];
    glucoseLevels?: string[];
  };
  careRecommendations: {
    preventiveCare: string[];
    lifestyleChanges: string[];
    monitoringNeeds: string[];
    specialistReferrals: string[];
  };
  emergencyInfo: {
    bloodType: string;
    emergencyContacts: string[];
    criticalAllergies: string[];
    chronicConditionsAlert: string[];
  };
}

interface DrugInteractionCheck {
  safe: boolean;
  warnings: string[];
  dosageAdjustments: string[];
  timingRecommendations: string[];
  alternatives: string[];
  precautions: string[];
}

interface DiagnosisSuggestion {
  condition: string;
  confidence: number;
  recommendedTests: string[];
  suggestedTreatment: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      specialInstructions: string[];
    }>;
    lifestyle: string[];
    followUp: string;
    precautions: string[];
  };
  contraindications: string[];
}

interface HealthRecordSummary {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: 'active' | 'completed' | 'discontinued';
    notes: string[];
  }>;
  adherenceReport: {
    adherenceScore: number;
    missedDoses: number;
    improvements: string[];
  };
}

export async function checkDrugInteractions(medications: { name: string; dosage: string }[]): Promise<DrugInteractionCheck> {
  try {
    const medicationList = medications.map(m => `${m.name} (${m.dosage})`).join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a specialized pharmaceutical AI assistant focused on medication safety and drug interactions. Your role is to:
1. Analyze drug combinations for potential interactions
2. Specify exact dosing conflicts or timing issues
3. Provide clear warnings about specific risks
4. Suggest safer alternatives when needed
5. Note any special precautions (with food, time of day, etc.)
Respond with detailed, prescription-focused JSON in this format: {
  'safe': boolean,
  'warnings': string[],
  'dosageAdjustments': string[],
  'timingRecommendations': string[],
  'alternatives': string[],
  'precautions': string[]
}`,
        },
        {
          role: "user",
          content: `Analyze potential interactions and provide detailed prescription guidance for: ${medicationList}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      safe: result.safe ?? true,
      warnings: result.warnings ?? [],
      dosageAdjustments: result.dosageAdjustments ?? [],
      timingRecommendations: result.timingRecommendations ?? [],
      alternatives: result.alternatives ?? [],
      precautions: result.precautions ?? []
    };
  } catch (error) {
    console.error("Drug interaction check failed:", error);
    return {
      safe: true,
      warnings: [],
      dosageAdjustments: [],
      timingRecommendations: [],
      alternatives: [],
      precautions: []
    };
  }
}

export async function suggestDiagnosis(symptoms: string[], medicalHistory: string[]): Promise<DiagnosisSuggestion[]> {
  try {
    const symptomList = symptoms.join(", ");
    const historyList = medicalHistory.join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a specialized medical AI assistant focused on comprehensive diagnosis and prescription recommendations. For each possible condition:
1. Evaluate symptoms against known conditions
2. Consider medical history for contraindications
3. Provide detailed prescription plans including:
   - Specific medications with exact dosing
   - Duration and frequency of treatment
   - Special instructions (e.g., "take with food")
4. Include lifestyle modifications
5. Specify follow-up timeline
6. List potential contraindications

Respond with prescription-focused JSON in this format: {
  'diagnoses': [{
    'condition': string,
    'confidence': number (0-1),
    'recommendedTests': string[],
    'suggestedTreatment': {
      'medications': [{
        'name': string,
        'dosage': string,
        'frequency': string,
        'duration': string,
        'specialInstructions': string[]
      }],
      'lifestyle': string[],
      'followUp': string,
      'precautions': string[]
    },
    'contraindications': string[]
  }]
}`,
        },
        {
          role: "user",
          content: `Analyze symptoms and provide detailed prescription recommendations for:\nSymptoms: ${symptomList}\nMedical History: ${historyList}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return (result.diagnoses ?? []).map((diagnosis: any) => ({
      condition: diagnosis.condition ?? "Unknown condition",
      confidence: diagnosis.confidence ?? 0,
      recommendedTests: diagnosis.recommendedTests ?? [],
      suggestedTreatment: {
        medications: (diagnosis.suggestedTreatment?.medications ?? []).map((med: any) => ({
          name: med.name ?? "",
          dosage: med.dosage ?? "",
          frequency: med.frequency ?? "",
          duration: med.duration ?? "",
          specialInstructions: med.specialInstructions ?? []
        })),
        lifestyle: diagnosis.suggestedTreatment?.lifestyle ?? [],
        followUp: diagnosis.suggestedTreatment?.followUp ?? "Schedule follow-up as needed",
        precautions: diagnosis.suggestedTreatment?.precautions ?? []
      },
      contraindications: diagnosis.contraindications ?? []
    }));
  } catch (error) {
    console.error("Diagnosis suggestion failed:", error);
    return [];
  }
}

export async function generateHealthRecordSummary(recordData: any): Promise<HealthRecordSummary> {
  try {
    const dataStr = JSON.stringify(recordData);
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a specialized medical AI assistant focused on comprehensive health record analysis and medication management. Your role is to:
1. Provide clear summary of the patient's health status
2. Track all medications (current and historical)
3. Monitor medication adherence
4. Identify potential medication issues
5. Suggest improvements to medication regimen

Respond with detailed JSON in this format: {
  'summary': string,
  'keyPoints': string[],
  'recommendations': string[],
  'medications': [{
    'name': string,
    'dosage': string,
    'frequency': string,
    'startDate': string,
    'endDate': string,
    'purpose': string,
    'status': 'active' | 'completed' | 'discontinued',
    'notes': string[]
  }],
  'adherenceReport': {
    'adherenceScore': number (0-100),
    'missedDoses': number,
    'improvements': string[]
  }
}`,
        },
        {
          role: "user",
          content: `Summarize this health record: ${dataStr}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      summary: result.summary ?? "No summary available",
      keyPoints: result.keyPoints ?? [],
      recommendations: result.recommendations ?? [],
      medications: (result.medications ?? []).map((med: any) => ({
        name: med.name ?? "",
        dosage: med.dosage ?? "",
        frequency: med.frequency ?? "",
        startDate: med.startDate ?? "",
        endDate: med.endDate ?? "",
        purpose: med.purpose ?? "",
        status: med.status ?? "completed",
        notes: med.notes ?? []
      })),
      adherenceReport: {
        adherenceScore: result.adherenceReport?.adherenceScore ?? 0,
        missedDoses: result.adherenceReport?.missedDoses ?? 0,
        improvements: result.adherenceReport?.improvements ?? []
      }
    };
  } catch (error) {
    console.error("Health record summary failed:", error);
    return {
      summary: "Summary generation failed",
      keyPoints: [],
      recommendations: [],
      medications: [],
      adherenceReport: {
        adherenceScore: 0,
        missedDoses: 0,
        improvements: []
      }
    };
  }
}

export async function analyzePatientProfile(profileData: any): Promise<PatientProfile> {
  try {
    const dataStr = JSON.stringify(profileData);
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a specialized medical AI assistant focused on comprehensive patient profile analysis. Your role is to:
1. Analyze patient demographics and lifestyle
2. Track chronic conditions and medications
3. Monitor vital signs and trends
4. Provide personalized care recommendations
5. Maintain critical emergency information

Respond with detailed JSON matching this structure:
{
  'demographicSummary': {
    'age': number,
    'gender': string,
    'occupation': string,
    'lifestyle': string[],
    'riskFactors': string[]
  },
  'medicalSummary': {
    'chronicConditions': string[],
    'currentMedications': [{
      'name': string,
      'dosage': string,
      'frequency': string,
      'startDate': string,
      'compliance': string
    }],
    'allergies': string[],
    'previousProcedures': string[]
  },
  'vitalTrends': {
    'bloodPressure': string[],
    'heartRate': string[],
    'weight': string[],
    'glucoseLevels': string[]
  },
  'careRecommendations': {
    'preventiveCare': string[],
    'lifestyleChanges': string[],
    'monitoringNeeds': string[],
    'specialistReferrals': string[]
  },
  'emergencyInfo': {
    'bloodType': string,
    'emergencyContacts': string[],
    'criticalAllergies': string[],
    'chronicConditionsAlert': string[]
  }
}`
        },
        {
          role: "user",
          content: `Analyze this patient profile and provide comprehensive recommendations: ${dataStr}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      demographicSummary: {
        age: result.demographicSummary?.age ?? 0,
        gender: result.demographicSummary?.gender ?? "",
        occupation: result.demographicSummary?.occupation ?? "",
        lifestyle: result.demographicSummary?.lifestyle ?? [],
        riskFactors: result.demographicSummary?.riskFactors ?? []
      },
      medicalSummary: {
        chronicConditions: result.medicalSummary?.chronicConditions ?? [],
        currentMedications: (result.medicalSummary?.currentMedications ?? []).map((med: any) => ({
          name: med.name ?? "",
          dosage: med.dosage ?? "",
          frequency: med.frequency ?? "",
          startDate: med.startDate ?? "",
          compliance: med.compliance ?? "unknown"
        })),
        allergies: result.medicalSummary?.allergies ?? [],
        previousProcedures: result.medicalSummary?.previousProcedures ?? []
      },
      vitalTrends: {
        bloodPressure: result.vitalTrends?.bloodPressure ?? [],
        heartRate: result.vitalTrends?.heartRate ?? [],
        weight: result.vitalTrends?.weight ?? [],
        glucoseLevels: result.vitalTrends?.glucoseLevels ?? []
      },
      careRecommendations: {
        preventiveCare: result.careRecommendations?.preventiveCare ?? [],
        lifestyleChanges: result.careRecommendations?.lifestyleChanges ?? [],
        monitoringNeeds: result.careRecommendations?.monitoringNeeds ?? [],
        specialistReferrals: result.careRecommendations?.specialistReferrals ?? []
      },
      emergencyInfo: {
        bloodType: result.emergencyInfo?.bloodType ?? "unknown",
        emergencyContacts: result.emergencyInfo?.emergencyContacts ?? [],
        criticalAllergies: result.emergencyInfo?.criticalAllergies ?? [],
        chronicConditionsAlert: result.emergencyInfo?.chronicConditionsAlert ?? []
      }
    };
  } catch (error) {
    console.error("Patient profile analysis failed:", error);
    return {
      demographicSummary: {
        age: 0,
        gender: "",
        occupation: "",
        lifestyle: [],
        riskFactors: []
      },
      medicalSummary: {
        chronicConditions: [],
        currentMedications: [],
        allergies: [],
        previousProcedures: []
      },
      vitalTrends: {
        bloodPressure: [],
        heartRate: [],
        weight: [],
        glucoseLevels: []
      },
      careRecommendations: {
        preventiveCare: [],
        lifestyleChanges: [],
        monitoringNeeds: [],
        specialistReferrals: []
      },
      emergencyInfo: {
        bloodType: "unknown",
        emergencyContacts: [],
        criticalAllergies: [],
        chronicConditionsAlert: []
      }
    };
  }
}

export async function chatWithHealthAssistant(
  userMessage: string,
  language: string,
  chatHistory: { role: string; message: string }[],
  patientContext?: {
    name?: string;
    age?: number;
    gender?: string;
    medicalConditions?: string[];
    currentMedications?: string[];
    allergies?: string[];
  }
): Promise<string> {
  try {
    if (!aiClient) {
      return "I'm sorry, I'm having trouble responding right now. Please try again.";
    }

    const languages = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
    };

    // Get language-specific system prompt from shared config, with fallback
    let systemPrompt = (SYSTEM_PROMPTS as any)[language] || (SYSTEM_PROMPTS as any)["en"];
    
    if (patientContext) {
      systemPrompt += `\n\nPatient Context:
- Name: ${patientContext.name || "Unknown"}
- Age: ${patientContext.age || "Unknown"}
- Gender: ${patientContext.gender || "Unknown"}
- Medical Conditions: ${patientContext.medicalConditions?.join(", ") || "None"}
- Current Medications: ${patientContext.currentMedications?.join(", ") || "None"}
- Allergies: ${patientContext.allergies?.join(", ") || "None"}

Use this context to provide personalized, medically accurate advice specific to this patient's health profile. Continue responding in ${languages[language as keyof typeof languages] || "English"}.`;
    }

    if (useGemini) {
      // Use Google Gemini API
      let conversationHistory = systemPrompt + "\n\n";
      
      // Add chat history
      chatHistory.forEach((msg) => {
        conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.message}\n`;
      });
      
      conversationHistory += `User: ${userMessage}\nAssistant:`;

      const result = await aiClient.generateContent(conversationHistory);
      const response = await result.response;
      return response.text() || "I apologize, I couldn't generate a response.";
    } else {
      // Use OpenAI API (backward compatibility)
      const messages: any[] = [
        {
          role: "system",
          content: systemPrompt,
        },
      ];

      chatHistory.forEach((msg) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.message,
        });
      });

      messages.push({
        role: "user",
        content: userMessage,
      });

      const response = await (aiClient as any).chat.completions.create({
        model: "gpt-5",
        messages,
        max_completion_tokens: 8192,
      });

      return response.choices[0].message.content || "I apologize, I couldn't generate a response.";
    }
  } catch (error) {
    console.error("Health assistant chat failed:", error);
    return "I'm sorry, I'm having trouble responding right now. Please try again.";
  }
}

export async function generatePersonalizedHealthInsights(
  patientData: {
    name: string;
    age: number;
    gender: string;
    medicalConditions: string[];
    allergies: string[];
    currentMedications?: { name: string; dosage: string; frequency: string }[];
  },
  recentHealthRecords?: {
    type: string;
    title: string;
    description: string;
    date: string;
  }[]
): Promise<{
  insights: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    icon: string;
  }>;
}> {
  try {
    const dataStr = JSON.stringify({
      patient: patientData,
      recentRecords: recentHealthRecords || [],
    });

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert medical AI that generates personalized health insights for patients. Analyze the patient data and recent health records to create 3-4 actionable, personalized insights.

Respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "insights": [
    {
      "title": "string (short title, max 30 chars)",
      "description": "string (detailed insight, 1-2 sentences)",
      "priority": "high|medium|low",
      "icon": "string (emoji or icon name like heart, activity, alertcircle, checkmark)"
    }
  ]
}

Guidelines:
- Base insights on the patient's specific conditions, age, and medical history
- Prioritize based on urgency and impact on health
- Make recommendations actionable and specific
- Consider drug interactions and allergies
- Include preventive care recommendations`,
        },
        {
          role: "user",
          content: `Generate personalized health insights for this patient:\n${dataStr}`,
        },
      ],
      max_completion_tokens: 2048,
    });

    const content = response.choices[0].message.content || "{}";
    
    // Parse the response, handling both raw JSON and markdown-wrapped JSON
    let jsonStr = content;
    if (content.includes("```json")) {
      jsonStr = content.split("```json")[1].split("```")[0];
    } else if (content.includes("```")) {
      jsonStr = content.split("```")[1].split("```")[0];
    }
    
    const result = JSON.parse(jsonStr.trim());
    
    // Validate and normalize the response
    const insights = (result.insights || []).map((insight: any) => ({
      title: insight.title || "Health Insight",
      description: insight.description || "",
      priority: (["high", "medium", "low"].includes(insight.priority) ? insight.priority : "medium") as "high" | "medium" | "low",
      icon: insight.icon || "Activity",
    }));

    return { insights };
  } catch (error) {
    console.error("Health insights generation failed:", error);
    
    // Return default insights based on user data
    const defaultInsights = [];
    
    if (patientData.age > 50) {
      defaultInsights.push({
        title: "Regular Health Screening",
        description: "At your age, annual health screenings and preventive checkups are essential. Consider scheduling your yearly physical with your doctor.",
        priority: "high" as const,
        icon: "Heart",
      });
    }
    
    if (patientData.medicalConditions.length > 0) {
      defaultInsights.push({
        title: "Condition Management",
        description: `Monitor your ${patientData.medicalConditions.join(", ")} regularly. Keep your medications consistent and report any symptoms to your doctor.`,
        priority: "high" as const,
        icon: "AlertCircle",
      });
    }
    
    if (!patientData.medicalConditions.includes("diabetes")) {
      defaultInsights.push({
        title: "Healthy Lifestyle",
        description: "Maintain a balanced diet, exercise 30 minutes daily, and manage stress. These lifestyle changes significantly improve overall health.",
        priority: "medium" as const,
        icon: "Activity",
      });
    }

    defaultInsights.push({
      title: "Regular Medication Review",
      description: "Schedule regular reviews with your pharmacist to ensure your medications are still appropriate and not causing interactions.",
      priority: "medium" as const,
      icon: "CheckCircle",
    });

    return { insights: defaultInsights.slice(0, 4) };
  }
}

export async function translateMessage(message: string, targetLanguage: string): Promise<string> {
  try {
    if (!aiClient) {
      return message;
    }

    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
    };

    const translationPrompt = `You are a professional translator. Translate the following text to ${languageNames[targetLanguage] || "English"}. Preserve medical terminology accuracy.\n\nText: ${message}`;

    if (useGemini) {
      const result = await aiClient.generateContent(translationPrompt);
      const response = await result.response;
      return response.text() || message;
    } else {
      const response = await (aiClient as any).chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the following text to ${languageNames[targetLanguage] || "English"}. Preserve medical terminology accuracy.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      return response.choices[0].message.content || message;
    }
  } catch (error) {
    console.error("Translation failed:", error);
    return message;
  }
}

export async function generatePrescriptionQRData(prescriptionId: string, doctorId: string, patientId: string): Promise<string> {
  return `PRESCRIPTION:${prescriptionId}:DOCTOR:${doctorId}:PATIENT:${patientId}:TIMESTAMP:${Date.now()}`;
}

export async function verifyPrescriptionQR(qrData: string): Promise<{ valid: boolean; prescriptionId?: string; error?: string }> {
  try {
    const parts = qrData.split(":");
    if (parts[0] !== "PRESCRIPTION" || parts.length < 8) {
      return { valid: false, error: "Invalid QR code format" };
    }
    return { valid: true, prescriptionId: parts[1] };
  } catch (error) {
    return { valid: false, error: "QR code verification failed" };
  }
}

export async function generateAnalyticsInsights(data: any): Promise<{
  insights: string[];
  trends: string[];
  recommendations: string[];
}> {
  try {
    const dataStr = JSON.stringify(data);
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a healthcare analytics AI. Analyze health data and provide insights, trends, and recommendations. Respond with JSON in this format: { 'insights': string[], 'trends': string[], 'recommendations': string[] }",
        },
        {
          role: "user",
          content: `Analyze this healthcare data: ${dataStr}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      insights: result.insights ?? [],
      trends: result.trends ?? [],
      recommendations: result.recommendations ?? [],
    };
  } catch (error) {
    console.error("Analytics insights failed:", error);
    return {
      insights: [],
      trends: [],
      recommendations: [],
    };
  }
}
