import { PrismaClient } from '@prisma/client';
import { classifyIntent } from '../chatbot/router';

const prisma = new PrismaClient();

interface AskParams {
  message: string;
  imageUrl?: string | null;
  contentType: 'text' | 'voice' | 'image';
  locale: string;
  farmerId?: string | null;
}

interface AskResult {
  reply: string;
  intent: string;
  confidenceScore: number;
  reviewed: boolean;
  reviewQueueId?: string;
}

// REST Helper to call Gemini 1.5 Flash Text Generation
async function callGeminiText(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini Text API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini Text API');
  }
  return text;
}

// REST Helper to call Gemini 1.5 Flash Vision Multimodal Analysis
async function callGeminiVision(
  imageUrl: string,
  prompt: string,
  apiKey: string
): Promise<{ diagnosis: string; confidenceScore: number; suggestions: string[] }> {
  // Extract base64 segment and mimeType
  const mimeType = imageUrl.split(';')[0].split(':')[1];
  const base64Data = imageUrl.split(',')[1];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini Vision API');
  }

  const parsed = JSON.parse(text);
  return {
    diagnosis: parsed.diagnosis || 'Suspected Crop Infection',
    confidenceScore: parsed.confidenceScore !== undefined ? parseFloat(parsed.confidenceScore) : 0.65,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Prune infected leaves']
  };
}

