import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Video,
  PhoneCall,
  Clock,
  Copy,
  Check,
  Code2,
  Compass,
  HeartPulse,
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { TriageResult, PatientVitals, MANDATORY_DISCLAIMER, RX_SAFETY_WARNING } from '../utils/triageMatrix.js';
import { generateTriagePDF } from '../utils/pdfReportGenerator.js';
import { FileDown, Printer } from 'lucide-react';

interface TriageResultViewProps {
  result: TriageResult;
  vitals?: PatientVitals;
  symptoms?: string;
  onOpenDoctorVideo: () => void;
  onOpenPharmacyVideo: () => void;
  onOpenSpatialLocator: () => void;
  onEmergencyCall: () => void;
  highContrast: boolean;
}

export const TriageResultView: React.FC<TriageResultViewProps> = ({
  result,
  vitals,
  symptoms,
  onOpenDoctorVideo,
  onOpenPharmacyVideo,
  onOpenSpatialLocator,
  onEmergencyCall,
  highContrast
}) => {
  const [activeTab, setActiveTab] = useState<'user_view' | 'json_payload'>('user_view');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<boolean>(false);

  const handleDownloadPDF = () => {
    setIsGeneratingPdf(true);
    try {
      generateTriagePDF(result, vitals || {}, symptoms || '');
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // First-aid interactive timer state (e.g. for burn cooling 15 min, pressure 10 min, or CPR metronome)
  const isCprNeeded = result.primary_symptoms.some(s => s.toLowerCase().includes('chest') || s.toLowerCase().includes('cardiac') || s.toLowerCase().includes('unresponsive'));
  const isBleeding = result.primary_symptoms.some(s => s.toLowerCase().includes('bleed') || s.toLowerCase().includes('laceration'));
  const isBurn = result.primary_symptoms.some(s => s.toLowerCase().includes('burn'));

  const [timerSeconds, setTimerSeconds] = useState<number>(isBurn ? 900 : isBleeding ? 600 : 120);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSeconds]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Build the clean API JSON payload matching the user specification exactly
  const cleanApiPayload = {
    triage_level: result.triage_level,
    urgency_score: result.urgency_score,
    primary_symptoms: result.primary_symptoms,
    image_analysis: {
      detected_features: result.image_analysis.detected_features,
      confidence_rating: result.image_analysis.confidence_rating
    },
    webrtc_actions: {
      doctor_video_required: result.webrtc_actions.doctor_video_required,
      pharmacy_video_required: result.webrtc_actions.pharmacy_video_required
    },
    first_aid_steps: result.first_aid_steps
  };

  const jsonString = JSON.stringify(cleanApiPayload, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Severity styles
  const isRed = result.triage_level === 'RED';
  const isYellow = result.triage_level === 'YELLOW';
  const isGreen = result.triage_level === 'GREEN';

  const bannerTheme = isRed
    ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
    : isYellow
    ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
    : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200';

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* View Switcher Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Clinical Triage Assessment Matrix
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download Summary PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            aria-label="Download Summary as PDF report for doctor"
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-all cursor-pointer disabled:opacity-50"
            title="Download PDF report to keep or share with physician"
          >
            {pdfDownloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>✓ PDF Downloaded</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>Download Summary (PDF)</span>
              </>
            )}
          </button>

          <div className="flex items-center rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('user_view')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'user_view'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>[USER-FACING DISPLAY]</span>
            </button>
            <button
              onClick={() => setActiveTab('json_payload')}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'json_payload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>[API JSON PAYLOAD]</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'user_view' ? (
        <div className="p-5 sm:p-7 space-y-6">
          {/* Triage Status Banner */}
          <div className={`p-5 rounded-2xl border-2 shadow-lg ${bannerTheme} relative overflow-hidden`}>
            {/* Background ambient pulse for Red */}
            {isRed && (
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-rose-600/20 blur-3xl pointer-events-none animate-pulse" />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isRed ? 'bg-rose-600 text-white animate-bounce' : isYellow ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isRed ? (
                    <ShieldAlert className="w-8 h-8" />
                  ) : isYellow ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <CheckCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                        isRed
                          ? 'bg-rose-500 text-white'
                          : isYellow
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {result.triage_level} PRIORITY
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {result.category_label}
                    </h3>
                  </div>

                  <p className="text-sm mt-1 text-slate-200 leading-relaxed font-sans">
                    {result.urgency_description}
                  </p>
                </div>
              </div>

              {/* Urgency Score Gauge */}
              <div className="flex md:flex-col items-center justify-between md:justify-center bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  Urgency Score
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-3xl font-black ${
                      isRed ? 'text-rose-400' : isYellow ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {result.urgency_score}
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Primary Detected Symptoms
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.primary_symptoms.map((sym, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700 font-medium"
                  >
                    {sym}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {result.clinical_summary}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Computer Vision Preliminary Observations
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.image_analysis.detected_features.length > 0 ? (
                  result.image_analysis.detected_features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-medium"
                    >
                      {feat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No gross focal lesions detected.</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {result.image_analysis.preliminary_notes}
              </p>
            </div>
          </div>

          {/* First-Aid Instructions & Interactive Protocol Timer */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Immediate Action & First-Aid Protocols</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Follow these step-by-step procedures immediately while awaiting medical care.
                </p>
              </div>

              {/* Protocol Timer for First-aid execution */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    Protocol Timer
                  </span>
                  <span className="text-base font-mono font-bold text-cyan-300">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  aria-label={timerActive ? 'Pause timer' : 'Start first-aid timer'}
                  className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer"
                >
                  {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(isBurn ? 900 : isBleeding ? 600 : 120);
                  }}
                  aria-label="Reset first-aid timer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Steps List */}
            <ol className="space-y-2.5">
              {result.first_aid_steps.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800/60 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Recommended Actions: Interactive Tele-Health & Spatial Triggers */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Automated Downstream Web Service Triggers
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Doctor Video Call Trigger for Tier 1 & 2 */}
              {result.webrtc_actions.doctor_video_required ? (
                <button
                  onClick={onOpenDoctorVideo}
                  aria-label="Connect to Doctor Video Call"
                  className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>[ Video Call Doctor ]</span>
                </button>
              ) : (
                <button
                  disabled
                  className="p-3.5 rounded-xl bg-slate-800/40 text-slate-500 font-medium text-xs flex items-center justify-center gap-2 border border-slate-800 cursor-not-allowed"
                >
                  <Video className="w-4 h-4" />
                  <span>Doctor Call Not Required</span>
                </button>
              )}

              {/* Tele-Pharmacy Video Consult for Tier 3 */}
              {result.webrtc_actions.pharmacy_video_required ? (
                <button
                  onClick={onOpenPharmacyVideo}
                  aria-label="Start Tele-Pharmacy Video Consult"
                  className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>[ Tele-Pharmacy Video Consult ]</span>
                </button>
              ) : (
                <button
                  onClick={onOpenPharmacyVideo}
                  aria-label="Optional Tele-Pharmacy Video Consult"
                  className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Tele-Pharmacy Consult</span>
                </button>
              )}

              {/* Spatial Locator Trigger */}
              <button
                onClick={onOpenSpatialLocator}
                aria-label="Locate nearest verified pharmacies and hospitals"
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>[ Spatial Facility Locator ]</span>
              </button>

              {/* Download Clinical Summary PDF Action Card */}
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                aria-label="Download Assessment Summary Report as PDF"
                className="p-3.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-cyan-950 hover:to-slate-900 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 border border-cyan-800/80 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>{pdfDownloaded ? '✓ PDF Saved' : '[ Download Summary PDF ]'}</span>
              </button>
            </div>
          </div>

          {/* Mandatory Compliance Disclaimer Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <p className="text-xs text-amber-300/90 font-medium">
              {result.safety_disclaimer}
            </p>
            <p className="text-[11px] text-slate-400">
              {result.prescription_safety_warning}
            </p>
          </div>
        </div>
      ) : (
        /* API JSON PAYLOAD TAB */
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span>Structured API JSON Payload</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Application/JSON
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Frontend state management payload ready for store dispatch or backend microservice bus.
              </p>
            </div>

            <button
              onClick={handleCopyJson}
              aria-label="Copy JSON state payload to clipboard"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200">
            <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-cyan-300">
              {jsonString}
            </pre>
          </div>

          {/* State Binding Schema Reference Guide */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
              Integration State Mapping
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
              <li>
                <code className="text-cyan-300">state.triage_level</code>: Drives top-level theme, header alarm audio, and emergency banners.
              </li>
              <li>
                <code className="text-cyan-300">state.urgency_score</code>: Visual gauge (1-10) for clinical priority queues.
              </li>
              <li>
                <code className="text-cyan-300">state.webrtc_actions</code>: Automatically mounts peer call handshakes for Doctor or Pharmacist.
              </li>
              <li>
                <code className="text-cyan-300">state.image_analysis</code>: Overlays computer vision coordinate tags onto the lesion HUD canvas.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
