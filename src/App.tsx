/**
 * PulseCare AI Engine - Main Application Entry
 * Multimodal Medical Triage & Autonomous Healthcare Navigation Platform
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header.js';
import { ImageScannerModule } from './components/ImageScannerModule.js';
import { TriageInputForm } from './components/TriageInputForm.js';
import { TriageResultView } from './components/TriageResultView.js';
import { WebRTCSimulatorModal } from './components/WebRTCSimulatorModal.js';
import { SpatialLocatorView } from './components/SpatialLocatorView.js';
import { WireframeArchitectView } from './components/WireframeArchitectView.js';
import { FooterDisclaimer } from './components/FooterDisclaimer.js';
import { TriageSessionHistory } from './components/TriageSessionHistory.js';
import { CLINICAL_PRESETS, ClinicalPreset } from './data/clinicalPresets.js';
import {
  evaluateTriageMatrix,
  TriageResult,
  PatientVitals
} from './utils/triageMatrix.js';
import {
  addTriageRecordToHistory,
  TriageHistoryRecord
} from './utils/triageHistory.js';
import { PhoneCall, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Initial preset
  const [currentPreset, setCurrentPreset] = useState<ClinicalPreset>(CLINICAL_PRESETS[0]);
  const [customUploadedImage, setCustomUploadedImage] = useState<string | null>(null);

  // Symptoms and Vitals
  const [symptoms, setSymptoms] = useState<string>(CLINICAL_PRESETS[0].symptoms);
  const [vitals, setVitals] = useState<PatientVitals>(CLINICAL_PRESETS[0].vitals);

  // Scanner & Analysis state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Triage Results State
  const initialResult = evaluateTriageMatrix(CLINICAL_PRESETS[0].symptoms, CLINICAL_PRESETS[0].vitals);
  const [triageResult, setTriageResult] = useState<TriageResult>(initialResult);

  // Local Session History State (Previous 5 Triage Assessments)
  const [sessionHistory, setSessionHistory] = useState<TriageHistoryRecord[]>(() =>
    addTriageRecordToHistory([], {
      result: initialResult,
      symptoms: CLINICAL_PRESETS[0].symptoms,
      vitals: CLINICAL_PRESETS[0].vitals,
      presetTitle: CLINICAL_PRESETS[0].title
    })
  );

  // WebRTC Simulator Modal State
  const [isWebRTCModalOpen, setIsWebRTCModalOpen] = useState<boolean>(false);
  const [webRTCRole, setWebRTCRole] = useState<'doctor' | 'pharmacist'>('doctor');

  // Emergency Call Speed-Dial Modal State
  const [isEmergencyDialOpen, setIsEmergencyDialOpen] = useState<boolean>(false);

  const handleSelectPreset = (preset: ClinicalPreset) => {
    setCurrentPreset(preset);
    setSymptoms(preset.symptoms);
    setVitals(preset.vitals);
    setCustomUploadedImage(null);

    // Calculate immediate baseline triage
    const immediate = evaluateTriageMatrix(preset.symptoms, preset.vitals);
    setTriageResult(immediate);

    // Append to local session history (capped at 5)
    setSessionHistory(prev =>
      addTriageRecordToHistory(prev, {
        result: immediate,
        symptoms: preset.symptoms,
        vitals: preset.vitals,
        presetTitle: preset.title
      })
    );
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      // Re-run evaluation with optical features
      const updated = evaluateTriageMatrix(symptoms, vitals);
      setTriageResult(updated);

      setSessionHistory(prev =>
        addTriageRecordToHistory(prev, {
          result: updated,
          symptoms,
          vitals,
          presetTitle: `${currentPreset.title} (Optical Scan)`
        })
      );
    }, 1800);
  };

  const handleSubmitTriage = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          vitals,
          imageBase64: customUploadedImage || undefined
        })
      });

      let finalResult: TriageResult;
      if (response.ok) {
        finalResult = await response.json();
      } else {
        // Fallback to local rule engine
        finalResult = evaluateTriageMatrix(symptoms, vitals);
      }
      setTriageResult(finalResult);

      setSessionHistory(prev =>
        addTriageRecordToHistory(prev, {
          result: finalResult,
          symptoms,
          vitals,
          presetTitle: currentPreset.title
        })
      );
    } catch (err) {
      console.warn('API call error, falling back to local matrix:', err);
      const fallback = evaluateTriageMatrix(symptoms, vitals);
      setTriageResult(fallback);

      setSessionHistory(prev =>
        addTriageRecordToHistory(prev, {
          result: fallback,
          symptoms,
          vitals,
          presetTitle: currentPreset.title
        })
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestoreAssessment = (record: TriageHistoryRecord) => {
    setSymptoms(record.symptomsSummary);
    setVitals(record.vitals);
    setTriageResult(record.result);

    const matched = CLINICAL_PRESETS.find(p => p.title.toLowerCase().includes(record.presetTitle.toLowerCase().split(' ')[0]));
    if (matched) {
      setCurrentPreset(matched);
    }

    // Scroll smoothly to dashboard triage result
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setSessionHistory([]);
  };

  const handleScrollToHistory = () => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
    setTimeout(() => {
      const element = document.getElementById('session-history-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const isEmergencyActive = triageResult.triage_level === 'RED';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onEmergencyCall={() => setIsEmergencyDialOpen(true)}
        isEmergencyActive={isEmergencyActive}
        historyCount={sessionHistory.length}
        onScrollToHistory={handleScrollToHistory}
      />

      {/* Main Container */}
      <main id="triage-main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* TAB 1: Clinical Triage Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Top Introductory Banner */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-300 font-bold uppercase tracking-wider">
                    PulseCare Core
                  </span>
                  <span className="text-xs text-slate-400">
                    Triaging with 3-Tier Emergency Matrix &amp; Optical Computer Vision
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Multimodal Emergency Triage &amp; Clinical Guidance
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Enter patient symptoms, review sensor vitals, and scan lesions to compute emergency severity scores, trigger WebRTC tele-health consultations, and identify nearby 24/7 pharmacies.
                </p>
              </div>

              {/* Quick action badges */}
              <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                <button
                  onClick={handleScrollToHistory}
                  className="px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Session History ({sessionHistory.length}/5)</span>
                </button>
                <button
                  onClick={() => setActiveTab('wireframes')}
                  className="px-3 py-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-700/80 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>View UX Wireframes</span>
                </button>
              </div>
            </div>

            {/* Split Grid: Multimodal Symptom Inputs (Left) & Computer Vision Scanner (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-6">
                <TriageInputForm
                  symptoms={symptoms}
                  setSymptoms={setSymptoms}
                  vitals={vitals}
                  setVitals={setVitals}
                  onSubmitTriage={handleSubmitTriage}
                  isAnalyzing={isAnalyzing}
                  onSelectPreset={handleSelectPreset}
                  highContrast={highContrast}
                />
              </div>

              <div className="lg:col-span-6 space-y-6">
                <ImageScannerModule
                  currentPreset={currentPreset}
                  onSelectPreset={handleSelectPreset}
                  isScanning={isScanning}
                  onTriggerScan={handleTriggerScan}
                  scanComplete={scanComplete}
                  highContrast={highContrast}
                  customUploadedImage={customUploadedImage}
                  onCustomImageUpload={base64 => {
                    setCustomUploadedImage(base64);
                    handleTriggerScan();
                  }}
                />
              </div>
            </div>

            {/* Triage Matrix Output (User-Facing UI View & API JSON Payload) */}
            <TriageResultView
              result={triageResult}
              vitals={vitals}
              symptoms={symptoms}
              onOpenDoctorVideo={() => {
                setWebRTCRole('doctor');
                setIsWebRTCModalOpen(true);
              }}
              onOpenPharmacyVideo={() => {
                setWebRTCRole('pharmacist');
                setIsWebRTCModalOpen(true);
              }}
              onOpenSpatialLocator={() => setActiveTab('spatial')}
              onEmergencyCall={() => setIsEmergencyDialOpen(true)}
              highContrast={highContrast}
            />

            {/* Local State Session History Component (Previous 5 Triage Assessments) */}
            <div id="session-history-section">
              <TriageSessionHistory
                history={sessionHistory}
                onRestoreAssessment={handleRestoreAssessment}
                onClearHistory={handleClearHistory}
                highContrast={highContrast}
              />
            </div>
          </div>
        )}

        {/* TAB 2: Website Wireframes & Architecture */}
        {activeTab === 'wireframes' && (
          <WireframeArchitectView highContrast={highContrast} />
        )}

        {/* TAB 3: Spatial Facilities & 24/7 Pharmacy Locator */}
        {activeTab === 'spatial' && (
          <SpatialLocatorView highContrast={highContrast} />
        )}

        {/* TAB 4: WebRTC Tele-Health Room direct */}
        {activeTab === 'telehealth' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">WebRTC Tele-Health Consultation Center</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Launch an encrypted peer-to-peer consultation with an emergency doctor or licensed tele-pharmacist.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setWebRTCRole('doctor');
                    setIsWebRTCModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-950"
                >
                  <span>Connect Doctor (MD)</span>
                </button>
                <button
                  onClick={() => {
                    setWebRTCRole('pharmacist');
                    setIsWebRTCModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950"
                >
                  <span>Connect Pharmacist (PharmD)</span>
                </button>
              </div>
            </div>

            <TriageResultView
              result={triageResult}
              vitals={vitals}
              symptoms={symptoms}
              onOpenDoctorVideo={() => {
                setWebRTCRole('doctor');
                setIsWebRTCModalOpen(true);
              }}
              onOpenPharmacyVideo={() => {
                setWebRTCRole('pharmacist');
                setIsWebRTCModalOpen(true);
              }}
              onOpenSpatialLocator={() => setActiveTab('spatial')}
              onEmergencyCall={() => setIsEmergencyDialOpen(true)}
              highContrast={highContrast}
            />
          </div>
        )}
      </main>

      {/* Mandatory University Research Project Disclaimer */}
      <FooterDisclaimer highContrast={highContrast} />

      {/* WebRTC Video Consultation Simulator Modal */}
      <WebRTCSimulatorModal
        isOpen={isWebRTCModalOpen}
        onClose={() => setIsWebRTCModalOpen(false)}
        role={webRTCRole}
        triageResult={triageResult}
        highContrast={highContrast}
      />

      {/* Emergency Dial 911 / 112 Speed-Dial Modal */}
      {isEmergencyDialOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border-2 border-red-500 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <h3 id="emergency-dialog-title" className="text-base font-bold text-white">
                  Emergency Speed-Dial &amp; EMS Dispatch
                </h3>
              </div>
              <button
                onClick={() => setIsEmergencyDialOpen(false)}
                aria-label="Close emergency speed dial"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              If you or the patient are experiencing chest pain, anaphylaxis, severe trauma, or acute breathing distress, contact local emergency services immediately:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <a
                href="tel:911"
                className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-center flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-950"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm">911</span>
                <span className="text-[9px] text-red-200">US / Canada</span>
              </a>

              <a
                href="tel:112"
                className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-center flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-950"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm">112</span>
                <span className="text-[9px] text-red-200">Europe / Intl</span>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-center flex flex-col items-center justify-center gap-1 shadow-lg shadow-red-950"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm">108</span>
                <span className="text-[9px] text-red-200">Emergency EMS</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-200 block">PulseCare Triage Handshake Info:</span>
              <div>Current Level: <strong className="text-red-400">{triageResult.triage_level}</strong></div>
              <div>Urgency Score: <strong className="text-white">{triageResult.urgency_score}/10</strong></div>
              <div>Symptoms: {triageResult.primary_symptoms.join(', ')}</div>
            </div>

            <button
              onClick={() => setIsEmergencyDialOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Cancel / Return to Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
