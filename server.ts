import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { evaluateTriageMatrix, MANDATORY_DISCLAIMER, RX_SAFETY_WARNING, PatientVitals } from './src/utils/triageMatrix.js';
import { SPATIAL_FACILITIES_DATABASE } from './src/data/facilities.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI server-side with telemetry header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log('[PulseCare Server] GoogleGenAI client initialized successfully with model gemini-3.8-flash.');
  } catch (err) {
    console.warn('[PulseCare Server] Error initializing GoogleGenAI:', err);
  }
} else {
  console.log('[PulseCare Server] No GEMINI_API_KEY found in environment. Using clinical algorithmic rule engine fallback.');
}

// System prompt defining PulseCare AI Engine clinical constraints
const PULSECARE_SYSTEM_PROMPT = `
You are "PulseCare AI Engine", an intelligent multimodal medical triage and healthcare navigation backend system.
Your primary role is to process multimodal inputs (user-reported symptoms + lesion/wound images), calculate emergency severity scores, provide first-aid protocols, and trigger automated downstream web services (Tele-Pharmacy, Video Consultation, and Spatial Pharmacy/Hospital Locator).

SYSTEM ARCHITECTURE & CORE WORKFLOWS:
1. MULTIMODAL EMERGENCY TRIAGE MATRIX:
   - TIER 1: CRITICAL EMERGENCY (Red)
     Criteria: Anaphylaxis, chest pain, acute respiratory distress, severe trauma, deep arterial bleeding, stroke signs.
     Score: 8-10.
     Action Protocol: High-priority emergency alert. Prompt immediate call to 911 / 112 / 108. Step-by-step CPR/First-Aid. Doctor video required = true.
   - TIER 2: URGENT / MODERATE CARE (Yellow)
     Criteria: High fever (>102°F), moderate burns, deep lacerations needing sutures, suspected fractures, spreading skin rashes.
     Score: 4-7.
     Action Protocol: Urgent care facility visit. Instant Doctor Video Call. Doctor video required = true.
   - TIER 3: NON-EMERGENCY / SELF-CARE (Green)
     Criteria: Superficial scrapes, mild seasonal allergies, minor headaches, localized mild rashes.
     Score: 1-3.
     Action Protocol: Home care advice. Direct to Tele-Pharmacy Video Call for OTC guidance & door-step delivery. Pharmacy video required = true, doctor video = false.

2. COMPUTER VISION & IMAGE ANALYSIS MODULE:
   - Observable indicators: erythema, edema, margin irregularity, exudate/pus, depth, skin discoloration.
   - Guardrail: Formulate visual feedback as "preliminary feature observation" rather than a definitive diagnostic label.

3. SAFETY & COMPLIANCE:
   - Mandatory disclaimer: "Disclaimer: PulseCare AI is a university research project tool designed for preliminary triage support only. It does not replace professional medical diagnosis, advice, or treatment."
   - Never issue prescription-only (Rx) dosage instructions. Strictly direct users to licensed medical professionals or pharmacists.
`;

