import test from 'node:test';
import assert from 'node:assert/strict';
import { jsPDF } from 'jspdf';
import { evaluateTriageMatrix } from './triageMatrix.ts';

test('jsPDF instance initializes with A4 portrait configuration', () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  assert.equal(Math.round(doc.internal.pageSize.getWidth()), 210);
  assert.equal(Math.round(doc.internal.pageSize.getHeight()), 297);

  // Add text and verify document output buffer
  doc.text('PULSECARE AI ENGINE TRIAGE REPORT', 14, 20);
  const pdfOutput = doc.output();
  assert.ok(pdfOutput.length > 0, 'PDF buffer must contain binary/text output');
  assert.ok(pdfOutput.startsWith('%PDF-'), 'Output must have valid PDF header');
});

test('Clinical Triage Assessment Data generates complete PDF string without error', () => {
  const result = evaluateTriageMatrix('Patient experiencing severe anaphylaxis and acute throat edema', {
    temperatureF: 98.6,
    heartRateBpm: 140,
    oxygenSatPercent: 89,
    painScore: 8
  });

  const doc = new jsPDF();
  doc.text(`Triage Level: ${result.triage_level}`, 10, 10);
  doc.text(`Urgency Score: ${result.urgency_score}`, 10, 20);
  doc.text(`Category: ${result.category_label}`, 10, 30);
  doc.text(result.safety_disclaimer, 10, 40);

  const raw = doc.output();
  assert.ok(raw.length > 500, 'PDF output must contain generated triage content');
});
