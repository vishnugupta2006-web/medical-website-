import type { TriageResult, PatientVitals } from './triageMatrix.ts';

export type SeverityTrajectory = 'IMPROVED' | 'STABLE' | 'DETERIORATED' | 'BASELINE';

export interface TriageHistoryRecord {
  id: string;
  timestamp: string; // ISO
  timeFormatted: string;
  symptomsSummary: string;
  presetTitle: string;
  vitals: PatientVitals;
  result: TriageResult;
  trajectoryVsPrevious: SeverityTrajectory;
  urgencyScoreDelta: number; // vs preceding assessment in history
}

export interface SBARHandoverReport {
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  patientTrajectory: SeverityTrajectory;
  totalAssessmentsInSession: number;
  highestUrgencyScore: number;
}

export const MAX_HISTORY_CAPACITY = 5;

/**
 * Calculates trajectory comparison between a previous assessment and a newer one.
 */
export function calculateTrajectory(
  prevResult: TriageResult | null,
  newResult: TriageResult
): { trajectory: SeverityTrajectory; delta: number } {
  if (!prevResult) {
    return { trajectory: 'BASELINE', delta: 0 };
  }

  const delta = newResult.urgency_score - prevResult.urgency_score;

  // Level ranks: GREEN = 1, YELLOW = 2, RED = 3
  const rank = (lvl: string) => (lvl === 'RED' ? 3 : lvl === 'YELLOW' ? 2 : 1);
  const prevRank = rank(prevResult.triage_level);
  const newRank = rank(newResult.triage_level);

  if (newRank > prevRank || delta >= 2) {
    return { trajectory: 'DETERIORATED', delta };
  } else if (newRank < prevRank || delta <= -2) {
    return { trajectory: 'IMPROVED', delta };
  } else if (delta !== 0) {
    return delta > 0 ? { trajectory: 'DETERIORATED', delta } : { trajectory: 'IMPROVED', delta };
  } else {
    return { trajectory: 'STABLE', delta: 0 };
  }
}

/**
 * Adds an assessment to the history, enforcing maximum 5 items capacity (newest first).
 */
export function addTriageRecordToHistory(
  existingHistory: TriageHistoryRecord[],
  entry: {
    result: TriageResult;
    symptoms: string;
    vitals: PatientVitals;
    presetTitle?: string;
  }
): TriageHistoryRecord[] {
  const previousLatest = existingHistory.length > 0 ? existingHistory[0].result : null;
  const { trajectory, delta } = calculateTrajectory(previousLatest, entry.result);

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const record: TriageHistoryRecord = {
    id: `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toISOString(),
    timeFormatted,
    symptomsSummary: entry.symptoms.length > 120 ? entry.symptoms.substring(0, 117) + '...' : entry.symptoms,
    presetTitle: entry.presetTitle || 'Custom Patient Presentation',
    vitals: { ...entry.vitals },
    result: entry.result,
    trajectoryVsPrevious: trajectory,
    urgencyScoreDelta: delta
  };

  // Prepend newest entry, keep only top 5
  return [record, ...existingHistory].slice(0, MAX_HISTORY_CAPACITY);
}

/**
 * Generates an SBAR (Situation, Background, Assessment, Recommendation) clinical handover report.
 */
export function generateSBARReport(history: TriageHistoryRecord[]): SBARHandoverReport {
  if (history.length === 0) {
    return {
      situation: 'No patient assessments recorded in current session.',
      background: 'Session initialized without clinical entries.',
      assessment: 'Pending triage.',
      recommendation: 'Perform initial multimodal triage intake.',
      patientTrajectory: 'BASELINE',
      totalAssessmentsInSession: 0,
      highestUrgencyScore: 0
    };
  }

  const latest = history[0];
  const earliest = history[history.length - 1];
  const highestScore = Math.max(...history.map(h => h.result.urgency_score));

  const trajectory = latest.trajectoryVsPrevious;

  const situation = `Patient presented with ${latest.result.primary_symptoms.join(', ')}. Currently triaged as ${latest.result.triage_level} PRIORITY (${latest.result.category_label}) with Urgency Score ${latest.result.urgency_score}/10.`;

  const background = `Patient has completed ${history.length} assessment(s) during this monitoring session starting at ${earliest.timeFormatted}. Initial presentation was "${earliest.presetTitle}". Current vitals: Temp ${latest.vitals.temperatureF ?? 'N/A'}°F, HR ${latest.vitals.heartRateBpm ?? 'N/A'} bpm, SpO2 ${latest.vitals.oxygenSatPercent ?? 'N/A'}%, Pain ${latest.vitals.painScore ?? 'N/A'}/10.`;

  const assessment = `Clinical trajectory is ${trajectory}. Image analysis observed: ${latest.result.image_analysis.detected_features.join(', ') || 'No focal cutaneous lesions'}. Preliminary computer vision confidence: ${latest.result.image_analysis.confidence_rating}. ${latest.result.clinical_summary}`;

  const recommendation = latest.result.triage_level === 'RED'
    ? 'CRITICAL EMERGENCY: Immediate EMS ambulance dispatch (911/112) to Level-1 Trauma or Acute Resuscitation Center. Continue continuous airway monitoring and CPR/EpiPen readiness.'
    : latest.result.triage_level === 'YELLOW'
    ? 'URGENT EVALUATION: Urgent care or emergency room evaluation within 1 to 4 hours. Connect with Attending Physician via WebRTC video bridge.'
    : 'HOME SELF-CARE & TELE-PHARMACY: Pharmacist-guided OTC wound cleansing and sterile dressings. Connect to Tele-Pharmacy for courier care-pack dispatch.';

  return {
    situation,
    background,
    assessment,
    recommendation,
    patientTrajectory: trajectory,
    totalAssessmentsInSession: history.length,
    highestUrgencyScore: highestScore
  };
}