// Multimodal triage analysis endpoint
app.post('/api/triage/analyze', async (req: Request, res: Response) => {
  try {
    const { symptoms, vitals, imageBase64, imageMime } = req.body as {
      symptoms?: string;
      vitals?: PatientVitals;
      imageBase64?: string;
      imageMime?: string;
    };

    const patientText = symptoms || 'Routine evaluation of observed bodily skin feature';

    // If Gemini client is active, call gemini-3.8-flash
    if (aiClient) {
      try {
        const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

        // If image provided, clean base64 data and append inlineData
        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: imageMime || 'image/jpeg',
              data: cleanBase64
            }
          });
        }

        const promptText = `
Analyze the following patient presentation:
Reported Symptoms: "${patientText}"
Reported Vitals: ${JSON.stringify(vitals || {})}
Evaluate strictly against the 3-Tier Emergency Matrix.
Format visual feedback strictly as preliminary feature observations.
Adhere to the mandatory disclaimer and no-Rx rules.
`;
        parts.push({ text: promptText });

        const geminiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: PULSECARE_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                triage_level: { type: Type.STRING, description: 'RED | YELLOW | GREEN' },
                urgency_score: { type: Type.INTEGER, description: '1-10 integer' },
                category_label: { type: Type.STRING },
                urgency_description: { type: Type.STRING },
                primary_symptoms: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                clinical_summary: { type: Type.STRING },
                first_aid_steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                image_analysis: {
                  type: Type.OBJECT,
                  properties: {
                    detected_features: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    confidence_rating: { type: Type.STRING },
                    preliminary_notes: { type: Type.STRING }
                  },
                  required: ['detected_features', 'confidence_rating']
                },
                webrtc_actions: {
                  type: Type.OBJECT,
                  properties: {
                    doctor_video_required: { type: Type.BOOLEAN },
                    pharmacy_video_required: { type: Type.BOOLEAN }
                  },
                  required: ['doctor_video_required', 'pharmacy_video_required']
                }
              },
              required: [
                'triage_level',
                'urgency_score',
                'primary_symptoms',
                'first_aid_steps',
                'image_analysis',
                'webrtc_actions'
              ]
            }
          }
        });

        const rawText = geminiResponse.text?.trim();
        if (rawText) {
          const parsed = JSON.parse(rawText);

          // Standardize tier level
          let tier: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
          if (parsed.triage_level?.toUpperCase().includes('RED')) tier = 'RED';
          else if (parsed.triage_level?.toUpperCase().includes('YELLOW')) tier = 'YELLOW';

          // Build unified response structure
          const fallbackReference = evaluateTriageMatrix(patientText, vitals);

          const resultPayload = {
            triage_level: tier,
            urgency_score: Number(parsed.urgency_score) || fallbackReference.urgency_score,
            category_label: parsed.category_label || fallbackReference.category_label,
            urgency_description: parsed.urgency_description || fallbackReference.urgency_description,
            primary_symptoms: Array.isArray(parsed.primary_symptoms) ? parsed.primary_symptoms : fallbackReference.primary_symptoms,
            clinical_summary: parsed.clinical_summary || fallbackReference.clinical_summary,
            first_aid_steps: Array.isArray(parsed.first_aid_steps) && parsed.first_aid_steps.length > 0 ? parsed.first_aid_steps : fallbackReference.first_aid_steps,
            image_analysis: {
              detected_features: Array.isArray(parsed.image_analysis?.detected_features) ? parsed.image_analysis.detected_features : fallbackReference.image_analysis.detected_features,
              confidence_rating: parsed.image_analysis?.confidence_rating || 'High',
              observations: fallbackReference.image_analysis.observations,
              preliminary_notes: parsed.image_analysis?.preliminary_notes || fallbackReference.image_analysis.preliminary_notes
            },
            webrtc_actions: {
              doctor_video_required: Boolean(parsed.webrtc_actions?.doctor_video_required ?? fallbackReference.webrtc_actions.doctor_video_required),
              pharmacy_video_required: Boolean(parsed.webrtc_actions?.pharmacy_video_required ?? fallbackReference.webrtc_actions.pharmacy_video_required),
              session_token: fallbackReference.webrtc_actions.session_token,
              peer_role: fallbackReference.webrtc_actions.peer_role
            },
            recommended_facilities: fallbackReference.recommended_facilities,
            safety_disclaimer: MANDATORY_DISCLAIMER,
            prescription_safety_warning: RX_SAFETY_WARNING,
            generated_by: 'gemini-3.8-flash'
          };

          return res.json(resultPayload);
        }
      } catch (geminiError) {
        console.warn('[PulseCare Server] Gemini API call returned error, switching to algorithmic rule engine:', geminiError);
      }
    }

    // Algorithmic rule engine fallback
    const result = evaluateTriageMatrix(patientText, vitals);
    return res.json({
      ...result,
      generated_by: 'pulsecare-rule-engine-fallback'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('[PulseCare Server] Triage analysis error:', err);
    return res.status(500).json({ error: message });
  }
});

// Spatial Healthcare Facilities & Pharmacies endpoint
app.get('/api/facilities', (req: Request, res: Response) => {
  const radiusKm = parseFloat(req.query.radiusKm as string) || 5;
  const filtered = SPATIAL_FACILITIES_DATABASE.filter(f => f.distanceKm <= radiusKm);
  return res.json({
    radiusKm,
    totalCount: filtered.length,
    facilities: filtered
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseCare Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
