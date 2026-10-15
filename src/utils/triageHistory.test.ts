import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTriageMatrix } from './triageMatrix.ts';
import {
  addTriageRecordToHistory,
  calculateTrajectory,
  generateSBARReport,
  MAX_HISTORY_CAPACITY
} from './triageHistory.ts';
import type { TriageHistoryRecord } from './triageHistory.ts';

test('History Capacity: Caps history strictly at max 5 previous assessments', () => {
  let history: TriageHistoryRecord[] = [];

  // Add 7 sequential entries
  for (let i = 1; i <= 7; i++) {
    const mockResult = evaluateTriageMatrix(`Assessment ${i} description`);
    history = addTriageRecordToHistory(history, {
      result: mockResult,
      symptoms: `Patient entry ${i}`,
      vitals: { heartRateBpm: 70 + i },
      presetTitle: `Preset ${i}`
    });
  }

  assert.equal(history.length, MAX_HISTORY_CAPACITY, 'History must not exceed 5 entries');
  assert.equal(history[0].presetTitle, 'Preset 7', 'Latest record must be at index 0');
  assert.equal(history[4].presetTitle, 'Preset 3', 'Oldest record in 5-item buffer must be Preset 3');
});

test('Trajectory Tracking: Correctly identifies Deterioration, Improvement, and Stability', () => {
  const greenResult = evaluateTriageMatrix('Superficial scratch on finger');
  const yellowResult = evaluateTriageMatrix('2nd degree burn with blisters and high fever', { temperatureF: 102.5 });
  const redResult = evaluateTriageMatrix('Crushing chest pain and difficulty breathing', { oxygenSatPercent: 88 });

  // Baseline
  const baselineCheck = calculateTrajectory(null, greenResult);
  assert.equal(baselineCheck.trajectory, 'BASELINE');

  // Green to Red -> Deteriorated
  const detCheck = calculateTrajectory(greenResult, redResult);
  assert.equal(detCheck.trajectory, 'DETERIORATED');
  assert.ok(detCheck.delta > 0);

  // Red to Yellow -> Improved
  const impCheck = calculateTrajectory(redResult, yellowResult);
  assert.equal(impCheck.trajectory, 'IMPROVED');
  assert.ok(impCheck.delta < 0);

  // Yellow to Yellow -> Stable
  const stableCheck = calculateTrajectory(yellowResult, yellowResult);
  assert.equal(stableCheck.trajectory, 'STABLE');
  assert.equal(stableCheck.delta, 0);
});

test('SBAR Report: Generates standardized clinical handover document from history', () => {
  const redResult = evaluateTriageMatrix('Acute anaphylaxis and throat swelling');
  const history = addTriageRecordToHistory([], {
    result: redResult,
    symptoms: 'Throat swelling after peanuts',
    vitals: { oxygenSatPercent: 88, heartRateBpm: 145 },
    presetTitle: 'Severe Anaphylaxis'
  });

  const sbar = generateSBARReport(history);
  assert.ok(sbar.situation.includes('RED PRIORITY'));
  assert.ok(sbar.background.includes('Current vitals'));
  assert.ok(sbar.assessment.includes('Clinical trajectory is BASELINE'));
  assert.ok(sbar.recommendation.includes('Immediate EMS ambulance dispatch'));
  assert.equal(sbar.totalAssessmentsInSession, 1);
});