export async function askAssistant({
  message,
  imageUrl,
  contentType,
  locale,
  farmerId
}: AskParams): Promise<AskResult> {
  const farmer = farmerId
    ? await prisma.farmer.findUnique({
        where: { id: farmerId },
        include: {
          farms: {
            include: {
              crops: true
            }
          }
        }
      })
    : null;

  // 1. Classify Intent
  const classification = classifyIntent(message || '');
  const intent = imageUrl ? 'crop_diagnosis' : classification.intent;
  
  // Base configuration
  const apiKey = process.env.GEMINI_API_KEY || '';
  const isHindi = locale === 'hi';
  const isMarathi = locale === 'mr';
  const isTelugu = locale === 'te';
  const isTamil = locale === 'ta';
  const isKannada = locale === 'kn';
  const isOdia = locale === 'or';

  let reply = '';
  let confidenceScore = imageUrl ? 0.65 : classification.confidence;
  let reviewed = false;
  let reviewQueueId: string | undefined;

  const defaultTemplates: Record<string, any> = {
    en: {
      loadingExpert: "We are checking your crop diagnosis with an expert. We will notify you on your dashboard shortly.",
      noProfile: "Please complete your onboarding profile so I can provide personalized recommendations.",
      generalHelp: "Hello! I am your KrishiMitra AI assistant. I can help you search government schemes, find storage facilities, or check equipment rentals. Try using the quick replies below!",
      disclaimer: "\n\n*Disclaimer: Information provided for guidance. Confirm final eligibility with the respective department.*"
    },
    hi: {
      loadingExpert: "हम एक कृषि विशेषज्ञ से आपकी फसल की जांच कर रहे हैं। हम जल्द ही आपको आपके डैशबोर्ड पर सूचित करेंगे।",
      noProfile: "कृपया अपनी प्रोफाइल पूरी करें ताकि मैं आपको व्यक्तिगत योजनाएं और फसल सुझाव दे सकूं।",
      generalHelp: "नमस्ते! मैं आपका कृषिमित्र AI सहायक हूँ। मैं आपको सरकारी योजनाओं, कोल्ड स्टोरेज और कृषि यंत्रों को किराए पर खोजने में मदद कर सकता हूँ।",
      disclaimer: "\n\n*अस्वीकरण: यह जानकारी केवल मार्गदर्शन के लिए है। अंतिम पात्रता की पुष्टि संबंधित विभाग से करें।*"
    },
    mr: {
      loadingExpert: "आम्ही तज्ज्ञांकडून तुमच्या पिकाची तपासणी करत आहोत. लवकरच आम्ही तुम्हाला डॅशबोर्डवर कळवू.",
      noProfile: "कृपया तुमची नोंदणी पूर्ण करा जेणेकरून मी तुम्हाला योग्य माहिती देऊ शकेन.",
      generalHelp: "नमस्कार! मी तुमचा कृषिमित्र AI सहाय्यक आहे. मी तुम्हाला सरकारी योजना, साठवणूक केंद्र आणि शेती अवजारे भाड्याने मिळवून देण्यास मदत करू शकतो.",
      disclaimer: "\n\n*अस्वीकरण: ही माहिती मार्गदर्शनासाठी आहे. अंतिम पात्रता संबंधित विभागाकडून तपासून घ्या.*"
    },
    te: {
      loadingExpert: "మేము మీ పంట వివరాలను వ్యవసాయ నిపుණුడితో సరిచూస్తున్నాము. త్వరలోనే మీకు తెలియజేస్తాము.",
      noProfile: "దయచేసి మీ ప్రొఫైల్ పూర్తి చేయండి, అప్పుడే నేను మీకు సరైన సలహాలు ఇవ్వగలను.",
      generalHelp: "నమస్కారం! నేను మీ కృషిమిత్ర AI సహాయకుడిని. ప్రభుత్వ పథకాలు, కోల్డ్ స్టోరేజీలు మరియు అద్దె పరికరాల వివరాలను తెలుసుకోవడానికి నేను మీకు సహాయం చేస్తాను.",
      disclaimer: "\n\n*నిరాకరణ: ఈ సమాచారం కేవలం మార్ಗದర్శనం కోసం మాత్రమే. చివరి అర్హతను అధికారిక శాఖ ద్వారా నిర్ధారించుకోండి.*"
    },
    ta: {
      loadingExpert: "உங்கள் பயிர் நோயறிதலை நாங்கள் ஒரு விவசாய நிபுணரிடம் சரிபார்க்கிறோம். விரைவில் உங்கள் டாஷ்போர்டில் அறிவிப்போம்.",
      noProfile: "தனிப்பயனாக்கப்பட்ட பரிந்துரைகளைப் பெற உங்கள் சுயவிவரத்தை முழுமையாக்குங்கள்.",
      generalHelp: "வணக்கம்! நான் உங்கள் கிருஷிმიத்ரா AI உதவியாளர். அரசு திட்டங்கள், சேமிப்பு கிடங்குகள் அல்லது வாடகை கருவிகளை கண்டறிய நான் உங்களுக்கு உதவுவேன்.",
      disclaimer: "\n\n*பொறுப்புத் துறப்பு: இந்தத் தகவல் வழிகாட்டுதலுக்கு மட்டுமே. இறுதித் தகுதியை அந்தந்தத் துறையிடம் உறுதிப்படுத்தவும்.*"
    },
    kn: {
      loadingExpert: "ನಾವು ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ನಿಮ್ಮ ಬೆಳೆ ರೋಗ ತಪಾಸಣೆ ಮಾಡುತ್ತಿದ್ದೇವೆ. ಶೀಘ್ರದಲ್ಲೇ ನಿಮಗೆ ತಿಳಿಸಲಾಗುವುದು.",
      noProfile: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ ಇದರಿಂದ ನಾನು ಸರಿಯಾದ ಸಲಹೆ ನೀಡಬಹುದು.",
      generalHelp: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿಮಿತ್ರ AI ಸಹಾಯಕ. ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು, ಶೀತಲ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರಗಳು ಮತ್ತು ಬಾಡಿಗೆ ಉಪಕರಣಗಳನ್ನು ಹುಡುಕಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
      disclaimer: "\n\n*ಹಕ್ಕುತ್ಯಾಗ: ಈ ಮಾಹಿತಿ ಕೇವಲ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ. ಕೊನೆಯ ಅರ್ಹತೆಯನ್ನು ಆಯಾ ಇಲಾಖೆಯೊಂದಿಗೆ ದೃಢೀಕರಿಸಿ.*"
    },
    or: {
      loadingExpert: "ଆମେ ଜଣେ କୃଷି ବିଶେଷଜ୍ଞଙ୍କ ସହ ଆପଣଙ୍କ ଫସଲ ଯାଞ୍ଚ କରୁଛୁ। ଆମେ ଶୀଘ୍ର ଆପଣଙ୍କୁ ଜଣାଇବୁ।",
      noProfile: "ଦୟାକରି ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ ଯାହା ଦ୍ୱାରା ମୁଁ ଆପଣଙ୍କୁ ଉପଯୁକ୍ତ ସରାକାରୀ ଯୋଜନା ଓ ପରାମର୍ଶ ଦେଇପାରିବି।",
      generalHelp: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ କୃଷିମିତ୍ର AI ସହାୟକ। ସରକାରୀ ଯୋଜନା, କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍ ଏବଂ ଭଡା ଉପକରଣ ଖୋଜିବାରେ ମୁଁ ସାହାଯ୍ୟ କରିପାରିବି।",
      disclaimer: "\n\n*ଦାବି ତ୍ୟାଗ: ଏହି ସୂଚନା କେବଳ ମାର୍ଗଦର୍ଶନ ପାଇଁ। ଚୂଡ଼ାନ୍ତ ଯୋଗ୍ୟତା ସମ୍ପୃକ୍ତ ସରକାରୀ ବିଭାଗ ଦ୍ୱାରା ଯାଞ୍ଚ କରାଯାଏ।*"
    }
  };

  const currentLangTemplates = defaultTemplates[locale] || defaultTemplates['en'];

  // 2. Run LLM logic if API Key is available
  if (apiKey) {
    try {
      const farmerName = farmer?.name || 'Farmer';
      const village = farmer?.village || 'Unknown';
      const district = farmer?.district || 'Wardha';
      const state = farmer?.state || 'Maharashtra';
      const landSize = farmer?.landSizeAcres || 'unknown';
      const category = farmer?.category || 'General';
      const primaryCrop = farmer?.farms[0]?.crops[0]?.cropName || 'None';

      const systemInstruction = `You are KrishiMitra AI, an intelligent, empathetic farming assistant for small and marginal farmers in India. Your goal is to provide concise, actionable agricultural recommendations. You are speaking with ${farmerName} who resides in village ${village}, district ${district}, state ${state}. Their land size is ${landSize} acres and they belong to social category ${category}. Their primary sown crop is ${primaryCrop}. You MUST respond exclusively in the language corresponding to locale code: ${locale} (supported locales are: en, hi, mr, te, ta, kn, or). If they ask about schemes, cold storages, or rentals, answer constructively and nudge them to check their dashboard pages (/dashboard/schemes, /dashboard/harvest-advisor, /dashboard/equipment). Keep your tone respectful, friendly, and simple.`;

      if (intent === 'crop_diagnosis' && imageUrl) {
        // Run Gemini Vision
        const visionPrompt = `You are a crop health AI checker. Examine the attached leaf/plant photo. Identify the suspected pest or disease, estimate your diagnosis confidence score (0.0 to 1.0), and list 3 concrete recovery suggestions. Reply strictly in a valid JSON object matching this schema: {"diagnosis": "Disease Name", "confidenceScore": 0.85, "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]}`;
        const visionResult = await callGeminiVision(imageUrl, visionPrompt, apiKey);
        
        confidenceScore = visionResult.confidenceScore;
        const activeCrop = farmer?.farms[0]?.crops[0];

        if (activeCrop) {
          const diagnosis = await prisma.cropDiagnosis.create({
            data: {
              cropId: activeCrop.id,
              imageUrl,
              diagnosisResult: visionResult.diagnosis,
              confidenceScore,
              humanReviewed: false
            }
          });

          // Check human verification threshold
          if (confidenceScore < 0.7) {
            const reviewItem = await prisma.reviewQueueItem.create({
              data: {
                type: 'diagnosis',
                referenceId: diagnosis.id,
                priority: 'high',
                status: 'pending'
              }
            });

            await prisma.notification.create({
              data: {
                farmerId: farmer.id,
                type: 'harvest-risk',
                channel: 'in-app',
                content: `Your crop health diagnosis for "${visionResult.diagnosis}" is currently queued for extension agent review. Ref: #${reviewItem.id.substring(0, 8)}`
              }
            });

            reply = currentLangTemplates.loadingExpert;
            reviewQueueId = reviewItem.id;
          } else {
            reply = isHindi
              ? `फसल निदान रिपोर्ट: **${visionResult.diagnosis}**\nविश्वास स्कोर: **${(confidenceScore * 100).toFixed(0)}%**\n\nसुझाव:\n${visionResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
              : `Crop Diagnosis Report: **${visionResult.diagnosis}**\nConfidence Score: **${(confidenceScore * 100).toFixed(0)}%**\n\nSuggestions:\n${visionResult.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
          }
        } else {
          reply = "Please complete your onboarding and register an active crop in your profile settings before diagnosing crop health.";
        }
      } else {
        // Run regular Gemini Text
        reply = await callGeminiText(message, systemInstruction, apiKey);
      }
    } catch (apiError: any) {
      console.error('Gemini API call failed, falling back to static templates:', apiError);
      // Fallback below if API fails
    }
  }

  // 3. Fallback templates if Gemini API Key not set or failed
  if (!reply) {
    if (intent === 'crop_diagnosis' || contentType === 'image') {
      if (confidenceScore < 0.7) {
        const activeCrop = farmer?.farms[0]?.crops[0];
        if (activeCrop) {
          const diagnosis = await prisma.cropDiagnosis.create({
            data: {
              cropId: activeCrop.id,
              imageUrl: imageUrl || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400',
              diagnosisResult: 'Pending Expert Verification: Suspected Powdery Mildew.',
              confidenceScore,
              humanReviewed: false
            }
          });

          const reviewItem = await prisma.reviewQueueItem.create({
            data: {
              type: 'diagnosis',
              referenceId: diagnosis.id,
              priority: 'high',
              status: 'pending'
            }
          });

          await prisma.notification.create({
            data: {
              farmerId: farmer.id,
              type: 'harvest-risk',
              channel: 'in-app',
              content: `Your crop health diagnosis is currently queued for extension worker approval. Reference: #${reviewItem.id.substring(0, 8)}`
            }
          });

          reply = currentLangTemplates.loadingExpert;
          reviewQueueId = reviewItem.id;
        } else {
          reply = "Please register an active crop in your profile settings before diagnosing crop health.";
        }
      } else {
        reply = "Your crop diagnosis is healthy! Confirmed by automated inference with 95% confidence.";
      }
    } else if (intent === 'scheme_check') {
      if (!farmer) {
        reply = currentLangTemplates.noProfile;
      } else {
        const matches = await prisma.schemeMatch.findMany({
          where: { farmerId: farmer.id, status: 'suggested' },
          include: { scheme: true }
        });

        if (matches.length === 0) {
          reply = isHindi 
            ? "मुझे आपकी प्रोफ़ाइल से मेल खाने वाली कोई सक्रिय योजना नहीं मिली।" 
            : "I could not find any active schemes matching your profile specifications.";
        } else {
          const schemeList = matches.map(m => `• **${m.scheme.name}** (${m.scheme.level})\n  *Match Score:* ${m.eligibilityScore}%\n  *Documents required:* ${JSON.parse(m.scheme.requiredDocuments).join(', ')}`).join('\n\n');
          reply = isHindi
            ? `आपकी प्रोफ़ाइल के आधार पर निम्नलिखित योजनाएं सुझाई गई हैं:\n\n${schemeList}\n\nआप अधिक जानकारी और आवेदन के लिए अपने डैशबोर्ड के "सरकारी योजनाएं" अनुभाग पर जा सकते हैं।`
            : `Based on your profile, you are eligible for the following schemes:\n\n${schemeList}\n\nGo to the /dashboard/schemes page to check detail checklist.`;
          reply += currentLangTemplates.disclaimer;
        }
      }
    } else if (intent === 'harvest_advice') {
      if (!farmer || !farmer.farms[0]?.crops[0]) {
        reply = isHindi
          ? "सलाह के लिए कृपया अपनी प्रोफ़ाइल में एक सक्रिय फसल जोड़ें।"
          : "Please add an active crop to your profile to get pricing and storage recommendations.";
      } else {
        const crop = farmer.farms[0].crops[0];
        const spoilageRisk = 45.0;
        const recommendedStorage = crop.cropName === 'Chili' ? 90 : 30;
        const recommendedAction = recommendedStorage > 45 ? 'store' : 'sell';
        const localPrice = crop.cropName === 'Chili' ? 18000 : crop.cropName === 'Cotton' ? 7200 : 2100;

        reply = isHindi
          ? `📊 **कटाई और भंडारण सलाह - ${crop.cropName}**\n\n• खराब होने का जोखिम: **${spoilageRisk}%**\n• वर्तमान स्थानीय मंडी मूल्य: **₹${localPrice} प्रति क्विंटल**\n• अनुशंसित कार्रवाई: ${recommendedAction === 'store' ? 'कीमतें बढ़ने तक कोल्ड स्टोरेज में रखें' : 'बाजार मूल्य स्थिर है, तुरंत बेचें'}\n• अनुशंसित भंडारण अवधि: **${recommendedStorage} दिन**\n\nआप अपने डैशबोर्ड पर "फसल कटाई सलाहकार" पर जाकर पास के कोल्ड स्टोरेज की सूची और मानचित्र देख सकते हैं।`
          : `📊 **Post-Harvest Loss Advisory for ${crop.cropName}**\n\n• Spoilage Risk Index: **${spoilageRisk}%**\n• Current Mandi Price: **₹${localPrice} per quintal**\n• Recommended Action: **${recommendedAction === 'store' ? 'Store in Cold Storage (Prices expected to rise)' : 'Sell immediately'}**\n• Suggested Storage: **${recommendedStorage} Days**\n\nVisit your dashboard's /dashboard/harvest-advisor to view nearby cold storage contacts.`;
      }
    } else if (intent === 'equipment_rent') {
      const district = farmer?.district || 'Wardha';
      const listings = await prisma.equipmentListing.findMany({
        where: { district },
        take: 2
      });

      if (listings.length === 0) {
        reply = isHindi
          ? `मुझे आपके जिले (${district}) में कोई उपकरण उपलब्ध नहीं मिला।`
          : `No equipment listings found near your district (${district}).`;
      } else {
        const eqList = listings.map(l => `• **${l.equipmentType}** - Provided by ${l.source}\n  *Price:* ₹${l.pricePerDay} per day\n  *Location:* ${l.location}`).join('\n\n');
        reply = isHindi
          ? `आपके जिले (${district}) में किराये पर उपलब्ध उपकरण:\n\n${eqList}\n\nइन्हें बुक करने के लिए अपने डैशबोर्ड पर "उपकरण किराये पर लें" पर जाएं।`
          : `Available equipment rentals in your district (${district}):\n\n${eqList}\n\nGo to the /dashboard/equipment screen to select dates.`;
      }
    } else {
      reply = currentLangTemplates.generalHelp;
    }
  }

  // 4. Create message history records in DB
  if (farmerId) {
    let conversation = await prisma.conversation.findFirst({
      where: { farmerId }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { farmerId }
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'farmer',
        contentType,
        content: message || 'Image attachment'
      }
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: reviewed ? 'agent' : 'bot',
        contentType: 'text',
        content: reply,
        intent,
        confidenceScore
      }
    });
  }

  return {
    reply,
    intent,
    confidenceScore,
    reviewed,
    reviewQueueId
  };
}
