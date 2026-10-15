import { jsPDF } from 'jspdf';
import { TriageResult, PatientVitals, MANDATORY_DISCLAIMER, RX_SAFETY_WARNING } from './triageMatrix.js';

export function generateTriagePDF(
  result: TriageResult,
  vitals: PatientVitals,
  symptoms: string,
  filename?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Background Bar
  const isRed = result.triage_level === 'RED';
  const isYellow = result.triage_level === 'YELLOW';
  const isGreen = result.triage_level === 'GREEN';

  // Primary Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(34, 211, 238); // cyan-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PULSECARE AI ENGINE', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Multimodal Medical Triage & Clinical Healthcare Navigation System', margin + 6, y + 14);
  doc.text('University Biomedical Informatics Research Tool', margin + 6, y + 19);

  // Reference Code & Date
  const docRef = `REF: PC-${Date.now().toString(36).toUpperCase()}`;
  const timestampStr = new Date().toLocaleString();
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(docRef, pageWidth - margin - 6, y + 8, { align: 'right' });
  doc.text(timestampStr, pageWidth - margin - 6, y + 14, { align: 'right' });

  y += 28;

  // Urgency Banner
  if (isRed) {
    doc.setFillColor(225, 29, 72); // rose-600
  } else if (isYellow) {
    doc.setFillColor(217, 119, 6); // amber-600
  } else {
    doc.setFillColor(16, 185, 129); // emerald-600
  }
  doc.rect(margin, y, contentWidth, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const tierTitle = `${result.triage_level} PRIORITY — ${result.category_label}`;
  doc.text(tierTitle, margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(result.urgency_description, margin + 6, y + 12);

  // Urgency Score Badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`SCORE: ${result.urgency_score}/10`, pageWidth - margin - 6, y + 10, { align: 'right' });

  y += 20;

  // Section 1: Patient Presentation & Vitals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PATIENT PRESENTATION & REPORTED SYMPTOMS', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const splitSymptoms = doc.splitTextToSize(symptoms || 'No detailed symptoms provided.', contentWidth);
  doc.text(splitSymptoms, margin, y);
  y += splitSymptoms.length * 4.2 + 2;

  // Vitals Mini Table
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 12, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 12, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const tempStr = vitals.temperatureF ? `${vitals.temperatureF} °F` : 'Not recorded';
  const hrStr = vitals.heartRateBpm ? `${vitals.heartRateBpm} bpm` : 'Not recorded';
  const o2Str = vitals.oxygenSatPercent ? `${vitals.oxygenSatPercent} %` : 'Not recorded';
  const painStr = vitals.painScore ? `${vitals.painScore} / 10` : 'Not recorded';

  const colW = contentWidth / 4;
  doc.text(`Temperature: ${tempStr}`, margin + 4, y + 7);
  doc.text(`Heart Rate: ${hrStr}`, margin + colW + 4, y + 7);
  doc.text(`Oxygen SpO2: ${o2Str}`, margin + colW * 2 + 4, y + 7);
  doc.text(`Pain Score: ${painStr}`, margin + colW * 3 + 4, y + 7);

  y += 18;

  // Section 2: Computer Vision Lesion Findings
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. COMPUTER VISION & LESION IMAGE ANALYSIS', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const featuresStr =
    result.image_analysis.detected_features.length > 0
      ? result.image_analysis.detected_features.join(', ')
      : 'No acute cutaneous abnormalities observed.';
  doc.text(`Observed Features: ${featuresStr}`, margin, y);
  y += 4.5;
  doc.text(`Confidence Rating: ${result.image_analysis.confidence_rating} Confidence`, margin, y);
  y += 4.5;

  const notes = doc.splitTextToSize(
    `Preliminary Clinical Note: ${result.image_analysis.preliminary_notes}`,
    contentWidth
  );
  doc.text(notes, margin, y);
  y += notes.length * 4.2 + 4;

  // Section 3: First-Aid Action Protocols
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. STEP-BY-STEP FIRST-AID & STABILIZATION PROTOCOLS', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  for (let i = 0; i < result.first_aid_steps.length; i++) {
    const step = result.first_aid_steps[i];
    const lines = doc.splitTextToSize(`${step}`, contentWidth - 4);
    doc.text(lines, margin + 2, y);
    y += lines.length * 4 + 1.5;
  }

  y += 3;

  // Section 4: WebRTC Referral & Recommended Facilities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. DOWNSTREAM CLINICAL REFERRAL & TELE-HEALTH STATUS', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const doctorReq = result.webrtc_actions.doctor_video_required ? 'REQUIRED (Emergency MD Triage)' : 'Not Required';
  const pharmacyReq = result.webrtc_actions.pharmacy_video_required ? 'ACTIVE (Pharmacist OTC Review)' : 'Optional';
  const facilities = result.recommended_facilities.join(', ').replace(/_/g, ' ');

  doc.text(`• Doctor Tele-Consultation: ${doctorReq}`, margin + 2, y);
  y += 4;
  doc.text(`• Tele-Pharmacy Video Consult: ${pharmacyReq}`, margin + 2, y);
  y += 4;
  doc.text(`• Recommended Facility Tiers: ${facilities}`, margin + 2, y);
  y += 8;

  // Physician Review & Signature Box
  doc.setDrawColor(148, 163, 184);
  doc.rect(margin, y, contentWidth, 22, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ATTENDING PHYSICIAN / CLINICAL REVIEWER NOTES & SIGNATURE:', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Signature: __________________________________   Date: ______________   License #: ______________', margin + 4, y + 17);

  y += 26;

  // Footer / Mandatory Disclaimer Box
  doc.setFillColor(254, 242, 242); // red-50
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, y, contentWidth, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27); // red-800
  doc.text('MANDATORY COMPLIANCE & RESEARCH DISCLAIMER:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  const disclaimerLines = doc.splitTextToSize(MANDATORY_DISCLAIMER, contentWidth - 8);
  doc.text(disclaimerLines, margin + 4, y + 9);

  const rxLines = doc.splitTextToSize(RX_SAFETY_WARNING, contentWidth - 8);
  doc.text(rxLines, margin + 4, y + 15);

  // Generate filename
  const cleanDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const outFilename = filename || `PulseCare_Triage_Assessment_${result.triage_level}_${cleanDate}.pdf`;

  // Trigger browser download
  doc.save(outFilename);
}
