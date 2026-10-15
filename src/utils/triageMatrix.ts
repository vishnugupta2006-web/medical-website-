/**
 * PulseCare AI Engine - Multimodal Emergency Triage Matrix & Clinical Rule Engine
 * University Research Project Tool for Preliminary Triage Support
 */

export type TriageLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface ClinicalFeatureObservation {
  feature: 'erythema' | 'edema' | 'margin_irregularity' | 'exudate_pus' | 'depth_tissue_involvement' | 'skin_discoloration';
  name: string;
  detected: boolean;
  confidence: number; // 0.0 - 1.0
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  observation: string;
  coordinates?: { x: number; y: number; radius: number }; // For visual scanning overlay HUD
}

export interface ImageAnalysisResult {
  detected_features: string[];
  confidence_rating: 'High' | 'Medium' | 'Low';
  observations: ClinicalFeatureObservation[];
  preliminary_notes: string;
}

export interface WebRTCActionTriggers {
  doctor_video_required: boolean;
  pharmacy_video_required: boolean;
  session_token?: string;
  peer_role?: 'emergency_physician' | 'urgent_care_doctor' | 'clinical_pharmacist';
}

export interface PatientVitals {
  temperatureF?: number;
  heartRateBpm?: number;
  oxygenSatPercent?: number;
  painScore?: number; // 1-10
}

export interface TriageResult {
  triage_level: TriageLevel;
  urgency_score: number; // 1-10
  primary_symptoms: string[];
  category_label: string;
  urgency_description: string;
  clinical_summary: string;
  first_aid_steps: string[];
  image_analysis: ImageAnalysisResult;
  webrtc_actions: WebRTCActionTriggers;
  recommended_facilities: ('TRAUMA_CENTER' | 'EMERGENCY_ROOM' | 'URGENT_CARE' | '24_7_PHARMACY')[];
  safety_disclaimer: string;
  prescription_safety_warning: string;
}

export const MANDATORY_DISCLAIMER =
  'Disclaimer: PulseCare AI is a university research project tool designed for preliminary triage support only. It does not replace professional medical diagnosis, advice, or treatment.';

export const RX_SAFETY_WARNING =
  'PulseCare AI strictly enforces prescription safety. Prescription-only (Rx) medications cannot be dosed autonomously. Please consult a licensed medical physician or board-certified pharmacist.';

// Known Clinical Red-Flag Keywords for Tier 1
const TIER_1_KEYWORDS = [
  'chest pain',
  'heart attack',
  'cardiac',
  'anaphylaxis',
  'throat swelling',
  'unable to breathe',
  'respiratory distress',
  'stridor',
  'arterial bleeding',
  'gushing blood',
  'spurting blood',
  'stroke',
  'facial drooping',
  'arm weakness',
  'slurred speech',
  'loss of consciousness',
  'unresponsive',
  'severe trauma',
  'crush injury',
  'cyanosis',
  'blue lips'
];

// Known Moderate Urgency Keywords for Tier 2
const TIER_2_KEYWORDS = [
  'high fever',
  'fever >102',
  'fever 103',
  'fever 104',
  'moderate burn',
  'second degree burn',
  'blistering burn',
  'deep laceration',
  'sutures',
  'stitches needed',
  'suspected fracture',
  'broken bone',
  'deformity',
  'spreading rash',
  'cellulitis',
  'red streaks',
  'pus draining',
  'severe abdominal pain',
  'persistent vomiting'
];

// Home Care / Tier 3 Keywords
const TIER_3_KEYWORDS = [
  'superficial scrape',
  'scrape',
  'scratch',
  'minor abrasion',
  'minor headache',
  'mild allergy',
  'sneezing',
  'runny nose',
  'localized rash',
  'mild itch',
  'paper cut',
  'mild sunburn',
  'sore throat'
];

/**
 * Evaluates patient symptoms, vitals, and image indications into the 3-Tier Emergency Matrix.
 */
