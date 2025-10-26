import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DrugInteractionCheck {
  safe: boolean;
  warnings: string[];
}

interface DiagnosisSuggestion {
  condition: string;
  confidence: number;
  recommendedTests: string[];
  suggestedTreatment: string;
}

interface HealthRecordSummary {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
}

export async function checkDrugInteractions(medications: { name: string; dosage: string }[]): Promise<DrugInteractionCheck> {
  try {
    const medicationList = medications.map(m => `${m.name} (${m.dosage})`).join(", ");
    
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specialized in drug interactions. Analyze the medications and provide safety information. Respond with JSON in this format: { 'safe': boolean, 'warnings': string[] }",
        },
        {
          role: "user",
          content: `Check for drug interactions between these medications: ${medicationList}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      safe: result.safe ?? true,
      warnings: result.warnings ?? [],
    };
  } catch (error) {
    console.error("Drug interaction check failed:", error);
    return { safe: true, warnings: [] };
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
          content: "You are a medical AI assistant. Based on symptoms and medical history, suggest possible diagnoses with confidence levels. Respond with JSON in this format: { 'diagnoses': [{ 'condition': string, 'confidence': number (0-1), 'recommendedTests': string[], 'suggestedTreatment': string }] }",
        },
        {
          role: "user",
          content: `Symptoms: ${symptomList}\nMedical History: ${historyList}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.diagnoses ?? [];
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
          content: "You are a medical AI assistant. Summarize health records in a clear, patient-friendly manner. Respond with JSON in this format: { 'summary': string, 'keyPoints': string[], 'recommendations': string[] }",
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
    };
  } catch (error) {
    console.error("Health record summary failed:", error);
    return {
      summary: "Summary generation failed",
      keyPoints: [],
      recommendations: [],
    };
  }
}

export async function chatWithHealthAssistant(
  userMessage: string,
  language: string,
  chatHistory: { role: string; message: string }[]
): Promise<string> {
  try {
    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
    };

    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful multilingual health assistant. Respond in ${languageNames[language] || "English"}. Provide accurate health information, but always remind users to consult healthcare professionals for medical advice.`,
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

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages,
      max_completion_tokens: 8192,
    });

    return response.choices[0].message.content || "I apologize, I couldn't generate a response.";
  } catch (error) {
    console.error("Health assistant chat failed:", error);
    return "I'm sorry, I'm having trouble responding right now. Please try again.";
  }
}

export async function translateMessage(message: string, targetLanguage: string): Promise<string> {
  try {
    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
    };

    const response = await openai.chat.completions.create({
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
