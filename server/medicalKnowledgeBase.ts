// Comprehensive Medical Knowledge Base for AI Chatbot
// Provides context-aware responses in multiple languages

export const medicalKnowledgeBase = {
  // ENGLISH RESPONSES
  en: {
    // Symptoms
    fever: {
      title: "Fever Management",
      responses: [
        "Fever is your body's immune response. Keep hydrated, rest well, and monitor temperature. If fever persists beyond 3 days or exceeds 103°F (39.4°C), consult a doctor. Ayurvedically, drink warm turmeric milk (golden milk). Homeopathy: Belladonna 30C for high fever.",
        "For fever: 1) Stay hydrated - drink water, herbal teas, coconut water. 2) Rest and avoid strenuous activity. 3) Use cool compress on forehead. 4) Light, easy-to-digest foods. If associated with severe symptoms, seek medical help immediately.",
        "Fever management depends on cause. If due to infection, antibiotics may be needed. If due to viral, supportive care is key. Ayurvedic herbs like ashwagandha and tulsi boost immunity. Monitor vital signs regularly."
      ]
    },
    cough: {
      title: "Cough Treatment",
      responses: [
        "Cough types: Dry cough (irritating), Wet cough (productive). Dry: Use honey, warm liquids, humidifier. Wet: Clear mucus with steam inhalation. Ayurveda: Turmeric milk or ginger tea. Homeopathy: Hepar Sulph 30C for cough with mucus.",
        "Persistent cough needs investigation. Could be allergies, asthma, GERD, or infection. Home remedies: Honey (1 tsp), ginger tea, steam inhalation. If cough lasts >2 weeks or bloody sputum, consult doctor immediately.",
        "Natural remedies for cough: Tulsi leaves, black pepper, turmeric powder mixed in honey. Avoid dairy, cold water, fried foods. Get adequate sleep for immune recovery."
      ]
    },
    headache: {
      title: "Headache Relief",
      responses: [
        "Headache types: Tension (pressure), Migraine (throbbing), Cluster (severe). Tension: relax muscles, hydrate. Migraine: dark room, rest. Homeopathy: Belladonna 30C for throbbing pain. Ayurveda: Nasya (oil through nostrils) gives relief.",
        "Headache management: 1) Identify trigger (stress, dehydration, sleep). 2) Rest in dark room. 3) Massage temples with sesame oil. 4) Drink warm water with ginger. If accompanied by vision changes or severe pain, seek emergency care.",
        "Preventive measures: Regular sleep schedule, hydration, stress management, yoga, meditation. Avoid caffeine withdrawal if regular user. Massage forehead with cooling oils like brahmi or lavender."
      ]
    },
    // Diseases
    hypertension: {
      title: "Blood Pressure Management",
      responses: [
        "Hypertension (high blood pressure) management: 1) Monitor regularly (morning & evening). 2) Reduce sodium (<2.3g/day). 3) Exercise 30 min daily. 4) Manage stress through yoga/meditation. 5) Maintain healthy weight. Ayurveda: Reduce Pitta with cooling herbs.",
        "Blood pressure control requires lifestyle changes: DASH diet (fruits, vegetables, whole grains), limit alcohol, quit smoking, manage stress. Homeopathy: Crataegus 30C or Aurum Metallicum. Regular monitoring is essential.",
        "Hypertension increases heart disease risk. Target BP: <120/80 mmHg. Dietary measures: reduce refined sugar, increase potassium (bananas, spinach), use herbs like garlic and turmeric. Take medications as prescribed."
      ]
    },
    diabetes: {
      title: "Diabetes Management",
      responses: [
        "Diabetes management (Type 1 & 2): 1) Blood sugar monitoring (fasting & post-meals). 2) Low glycemic diet (whole grains, beans). 3) Regular exercise (150 min/week). 4) Medication compliance. Ayurveda: Neem, fenugreek, cinnamon help balance blood sugar.",
        "Diabetes prevention & management: Reduce refined sugars & processed foods, include fiber-rich foods, stay active, manage stress, maintain healthy weight. Homeopathy: Phosphoric Acid 30C or Uranium Nitricum help regulate glucose. Consult endocrinologist.",
        "Diabetic complications to watch: Neuropathy (nerve damage), Nephropathy (kidney damage), Retinopathy (eye damage). Regular screening: eye exams, kidney function tests, foot checks. Ayurvedic approach: balance all three doshas."
      ]
    },
    // Ayurveda
    vata_imbalance: {
      title: "Vata Imbalance (Air/Ether)",
      responses: [
        "Vata imbalance symptoms: Dry skin, constipation, anxiety, joint pain, insomnia. Balance Vata: 1) Warm foods (soups, stews). 2) Sesame oil massage. 3) Grounding exercises (yoga). 4) Regular routine. Avoid cold, dry, raw foods.",
        "Vata balancing herbs: Ashwagandha, brahmi, shatavari, oil massage (abhyanga). Foods: Warm grains (rice), healthy fats (ghee), root vegetables. Schedule: Regular sleep, meals. Balance through yoga, particularly grounding poses."
      ]
    },
    pitta_imbalance: {
      title: "Pitta Imbalance (Fire/Water)",
      responses: [
        "Pitta imbalance symptoms: Inflammation, acid reflux, anger, rashes, sensitivity to heat. Balance Pitta: 1) Cooling foods (coconut, melons). 2) Meditation & yoga. 3) Avoid alcohol & spicy foods. 4) Stay cool. Cooling herbs: Brahmi, neem, sandalwood.",
        "Pitta-balancing diet: Coconut water, melons, leafy greens, cucumber, milk. Avoid: Excess heat (peppers, chili), deep-fried, alcohol. Cooling herbs: Brahmi oil for mind, ashwagandha for body. Practice cooling pranayama (Sitali breath)."
      ]
    },
    kapha_imbalance: {
      title: "Kapha Imbalance (Water/Earth)",
      responses: [
        "Kapha imbalance symptoms: Weight gain, sluggishness, congestion, heaviness, attachment. Balance Kapha: 1) Stimulating foods (spices). 2) Regular exercise (aerobic). 3) Dry massage (garshana). 4) Wake early. Heating herbs: Ginger, turmeric, black pepper.",
        "Kapha-balancing diet: Warm spices (ginger, turmeric, black pepper), light grains (quinoa), legumes. Avoid: Heavy, oily, sweet foods. Exercise regularly. Garshana massage with warm oil. Pranayama: Bhastrika (bellows breath)."
      ]
    },
    // Homeopathy
    homeopathy_general: {
      title: "Homeopathic Treatment",
      responses: [
        "Homeopathy principle: 'Like cures like' - substances causing symptoms in healthy people cure those same symptoms in ill people. Uses highly diluted substances. Treats root cause, not just symptoms. Personalized to individual constitution.",
        "Common homeopathic remedies: Arnica (injuries), Chamomilla (anxiety), Pulsatilla (emotional sensitivity), Sulphur (skin conditions), Nux Vomica (digestive issues). Always consult qualified homeopath. Avoid mixing with allopathic medicines immediately.",
        "Homeopathy benefits: No side effects, constitutional treatment, chronic disease management, preventive care. Results take time (weeks to months). Maintain gap of 15 mins between remedy and food/drinks. Store away from strong smells."
      ]
    },
    // Nutrition & Diet
    healthy_diet: {
      title: "Nutrition for Health",
      responses: [
        "Healthy diet components: 1) Fruits & vegetables (5+ servings). 2) Whole grains (50% of grains). 3) Lean proteins (fish, beans, poultry). 4) Healthy fats (olive oil, nuts, avocado). 5) Limited salt, sugar, refined foods. Hydrate well (8+ glasses water).",
        "Balanced meal structure: 50% vegetables, 25% protein, 25% whole grains. Include all colors - red (lycopene), orange (beta-carotene), green (chlorophyll), yellow (vitamin C), purple (antioxidants). Eat mindfully, chew well, don't rush meals.",
        "Dietary diseases: High BP (reduce salt), Diabetes (reduce sugar), Obesity (reduce calories), Cholesterol (reduce saturated fats). Seasonal eating per Ayurveda optimizes nutrition. Mediterranean diet proven for heart health."
      ]
    },
    exercise: {
      title: "Physical Activity & Exercise",
      responses: [
        "Exercise guidelines: 150 min moderate aerobic/week or 75 min vigorous. Add strength training 2x/week. Include flexibility (yoga, stretching). Types: Walking, running, swimming, cycling, yoga, strength training. Start slow if inactive.",
        "Exercise benefits: Cardiovascular health, weight management, mental clarity, bone strength, better sleep, improved metabolism. For different conditions: Diabetes - aerobic + strength; Hypertension - aerobic + relaxation; Arthritis - low-impact + flexibility.",
        "Best exercises for different goals: Weight loss - HIIT, running; Strength - weightlifting, resistance; Flexibility - yoga, tai chi; Stress relief - walking, swimming; Overall health - combination of all types."
      ]
    },
    sleep_quality: {
      title: "Sleep & Rest",
      responses: [
        "Good sleep importance: Repairs body, consolidates memory, regulates hormones, boosts immunity. Sleep hygiene: 1) Consistent sleep schedule. 2) Cool, dark bedroom. 3) No screens 1 hour before. 4) Avoid caffeine after 3 PM. 5) Relaxation techniques.",
        "Sleep disorders: Insomnia (difficulty falling/staying asleep), Sleep apnea (breathing stops), Restless legs. Remedies: Warm milk with turmeric, magnesium supplements, melatonin (consult doctor). Ayurveda: Oil massage before bed, warm ghee in nostrils.",
        "Sleep stages (90 min cycles): Light (REM reduced), Deep (memory consolidation), REM (dreams). Need 7-9 hours. Poor sleep increases disease risk (obesity, diabetes, heart disease, depression). Establish bedtime routine."
      ]
    },
    stress_management: {
      title: "Stress & Mental Health",
      responses: [
        "Stress management techniques: 1) Deep breathing (4-7-8 technique). 2) Meditation (10-20 min daily). 3) Yoga (30 min). 4) Regular exercise. 5) Social connection. 6) Limit caffeine/alcohol. 7) Journaling. Effects on health: Immune suppression, high BP, GI issues, insomnia.",
        "Meditation benefits: Reduces cortisol (stress hormone), improves focus, emotional balance, lowers inflammation. Practices: Mindfulness, loving-kindness, body scan. Ayurveda: Brahmi oil massage, ashwagandha supplementation, pranayama breathing.",
        "Mental health importance: Equally vital as physical. Support: Therapy, counseling, support groups. Homeopathy: Ignatia (grief), Aconite (anxiety), Natrum Muriaticum (depression). Consult mental health professional if severe."
      ]
    },
    // Prevention & Wellness
    preventive_care: {
      title: "Preventive Healthcare",
      responses: [
        "Preventive care reduces disease risk: Regular checkups, vaccinations, screenings (blood pressure, cholesterol, cancer). Health habits: Exercise, balanced diet, no smoking, limited alcohol, stress management, good sleep. Know family health history.",
        "Age-specific screenings: 20s-30s (blood pressure, cholesterol), 40s (diabetes, cancer screening), 50s+ (mammogram, colonoscopy, bone density). Annual physical exam essential. Vaccinations: flu, COVID, tetanus, shingles (age-appropriate).",
        "Wellness practices: Regular movement, healthy eating, hydration, sleep, social connection, purposeful activities, gratitude, continuous learning. Ayurvedic approach: Seasonal cleansing, herbal supplementation, yoga, meditation. Homeopathic preventive doses."
      ]
    },
    // Immunity
    immunity: {
      title: "Immune System Boosting",
      responses: [
        "Natural immunity boosters: 1) Vitamin C (citrus, berries). 2) Vitamin D (sunlight, supplements). 3) Zinc (nuts, seeds). 4) Probiotics (yogurt, fermented foods). 5) Herbal: Tulsi, ashwagandha, ginger. 6) Sleep & exercise. 7) Stress reduction.",
        "Ayurvedic immunity: Ojas (vital energy) built through: warm foods, healthy fats (ghee), rest, positive thoughts, herbal tonics (chyawanprash). Daily: Oil massage, meditation, yoga. Seasonal cleansing (Panchakarma) removes toxins.",
        "Immune-boosting foods: Garlic (antimicrobial), turmeric (anti-inflammatory), honey (antibacterial), ginger (warming), dark leafy greens (minerals). Avoid: Excess sugar (suppresses immunity), processed foods, alcohol. Regular movement essential."
      ]
    }
  },

  // HINDI RESPONSES
  hi: {
    fever: {
      title: "बुखार का प्रबंधन",
      responses: [
        "बुखार आपके शरीर की प्रतिरक्षा प्रतिक्रिया है। हाइड्रेटेड रहें, आराम करें, तापमान की निगरानी करें। अगर 3 दिन से ज्यादा रहे तो डॉक्टर से मिलें। आयुर्वेद: गुनगुने दूध में हल्दी (गोल्डन मिल्क) लें। होम्योपैथी: Belladonna 30C उच्च बुखार के लिए।",
        "बुखार का इलाज: 1) खूब पानी पिएं। 2) विश्राम करें। 3) ठंडी पट्टी माथे पर लगाएं। 4) हल्का खाना खाएं। गंभीर लक्षण दिखें तो तुरंत चिकित्सक से मिलें।"
      ]
    },
    diabetes: {
      title: "मधुमेह का प्रबंधन",
      responses: [
        "मधुमेह प्रबंधन: 1) नियमित रक्त शर्करा जांच (खाली पेट व खाने के बाद)। 2) कम ग्लाइसेमिक आहार। 3) नियमित व्यायाम (150 मिनट/सप्ताह)। 4) दवाएं नियमित लें। आयुर्वेद: नीम, मेथी, दालचीनी रक्त शर्करा संतुलित करती हैं।",
        "मधुमेह नियंत्रण: परिष्कृत चीनी कम करें, फाइबर युक्त खाना खाएं, सक्रिय रहें, वजन संतुलित रखें। होम्योपैथी: Phosphoric Acid 30C मदद देती है। नेत्र, किडनी, पैर की नियमित जांच करवाएं।"
      ]
    },
    ayurveda: {
      title: "आयुर्वेद: प्राचीन उपचार विज्ञान",
      responses: [
        "आयुर्वेद तीन दोषों (वात, पित्त, कफ) के संतुलन पर आधारित है। प्रत्येक व्यक्ति की प्रकृति अनोखी है। असंतुलन रोग का कारण बनता है। उपचार: जड़ी-बूटियां, आहार, योग, जीवनशैली।",
        "अपने दोष पहचानें: वात (सूखापन, चिंता) - गर्म खाना; पित्त (जलन, गुस्सा) - ठंडा खाना; कफ (भारीपन, सुस्ती) - उत्तेजक खाना। योग्य वैद्य से परामर्श लें।"
      ]
    },
    healthy_diet: {
      title: "स्वस्थ आहार",
      responses: [
        "संतुलित भोजन: 1) सब्जियां व फल (5+ सर्विंग)। 2) साबुत अनाज (50%)। 3) प्रोटीन (दाल, मछली)। 4) स्वस्थ वसा (घी, नारियल का तेल)। 5) कम नमक, चीनी। खूब पानी पिएं।",
        "भोजन संरचना: 50% सब्जियां, 25% प्रोटीन, 25% अनाज। रंग-बिरंगा खाना खाएं (लाल-टमाटर, हरा-पालक, नारंगी-गाजर)। धीमे-धीमे, ध्यानपूर्वक चबाकर खाएं।"
      ]
    }
  },

  // MARATHI RESPONSES
  mr: {
    fever: {
      title: "ताप व्यवस्थापन",
      responses: [
        "ताप हा आपल्या शरीराची रक्षा प्रतिक्रिया आहे। हायड्रेटेड राहा, विश्रांती घा, तापमान पाहा। 3 दिवसांहून अधिक असल्यास डॉक्टरांची भेट घ्या। आयुर्वेद: गरम दूधात हळद (गोल्डन मिल्क)। होम्योपॅथी: Belladonna 30C उच्च तापासाठी।",
        "तापाचे उपचार: 1) खूप पाणी पिया। 2) विश्रांती घा। 3) ठंड पट्टी माथ्यावर ठेवा। 4) हल्का खाना खा। गंभीर लक्षण दिसल्यास तुरंत डॉक्टरांची भेट घ्या।"
      ]
    },
    diabetes: {
      title: "मधुमेह व्यवस्थापन",
      responses: [
        "मधुमेह नियंत्रण: 1) नियमित रक्तातील साखर तपासणी। 2) कमी ग्लाइसेमिक आहार। 3) दैनिक व्यायाम (150 मिनिटे/आठवडा)। 4) औषधे नियमित घ्या। आयुर्वेद: नीम, मेथी, दालचिनी साखर संतुलित करतात।",
        "रक्त साखर नियंत्रण: शुद्ध साखर कमी करा, फाइबर खा, सक्रिय राहा, वजन संतुलित ठेवा। होम्योपॅथी: Phosphoric Acid 30C मदत करते। नियमित डॉक्टर तपासणी जरूरी।"
      ]
    },
    ayurveda: {
      title: "आयुर्वेद: प्राचीन चिकित्सा विज्ञान",
      responses: [
        "आयुर्वेद तीन दोषांच्या (वात, पित्त, कफ) संतुलनावर आधारित आहे। प्रत्येक व्यक्तीचा स्वभाव अद्वितीय आहे। असंतुलन रोगाचे कारण बनते। उपचार: औषधी, आहार, योग, जीवनशैली।",
        "आपला दोष समजून घ्या: वात (सूकापन, चिंता) - गरम खाना; पित्त (जळजळ, राग) - ठंडा खाना; कफ (भारीपन, सुस्ती) - उत्तेजक खाना। योग्य वैद्याचा सल्ला घ्या।"
      ]
    }
  }
};

// Export function to get response based on topic and language
export function getMedicalResponse(topic: string, language: string = 'en'): string {
  const lang = (medicalKnowledgeBase as any)[language] || (medicalKnowledgeBase as any)['en'];
  const topicData = lang[topic.toLowerCase()];
  
  if (!topicData) {
    return "I can help with that medical topic. Please ask me more specifically about your health concern.";
  }

  const responses = topicData.responses || [];
  if (responses.length === 0) return topicData.title;
  
  // Return random response for variety
  return responses[Math.floor(Math.random() * responses.length)];
}

// Export all topics for autocomplete
export function getAvailableTopics(language: string = 'en'): string[] {
  const lang = (medicalKnowledgeBase as any)[language] || (medicalKnowledgeBase as any)['en'];
  return Object.keys(lang);
}
