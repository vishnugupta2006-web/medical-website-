import React, { useState } from 'react';
import {
  Activity,
  Mic,
  Thermometer,
  Heart,
  Wind,
  Smile,
  Zap,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { PatientVitals } from '../utils/triageMatrix.js';
import { CLINICAL_PRESETS, ClinicalPreset } from '../data/clinicalPresets.js';

interface TriageInputFormProps {
  symptoms: string;
  setSymptoms: (text: string) => void;
  vitals: PatientVitals;
  setVitals: React.Dispatch<React.SetStateAction<PatientVitals>>;
  onSubmitTriage: () => void;
  isAnalyzing: boolean;
  onSelectPreset: (preset: ClinicalPreset) => void;
  highContrast: boolean;
}

export const TriageInputForm: React.FC<TriageInputFormProps> = ({
  symptoms,
  setSymptoms,
  vitals,
  setVitals,
  onSubmitTriage,
  isAnalyzing,
  onSelectPreset,
  highContrast
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleSimulatedVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setSymptoms(
        'Patient reports acute wheezing, rapid facial swelling, hives on neck, and tightness in chest after consuming food at dinner.'
      );
      setVitals({
        temperatureF: 98.6,
        heartRateBpm: 138,
        oxygenSatPercent: 89,
        painScore: 8
      });
    }, 1500);
  };

  const QUICK_SYMPTOM_CHIPS = [
    { label: '🚨 Throat Swelling / Anaphylaxis', text: 'Sudden throat tightness, wheezing, swelling of lips and eyelids after eating peanuts 10 minutes ago. Dizziness and difficulty swallowing.', tier: 'RED' },
    { label: '🚨 Crushing Chest Pain', text: 'Severe pressure in chest radiating to left shoulder and jaw, shortness of breath, cold sweat.', tier: 'RED' },
    { label: '⚠️ 2nd-Degree Burn', text: 'Scalding hot cooking oil splattered on hand and wrist 30 mins ago. Painful fluid-filled blisters formed rapidly, intense burning sensation.', tier: 'YELLOW' },
    { label: '⚠️ Deep Forearm Laceration', text: 'Cut forearm on broken glass. Wound edges gap >0.5cm with visible subcutaneous fat. Throbbing pain.', tier: 'YELLOW' },
    { label: '🟢 Superficial Scrape', text: 'Tripped while jogging and scraped outer knee. Superficial bleeding stopped within 2 minutes. Mild stinging sensation.', tier: 'GREEN' },
    { label: '🟢 Contact Dermatitis', text: 'Mild itchy red patch on wrist where a new watch strap was worn for 2 days. No blisters or fever.', tier: 'GREEN' }
  ];

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Multimodal Patient Presentation Input
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
          Step 1: Clinical Data Capture
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Quick-Select Clinical Presentation Presets */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Quick Clinical Symptoms Test Presets:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SYMPTOM_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSymptoms(chip.text);
                  // Match corresponding preset vitals
                  const matched = CLINICAL_PRESETS.find(p => p.tier === chip.tier);
                  if (matched) {
                    onSelectPreset(matched);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-300 font-medium transition-all cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="symptoms-input" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>Reported Symptoms, Onset, &amp; Injury Description</span>
              <span className="text-rose-400">*</span>
            </label>

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleSimulatedVoiceInput}
              disabled={isRecording}
              aria-label="Voice input dictation"
              className={`text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Listening to speech...' : 'Simulate Voice Input'}</span>
            </button>
          </div>

          <textarea
            id="symptoms-input"
            rows={3}
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms in detail (e.g. onset, pain intensity, breathing status, bleeding, allergen exposure)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
          />
        </div>

        {/* Vitals Telemetry Inputs */}
        <div>
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            Patient Vitals Telemetry (Optional / Sensor Feed):
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Core Temperature */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label htmlFor="vital-temp" className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Body Temp (°F)</span>
              </label>
              <input
                id="vital-temp"
                type="number"
                step="0.1"
                value={vitals.temperatureF || ''}
                onChange={e => setVitals(prev => ({ ...prev, temperatureF: parseFloat(e.target.value) || undefined }))}
                placeholder="98.6"
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm"
              />
              {vitals.temperatureF && vitals.temperatureF >= 102.0 && (
                <span className="text-[10px] text-amber-400 font-bold block">⚠️ High Fever (&gt;102°F)</span>
              )}
            </div>

            {/* Heart Rate */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label htmlFor="vital-hr" className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Heart Rate (BPM)</span>
              </label>
              <input
                id="vital-hr"
                type="number"
                value={vitals.heartRateBpm || ''}
                onChange={e => setVitals(prev => ({ ...prev, heartRateBpm: parseInt(e.target.value, 10) || undefined }))}
                placeholder="75"
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm"
              />
              {vitals.heartRateBpm && (vitals.heartRateBpm > 140 || vitals.heartRateBpm < 45) && (
                <span className="text-[10px] text-rose-400 font-bold block">🚨 Tachycardia/Brady</span>
              )}
            </div>

            {/* SpO2 Saturation */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label htmlFor="vital-spo2" className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>Oxygen Sat (SpO2 %)</span>
              </label>
              <input
                id="vital-spo2"
                type="number"
                value={vitals.oxygenSatPercent || ''}
                onChange={e => setVitals(prev => ({ ...prev, oxygenSatPercent: parseInt(e.target.value, 10) || undefined }))}
                placeholder="98"
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm"
              />
              {vitals.oxygenSatPercent && vitals.oxygenSatPercent < 90 && (
                <span className="text-[10px] text-rose-400 font-bold block">🚨 Severe Hypoxia (&lt;90%)</span>
              )}
            </div>

            {/* Pain Scale (1-10) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <label htmlFor="vital-pain" className="text-slate-400 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pain Score (1-10)</span>
                </span>
                <span className="font-mono text-purple-300 font-bold">{vitals.painScore || 1}/10</span>
              </label>
              <input
                id="vital-pain"
                type="range"
                min="1"
                max="10"
                value={vitals.painScore || 1}
                onChange={e => setVitals(prev => ({ ...prev, painScore: parseInt(e.target.value, 10) }))}
                className="w-full accent-purple-500 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Multimodal input: Text symptoms + Vitals telemetry + Optical lesion scan.
          </p>

          <button
            type="button"
            onClick={onSubmitTriage}
            disabled={isAnalyzing}
            aria-label="Execute PulseCare multimodal triage assessment"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-cyan-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Gemini Multimodal Matrix...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200 fill-cyan-200" />
                <span>Calculate Emergency Severity &amp; Protocols</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