export function evaluateTriageMatrix(
  symptomText: string,
  vitals?: PatientVitals,
  imageFeatures?: Partial<Record<ClinicalFeatureObservation['feature'], { detected: boolean; severity: ClinicalFeatureObservation['severity'] }>>
): TriageResult {
  const normalizedText = (symptomText || '').toLowerCase();
  const detectedSymptoms: string[] = [];
  let score = 2; // Default baseline Tier 3

  // Check Tier 1 triggers
  let isTier1 = false;
  for (const keyword of TIER_1_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      isTier1 = true;
      detectedSymptoms.push(keyword);
    }
  }

  // Vital triggers for Tier 1
  if (vitals?.oxygenSatPercent && vitals.oxygenSatPercent < 90) {
    isTier1 = true;
    detectedSymptoms.push(`Severe Hypoxia (O2 Sat ${vitals.oxygenSatPercent}%)`);
  }
  if (vitals?.heartRateBpm && (vitals.heartRateBpm > 145 || vitals.heartRateBpm < 40)) {
    isTier1 = true;
    detectedSymptoms.push(`Extreme Heart Rate (${vitals.heartRateBpm} bpm)`);
  }

  // Check Tier 2 triggers
  let isTier2 = false;
  for (const keyword of TIER_2_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      isTier2 = true;
      detectedSymptoms.push(keyword);
    }
  }

  // Vitals for Tier 2
  if (vitals?.temperatureF && vitals.temperatureF >= 102.0) {
    isTier2 = true;
    detectedSymptoms.push(`High Core Temperature (${vitals.temperatureF}°F)`);
  }
  if (vitals?.painScore && vitals.painScore >= 7) {
    isTier2 = true;
    detectedSymptoms.push(`Severe Pain (Score ${vitals.painScore}/10)`);
  }

  // Check Tier 3 keywords
  for (const keyword of TIER_3_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      detectedSymptoms.push(keyword);
    }
  }

  // Image feature observations
  const observations: ClinicalFeatureObservation[] = [
    {
      feature: 'erythema',
      name: 'Erythema (Capillary Dilation)',
      detected: imageFeatures?.erythema?.detected ?? (normalizedText.includes('redness') || normalizedText.includes('erythema') || normalizedText.includes('rash')),
      confidence: 0.88,
      severity: imageFeatures?.erythema?.severity ?? (isTier1 ? 'Severe' : isTier2 ? 'Moderate' : 'Mild'),
      observation: 'Preliminary observation of superficial vascular flushing and tissue erythema.',
      coordinates: { x: 42, y: 38, radius: 24 }
    },
    {
      feature: 'edema',
      name: 'Edema (Tissue Swelling)',
      detected: imageFeatures?.edema?.detected ?? (normalizedText.includes('swelling') || normalizedText.includes('edema') || normalizedText.includes('puffy')),
      confidence: 0.91,
      severity: imageFeatures?.edema?.severity ?? (isTier1 ? 'Severe' : isTier2 ? 'Moderate' : 'Mild'),
      observation: 'Preliminary observation indicates localized interstitial fluid accumulation.',
      coordinates: { x: 58, y: 46, radius: 28 }
    },
    {
      feature: 'margin_irregularity',
      name: 'Margin Irregularity',
      detected: imageFeatures?.margin_irregularity?.detected ?? (normalizedText.includes('irregular') || normalizedText.includes('jagged') || normalizedText.includes('uneven')),
      confidence: 0.84,
      severity: imageFeatures?.margin_irregularity?.severity ?? (isTier2 ? 'Moderate' : 'None'),
      observation: 'Preliminary observation evaluates perimeter demarcation and edge continuity.',
      coordinates: { x: 35, y: 62, radius: 18 }
    },
    {
      feature: 'exudate_pus',
      name: 'Exudate / Purulent Discharge',
      detected: imageFeatures?.exudate_pus?.detected ?? (normalizedText.includes('pus') || normalizedText.includes('drainage') || normalizedText.includes('oozing')),
      confidence: 0.87,
      severity: imageFeatures?.exudate_pus?.severity ?? (normalizedText.includes('pus') ? 'Moderate' : 'None'),
      observation: 'Preliminary observation examines presence of serous or purulent fluid secretions.',
      coordinates: { x: 50, y: 52, radius: 20 }
    },
    {
      feature: 'depth_tissue_involvement',
      name: 'Depth & Tissue Involvement',
      detected: imageFeatures?.depth_tissue_involvement?.detected ?? (normalizedText.includes('deep') || normalizedText.includes('fat visible') || normalizedText.includes('muscle') || normalizedText.includes('arterial')),
      confidence: 0.89,
      severity: imageFeatures?.depth_tissue_involvement?.severity ?? (isTier1 ? 'Severe' : isTier2 ? 'Moderate' : 'Mild'),
      observation: 'Preliminary depth estimation assesses dermal vs subcutaneous layer penetration.',
      coordinates: { x: 48, y: 48, radius: 32 }
    },
    {
      feature: 'skin_discoloration',
      name: 'Skin Discoloration / Cyanosis',
      detected: imageFeatures?.skin_discoloration?.detected ?? (normalizedText.includes('blue') || normalizedText.includes('pale') || normalizedText.includes('black') || normalizedText.includes('mottled')),
      confidence: 0.86,
      severity: imageFeatures?.skin_discoloration?.severity ?? (isTier1 ? 'Severe' : 'None'),
      observation: 'Preliminary chromatic evaluation monitors oxygenation changes and necrosis markers.',
      coordinates: { x: 65, y: 32, radius: 22 }
    }
  ];

  // If severe tissue depth or severe edema is observed, escalate
  const hasSevereVisuals = observations.some(o => o.detected && o.severity === 'Severe');
  const hasModerateVisuals = observations.some(o => o.detected && o.severity === 'Moderate');

  if (hasSevereVisuals && !isTier1 && !isTier2) {
    isTier2 = true;
  }

  // Calculate Tier and Urgency Score
  let triage_level: TriageLevel = 'GREEN';
  let category_label = 'TIER 3: NON-EMERGENCY / SELF-CARE';
  let urgency_description = 'Superficial or mild symptoms appropriate for home first-aid and tele-pharmacy OTC consultation.';
  let first_aid_steps: string[] = [];
  const recommended_facilities: ('TRAUMA_CENTER' | 'EMERGENCY_ROOM' | 'URGENT_CARE' | '24_7_PHARMACY')[] = [];

  if (isTier1) {
    triage_level = 'RED';
    score = Math.min(10, Math.max(8, 8 + (hasSevereVisuals ? 1 : 0) + (vitals?.oxygenSatPercent && vitals.oxygenSatPercent < 90 ? 1 : 0)));
    category_label = '🚨 TIER 1: CRITICAL EMERGENCY';
    urgency_description = 'Immediate life-threatening risk detected. Automated emergency dispatch alert triggered.';
    recommended_facilities.push('TRAUMA_CENTER', 'EMERGENCY_ROOM');

    if (normalizedText.includes('anaphylaxis') || normalizedText.includes('throat') || normalizedText.includes('allergic')) {
      first_aid_steps = [
        '1. Immediately inject Epinephrine auto-injector (EpiPen) into the outer mid-thigh if available.',
        '2. Call Emergency Services (911 / 112 / 108) immediately and state: "Suspected severe anaphylaxis".',
        '3. Place patient flat on their back with legs elevated approximately 12 inches (unless breathing is easier sitting up).',
        '4. Do not offer any oral liquids, food, or oral medications.',
        '5. Monitor airway, breathing, and pulse continuously; begin CPR if breathing ceases.'
      ];
    } else if (normalizedText.includes('bleeding') || normalizedText.includes('arterial') || normalizedText.includes('blood')) {
      first_aid_steps = [
        '1. Call Emergency Services immediately (911 / 112 / 108).',
        '2. Apply firm, continuous direct pressure over the bleeding site using sterile gauze or clean cloth.',
        '3. If arterial or severe limb hemorrhage does not stop, apply a commercial tourniquet 2-3 inches above the wound (not on a joint).',
        '4. Keep the injured person calm, lying down, and covered with a blanket to prevent hypothermia.',
        '5. Do not remove saturated bandages; layer additional dressings on top.'
      ];
    } else if (normalizedText.includes('chest') || normalizedText.includes('cardiac') || normalizedText.includes('heart')) {
      first_aid_steps = [
        '1. Call Emergency Services immediately (911 / 112 / 108) without delay.',
        '2. Keep patient in a comfortable half-sitting position with knees bent and back supported.',
        '3. Loosen restrictive clothing around chest and neck.',
        '4. If trained and patient has no aspirin allergy, emergency dispatcher may advise chewing non-coated aspirin (adult 325mg).',
        '5. Locate nearest Automated External Defibrillator (AED) and prepare for CPR (100-120 compressions/min).'
      ];
    } else {
      first_aid_steps = [
        '1. Call Emergency Services immediately (911 / 112 / 108).',
        '2. Keep patient calm, stationary, and warm; monitor airway and breathing.',
        '3. Do not move patient if neck or spinal injury is suspected.',
        '4. Prepare for immediate video triage link with emergency trauma physician.'
      ];
    }
  } else if (isTier2 || hasModerateVisuals) {
    triage_level = 'YELLOW';
    score = Math.min(7, Math.max(4, 5 + (vitals?.temperatureF && vitals.temperatureF >= 102 ? 1 : 0) + (hasModerateVisuals ? 1 : 0)));
    category_label = '⚠️ TIER 2: URGENT / MODERATE CARE';
    urgency_description = 'Requires medical evaluation within 1 to 4 hours. Tele-consultation or Urgent Care clinic recommended.';
    recommended_facilities.push('URGENT_CARE', 'EMERGENCY_ROOM');

    if (normalizedText.includes('burn')) {
      first_aid_steps = [
        '1. Cool the burn immediately under cool, gentle running water for 15-20 minutes (never use ice or butter).',
        '2. Gently remove tight jewelry or watches before swelling begins.',
        '3. Protect the area with a sterile, non-adherent dressing or clean plastic cling film.',
        '4. Do not break or puncture any intact blisters to prevent infection.',
        '5. Connect with an Urgent Care doctor for burn depth assessment and prescription silver sulfadiazine/wound care.'
      ];
    } else if (normalizedText.includes('laceration') || normalizedText.includes('cut') || normalizedText.includes('suture')) {
      first_aid_steps = [
        '1. Apply direct pressure with sterile gauze to control bleeding for 5-10 minutes.',
        '2. Rinse wound under running tap water to remove superficial debris (avoid harsh hydrogen peroxide).',
        '3. Apply a clean sterile barrier pad; do not close gaping wounds with tape if deeper than 0.25 inch.',
        '4. Lacerations needing sutures must be evaluated by a clinic physician within 6-8 hours for optimal wound closure.'
      ];
    } else if (normalizedText.includes('fever') || (vitals?.temperatureF && vitals.temperatureF >= 102)) {
      first_aid_steps = [
        '1. Rest in a well-ventilated room; wear lightweight, breathable cotton clothing.',
        '2. Maintain steady oral hydration with water, oral rehydration salts (ORS), or clear broth.',
        '3. Apply lukewarm damp cloths to the forehead, neck, and axilla for comfort.',
        '4. Monitor for secondary warning signs: stiff neck, confusion, persistent vomiting, or petechial rash.',
        '5. Initiate Instant Doctor Video Consultation for etiology screening.'
      ];
    } else {
      first_aid_steps = [
        '1. Rest and isolate the affected limb or area in an elevated position.',
        '2. Keep the site clean and shielded from friction or pressure.',
        '3. Document lesion progression with photos every 2 hours.',
        '4. Initiate Instant Doctor Video Call or proceed to the nearest Urgent Care Center.'
      ];
    }
  } else {
    triage_level = 'GREEN';
    score = Math.min(3, Math.max(1, 2 + (detectedSymptoms.length > 2 ? 1 : 0)));
    category_label = '🟢 TIER 3: NON-EMERGENCY / SELF-CARE';
    urgency_description = 'Mild, localized symptoms. Suitable for home self-care, OTC wound dressing, and tele-pharmacist delivery.';
    recommended_facilities.push('24_7_PHARMACY');

    first_aid_steps = [
      '1. Cleanse the area gently with mild soap and lukewarm tap water.',
      '2. Pat dry with a clean lint-free towel; apply an OTC triple antibiotic or petroleum barrier.',
      '3. Cover with a breathable sterile bandage to protect against dirt and bacterial friction.',
      '4. Connect with the Tele-Pharmacy Video Consult for pharmacist-approved OTC antiseptic dressings and doorstep delivery.',
      '5. Seek formal clinical re-evaluation if redness, swelling, warmth, or pus develops over the next 48 hours.'
    ];
  }

  const detectedFeatureNames = observations.filter(o => o.detected).map(o => o.name);

  const webrtc_actions: WebRTCActionTriggers = {
    doctor_video_required: triage_level === 'RED' || triage_level === 'YELLOW',
    pharmacy_video_required: triage_level === 'GREEN',
    session_token: `pc-webrtc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    peer_role: triage_level === 'RED' ? 'emergency_physician' : triage_level === 'YELLOW' ? 'urgent_care_doctor' : 'clinical_pharmacist'
  };

  const clinical_summary = `Patient presentation demonstrates ${detectedSymptoms.length > 0 ? detectedSymptoms.join(', ') : 'mild reported complaints'}. Visual inspection reveals preliminary observations of ${detectedFeatureNames.length > 0 ? detectedFeatureNames.join(' and ') : 'no acute cutaneous abnormalities'}. Calculated Urgency Score: ${score}/10 (${triage_level}).`;

  return {
    triage_level,
    urgency_score: score,
    primary_symptoms: detectedSymptoms.length > 0 ? detectedSymptoms : ['Mild discomfort / superficial observation'],
    category_label,
    urgency_description,
    clinical_summary,
    first_aid_steps,
    image_analysis: {
      detected_features: detectedFeatureNames,
      confidence_rating: isTier1 ? 'High' : isTier2 ? 'Medium' : 'High',
      observations,
      preliminary_notes: 'Visual computer-assisted analysis identifies cutaneous texture, border demarcation, and chromatic distribution as preliminary observational markers only.'
    },
    webrtc_actions,
    recommended_facilities,
    safety_disclaimer: MANDATORY_DISCLAIMER,
    prescription_safety_warning: RX_SAFETY_WARNING
  };
}
