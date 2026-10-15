export interface ClinicalPreset {
  id: string;
  title: string;
  tier: 'RED' | 'YELLOW' | 'GREEN';
  categoryBadge: string;
  symptoms: string;
  vitals: {
    temperatureF: number;
    heartRateBpm: number;
    oxygenSatPercent: number;
    painScore: number;
  };
  imageSvg: string;
  detectedFeatures: {
    name: string;
    clinicalTag: 'erythema' | 'edema' | 'margin_irregularity' | 'exudate_pus' | 'depth_tissue_involvement' | 'skin_discoloration';
    severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
    confidence: number;
    x: number; // percentage coordinates 0-100
    y: number;
    observation: string;
  }[];
}

export const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: 'case-anaphylaxis-red',
    title: 'Severe Anaphylaxis & Angioedema',
    tier: 'RED',
    categoryBadge: '🚨 Tier 1: Critical Emergency',
    symptoms: 'Sudden severe throat tightness, wheezing, swelling of lips and eyelids after eating peanuts 10 minutes ago. Dizziness and difficulty swallowing.',
    vitals: {
      temperatureF: 98.6,
      heartRateBpm: 142,
      oxygenSatPercent: 88,
      painScore: 8
    },
    imageSvg: `
      <svg viewBox="0 0 400 320" class="w-full h-full rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="edema-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.8"/>
            <stop offset="60%" stop-color="#e11d48" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#881337" stop-opacity="0"/>
          </radialGradient>
          <filter id="blur-filter">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>
        <!-- Face/Lip Contour Outline -->
        <path d="M 120 70 C 130 30, 270 30, 280 70 C 310 130, 310 210, 260 260 C 200 290, 160 280, 140 260 C 90 210, 90 130, 120 70 Z" fill="#2d1b22" stroke="#e11d48" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
        <!-- Severe Edema Tissue Mass -->
        <ellipse cx="200" cy="180" rx="65" ry="38" fill="url(#edema-glow)"/>
        <!-- Erythema Capillary Flush -->
        <circle cx="165" cy="130" r="32" fill="#be123c" opacity="0.55" filter="url(#blur-filter)"/>
        <circle cx="235" cy="130" r="32" fill="#be123c" opacity="0.55" filter="url(#blur-filter)"/>
        <!-- Urticarial Wheals / Swelling -->
        <path d="M 170 185 Q 200 170 230 185 Q 200 205 170 185" fill="#fda4af" stroke="#f43f5e" stroke-width="3"/>
        <path d="M 175 195 Q 200 220 225 195" fill="#f43f5e" opacity="0.8"/>
        <!-- Cyanotic perioral hue -->
        <ellipse cx="200" cy="225" rx="45" ry="14" fill="#38bdf8" opacity="0.25" filter="url(#blur-filter)"/>
      </svg>
    `,
    detectedFeatures: [
      {
        name: 'Edema (Perioral Angioedema)',
        clinicalTag: 'edema',
        severity: 'Severe',
        confidence: 0.94,
        x: 50,
        y: 56,
        observation: 'Marked interstitial fluid extravasation presenting as profound perioral and mucosal distension.'
      },
      {
        name: 'Erythema (Capillary Engorgement)',
        clinicalTag: 'erythema',
        severity: 'Severe',
        confidence: 0.91,
        x: 41,
        y: 40,
        observation: 'Extensive facial microvascular hyperemia consistent with systemic histamine degranulation.'
      },
      {
        name: 'Skin Discoloration (Perioral Cyanosis)',
        clinicalTag: 'skin_discoloration',
        severity: 'Severe',
        confidence: 0.86,
        x: 50,
        y: 70,
        observation: 'Hypoxic bluish duskiness observed periorally, corresponding to 88% SpO2 peripheral saturation.'
      }
    ]
  },
  {
    id: 'case-laceration-yellow',
    title: 'Deep Forearm Laceration with Edema',
    tier: 'YELLOW',
    categoryBadge: '⚠️ Tier 2: Urgent / Moderate Care',
    symptoms: 'Cut forearm deeply on broken window glass. Bleeding controlled after 15 min of direct pressure, but wound edges gap >0.5 cm with visible subcutaneous fat. Throbbing pain.',
    vitals: {
      temperatureF: 99.1,
      heartRateBpm: 96,
      oxygenSatPercent: 99,
      painScore: 7
    },
    imageSvg: `
      <svg viewBox="0 0 400 320" class="w-full h-full rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="arm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#332219"/>
            <stop offset="100%" stop-color="#1f1612"/>
          </linearGradient>
        </defs>
        <!-- Forearm Silhouette -->
        <rect x="70" y="80" width="260" height="160" rx="30" fill="url(#arm-grad)" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3 3"/>
        <!-- Erythematous margin zone -->
        <path d="M 120 160 Q 200 130 280 160 Q 200 190 120 160" fill="#991b1b" opacity="0.45"/>
        <!-- Deep laceration gap -->
        <path d="M 130 160 C 170 145, 230 145, 270 160 C 230 175, 170 175, 130 160 Z" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
        <!-- Subcutaneous tissue visibility dots -->
        <circle cx="180" cy="160" r="3.5" fill="#fbbf24"/>
        <circle cx="205" cy="160" r="4.5" fill="#f59e0b"/>
        <circle cx="230" cy="160" r="3" fill="#fbbf24"/>
        <!-- Clotted serosanguinous exudate -->
        <line x1="160" y1="165" x2="175" y2="185" stroke="#7f1d1d" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="220" y1="165" x2="235" y2="188" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
    detectedFeatures: [
      {
        name: 'Depth & Tissue Involvement',
        clinicalTag: 'depth_tissue_involvement',
        severity: 'Moderate',
        confidence: 0.92,
        x: 50,
        y: 50,
        observation: 'Full epidermal and dermal severance with yellow subcutaneous adipose layer visual exposure; suture evaluation indicated.'
      },
      {
        name: 'Margin Irregularity',
        clinicalTag: 'margin_irregularity',
        severity: 'Moderate',
        confidence: 0.88,
        x: 33,
        y: 50,
        observation: 'Jagged, non-linear incisional perimeter requiring clinical wound debridement and approximation.'
      },
      {
        name: 'Erythema (Perilesional)',
        clinicalTag: 'erythema',
        severity: 'Moderate',
        confidence: 0.85,
        x: 65,
        y: 48,
        observation: 'Active reactive erythema halo extending 8mm beyond wound periphery.'
      }
    ]
  },
  {
    id: 'case-burn-yellow',
    title: 'Second-Degree Thermal Burn with Blistering',
    tier: 'YELLOW',
    categoryBadge: '⚠️ Tier 2: Urgent / Moderate Care',
    symptoms: 'Scalding hot cooking oil splattered on right hand and wrist 30 mins ago. Painful fluid-filled blisters formed rapidly, intense burning sensation, skin looks red and mottled.',
    vitals: {
      temperatureF: 99.4,
      heartRateBpm: 104,
      oxygenSatPercent: 98,
      painScore: 8
    },
    imageSvg: `
      <svg viewBox="0 0 400 320" class="w-full h-full rounded-xl bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="blister-glow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.9"/>
            <stop offset="60%" stop-color="#f97316" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#9a3412" stop-opacity="0.3"/>
          </radialGradient>
        </defs>
        <!-- Hand silhouette base -->
        <path d="M 110 240 L 110 130 C 110 100, 140 100, 140 130 L 140 110 C 140 80, 170 80, 170 110 L 170 100 C 170 70, 200 70, 200 100 L 200 120 C 200 90, 230 90, 230 120 L 230 180 C 260 170, 280 200, 260 220 L 250 250 Z" fill="#291a14" stroke="#ea580c" stroke-width="1.5" opacity="0.65"/>
        <!-- Erythematous thermal zone -->
        <circle cx="185" cy="175" r="55" fill="#c2410c" opacity="0.6"/>
        <!-- Primary Bulla / Fluid Blister -->
        <ellipse cx="175" cy="165" rx="26" ry="18" fill="url(#blister-glow)" stroke="#fdba74" stroke-width="1.5"/>
        <!-- Secondary Satellite Blisters -->
        <circle cx="210" cy="185" r="12" fill="url(#blister-glow)" stroke="#fdba74"/>
        <circle cx="160" cy="195" r="9" fill="url(#blister-glow)" stroke="#fdba74"/>
      </svg>
    `,
    detectedFeatures: [
      {
        name: 'Edema (Bulla Formation / Blisters)',
        clinicalTag: 'edema',
        severity: 'Moderate',
        confidence: 0.95,
        x: 44,
        y: 51,
        observation: 'Epidermal detachment with tense serous fluid collection indicating partial-thickness dermal involvement.'
      },
      {
        name: 'Erythema (Thermal Hyperemia)',
        clinicalTag: 'erythema',
        severity: 'Moderate',
        confidence: 0.92,
        x: 52,
        y: 58,
        observation: 'Confluent vivid erythema across dorsal surface with acute nociceptive hyperalgesia.'
      },
      {
        name: 'Exudate / Serous Fluid',
        clinicalTag: 'exudate_pus',
        severity: 'Moderate',
        confidence: 0.89,
        x: 42,
        y: 48,
        observation: 'Intact sterile blister fluid. Blister puncture strictly contraindicated to maintain protective barrier.'
      }
    ]
  },
  {
    id: 'case-scrape-green',
    title: 'Superficial Abrasion & Home Self-Care',
    tier: 'GREEN',
    categoryBadge: '🟢 Tier 3: Non-Emergency / Self-Care',
    symptoms: 'Tripped while jogging on asphalt and scraped outer knee. Superficial bleeding stopped within 2 minutes. Mild stinging sensation when washing with tap water. No fever, no joint swelling.',
    vitals: {
      temperatureF: 98.4,
      heartRateBpm: 76,
      oxygenSatPercent: 99,
      painScore: 2
    },
    imageSvg: `
      <svg viewBox="0 0 400 320" class="w-full h-full rounded-xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950" xmlns="http://www.w3.org/2000/svg">
        <!-- Knee Area base -->
        <circle cx="200" cy="160" r="90" fill="#1b241e" stroke="#059669" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>
        <!-- Superficial pinpoint capillary marks -->
        <circle cx="180" cy="140" r="1.5" fill="#dc2626"/>
        <circle cx="195" cy="145" r="2" fill="#b91c1c"/>
        <circle cx="215" cy="138" r="1.5" fill="#dc2626"/>
        <circle cx="170" cy="160" r="2.5" fill="#991b1b"/>
        <circle cx="225" cy="165" r="2" fill="#b91c1c"/>
        <circle cx="190" cy="175" r="1.5" fill="#dc2626"/>
        <!-- Light epidermal rub streak -->
        <path d="M 165 145 Q 200 155 235 150" stroke="#f87171" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        <path d="M 175 165 Q 200 170 220 162" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
      </svg>
    `,
    detectedFeatures: [
      {
        name: 'Erythema (Superficial Friction)',
        clinicalTag: 'erythema',
        severity: 'Mild',
        confidence: 0.9,
        x: 50,
        y: 48,
        observation: 'Faint localized friction erythema restricted to the stratum corneum with intact deeper dermal architecture.'
      },
      {
        name: 'Depth & Tissue Involvement',
        clinicalTag: 'depth_tissue_involvement',
        severity: 'Mild',
        confidence: 0.93,
        x: 48,
        y: 53,
        observation: 'Superficial epidermal denudation only; no subcutaneous fat exposure, no suturing indicated.'
      }
    ]
  },
  {
    id: 'case-rash-green',
    title: 'Mild Localized Contact Dermatitis',
    tier: 'GREEN',
    categoryBadge: '🟢 Tier 3: Non-Emergency / Self-Care',
    symptoms: 'Mild itchy red patch on wrist where a new watch strap was worn for 2 days. No pain, no blisters, no spreading red streaks, no systemic symptoms.',
    vitals: {
      temperatureF: 98.6,
      heartRateBpm: 72,
      oxygenSatPercent: 99,
      painScore: 2
    },
    imageSvg: `
      <svg viewBox="0 0 400 320" class="w-full h-full rounded-xl bg-gradient-to-br from-teal-950/30 via-slate-900 to-slate-950" xmlns="http://www.w3.org/2000/svg">
        <!-- Wrist shape -->
        <rect x="90" y="90" width="220" height="140" rx="20" fill="#162222" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="3 3"/>
        <!-- Band outline -->
        <rect x="170" y="90" width="60" height="140" fill="#0f766e" opacity="0.15"/>
        <!-- Macular pink erythema papules -->
        <circle cx="185" cy="130" r="4" fill="#fb7185" opacity="0.7"/>
        <circle cx="205" cy="140" r="5" fill="#f43f5e" opacity="0.6"/>
        <circle cx="195" cy="160" r="4.5" fill="#fb7185" opacity="0.7"/>
        <circle cx="215" cy="175" r="3.5" fill="#f43f5e" opacity="0.5"/>
        <circle cx="185" cy="190" r="4" fill="#fb7185" opacity="0.6"/>
      </svg>
    `,
    detectedFeatures: [
      {
        name: 'Erythema (Papular Flush)',
        clinicalTag: 'erythema',
        severity: 'Mild',
        confidence: 0.88,
        x: 50,
        y: 47,
        observation: 'Faint maculopapular erythema conforming geometrically to watch strap contact footprint.'
      },
      {
        name: 'Margin Irregularity',
        clinicalTag: 'margin_irregularity',
        severity: 'None',
        confidence: 0.82,
        x: 48,
        y: 52,
        observation: 'Sharp demarcation consistent with exogenous contact allergen rather than infectious cellulitis.'
      }
    ]
  }
];
