// Multi-language support for AI Health Assistant
import { SYSTEM_PROMPTS } from "../../../shared/languageConfig";

export { SYSTEM_PROMPTS };

export const SUPPORTED_LANGUAGES = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
  },
  hi: {
    name: "Hindi",
    nativeName: "हिंदी",
    flag: "🇮🇳",
  },
  mr: {
    name: "Marathi",
    nativeName: "मराठी",
    flag: "🇮🇳",
  },
};

export const LANGUAGE_PROMPTS = {
  en: {
    greeting: "Hello! I'm your AI health assistant. How can I help you today?",
    placeholder: "Ask about your health...",
    error: "I'm sorry, I'm having trouble responding right now. Please try again.",
    notFound: "I apologize, I couldn't generate a response.",
    typing: "Typing",
    languageSwitch: "Switch language to respond in",
  },
  hi: {
    greeting: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "अपने स्वास्थ्य के बारे में पूछें...",
    error: "मुझे खेद है, मुझे अभी जवाब देने में परेशानी हो रही है। कृपया फिर से कोशिश करें।",
    notFound: "मुझे खेद है, मुझे कोई जवाब नहीं दे पाया।",
    typing: "लिख रहे हैं",
    languageSwitch: "जवाब देने के लिए भाषा बदलें",
  },
  mr: {
    greeting: "नमस्कार! मैं आपका एआই आरोग्य सहायक आहे. मैं आपला कशी मदत करू शकतो?",
    placeholder: "आपल्या आरोग्याबद्दल विचारा...",
    error: "मला वाईच लागले, मला सध्या प्रतिक्रिया देण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा.",
    notFound: "मला खेद आहे, मैं प्रतिक्रिया तयार करू शकलो नाही.",
    typing: "लिहित आहे",
    languageSwitch: "प्रतिक्रिया देण्यासाठी भाषा बदला",
  },
};

export const HEALTH_TOPICS = {
  en: [
    "Symptoms & Diagnosis",
    "Medications & Dosage",
    "Diet & Nutrition",
    "Exercise & Fitness",
    "Mental Health",
    "Preventive Care",
    "Chronic Conditions",
    "Emergency Care",
  ],
  hi: [
    "लक्षण और निदान",
    "दवाएं और खुराक",
    "आहार और पोषण",
    "व्यायाम और फिटनेस",
    "मानसिक स्वास्थ्य",
    "रोकथामक देखभाल",
    "पुरानी स्थितियां",
    "आपातकालीन देखभाल",
  ],
  mr: [
    "लक्षण आणि निदान",
    "औषधे आणि डोस",
    "आहार आणि पोषण",
    "व्यायाम आणि फिटनेस",
    "मानसिक आरोग्य",
    "प्रतिरोधक देखभाल",
    "दीर्घकालीन स्थिती",
    "आपातकालीन देखभाल",
  ],
};
