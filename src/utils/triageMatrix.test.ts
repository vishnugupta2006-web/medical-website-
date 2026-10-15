import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateTriageMatrix,
  MANDATORY_DISCLAIMER,
  RX_SAFETY_WARNING
} from './triageMatrix.ts';

test('Tier 1: Chest pain triggers Critical Emergency (RED) with high urgency score', () => {
  const result = evaluateTriageMatrix('Patient experiencing crushing chest pain, difficulty breathing, and cold sweats');
  assert.equal(result.triage_level, 'RED');
  assert.ok(result.urgency_score >= 8, 'Urgency score must be >= 8 for Tier 1');
  assert.equal(result.webrtc_actions.doctor_video_required, true);
  assert.equal(result.webrtc_actions.pharmacy_video_required, false);
  assert.ok(result.safety_disclaimer.includes('university research project tool'));
  assert.ok(result.first_aid_steps.some(step => step.toLowerCase().includes('emergency services') || step.includes('911')));
});

test('Tier 1: Anaphylaxis and severe hypoxia triggers RED with CPR/EpiPen instructions', () => {
  const result = evaluateTriageMatrix('Severe anaphylaxis, throat swelling after bee sting', {
    oxygenSatPercent: 88,
    heartRateBpm: 150
  });
  assert.equal(result.triage_level, 'RED');
  assert.ok(result.urgency_score >= 9);
  assert.ok(result.first_aid_steps.some(step => step.toLowerCase().includes('epinephrine') || step.includes('EpiPen')));
});

test('Tier 2: High fever (>102F) and moderate burn triggers URGENT / MODERATE CARE (YELLOW)', () => {
  const result = evaluateTriageMatrix('Second degree burn with painful blistering on forearm, feeling hot', {
    temperatureF: 102.5,
    painScore: 7
  });
  assert.equal(result.triage_level, 'YELLOW');
  assert.ok(result.urgency_score >= 4 && result.urgency_score <= 7);
  assert.equal(result.webrtc_actions.doctor_video_required, true);
  assert.equal(result.webrtc_actions.pharmacy_video_required, false);
  assert.ok(result.first_aid_steps.some(step => step.toLowerCase().includes('cool') || step.toLowerCase().includes('water')));
});

test('Tier 3: Superficial abrasion triggers NON-EMERGENCY / SELF-CARE (GREEN) with Tele-Pharmacy', () => {
  const result = evaluateTriageMatrix('Superficial scrape on the knee from cycling on pavement, mild scratch');
  assert.equal(result.triage_level, 'GREEN');
  assert.ok(result.urgency_score <= 3);
  assert.equal(result.webrtc_actions.doctor_video_required, false);
  assert.equal(result.webrtc_actions.pharmacy_video_required, true);
  assert.ok(result.first_aid_steps.some(step => step.toLowerCase().includes('cleanse') || step.toLowerCase().includes('soap')));
});

test('Compliance: Enforces mandatory disclaimer and prescription safety guardrail', () => {
  const result = evaluateTriageMatrix('Minor headache');
  assert.equal(result.safety_disclaimer, MANDATORY_DISCLAIMER);
  assert.equal(result.prescription_safety_warning, RX_SAFETY_WARNING);
  assert.ok(result.image_analysis.preliminary_notes.includes('preliminary observational markers'));
});
