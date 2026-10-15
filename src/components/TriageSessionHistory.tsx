import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
  FileText,
  Trash2,
  CheckCircle2,
  Clock,
  HeartPulse,
  Printer,
  Copy,
  Check,
  X,
  Share2
} from 'lucide-react';
import { TriageHistoryRecord, MAX_HISTORY_CAPACITY, generateSBARReport } from '../utils/triageHistory.js';
import { TriageResult, PatientVitals } from '../utils/triageMatrix.js';

interface TriageSessionHistoryProps {
  history: TriageHistoryRecord[];
  onRestoreAssessment: (record: TriageHistoryRecord) => void;
  onClearHistory: () => void;
  highContrast: boolean;
}

export const TriageSessionHistory: React.FC<TriageSessionHistoryProps> = ({
  history,
  onRestoreAssessment,
  onClearHistory,
  highContrast
}) => {
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<TriageHistoryRecord | null>(null);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState<boolean>(false);
  const [sbarCopied, setSbarCopied] = useState<boolean>(false);

  const sbarReport = generateSBARReport(history);

  const handleCopySBAR = () => {
    const text = `
=== PULSECARE AI CLINICAL HANDOVER REPORT (SBAR) ===
Date/Time: ${new Date().toLocaleString()}
Trajectory: ${sbarReport.patientTrajectory}
Highest Urgency Score: ${sbarReport.highestUrgencyScore}/10

[SITUATION]
${sbarReport.situation}

[BACKGROUND]
${sbarReport.background}

[ASSESSMENT]
${sbarReport.assessment}

[RECOMMENDATION]
${sbarReport.recommendation}

Disclaimer: PulseCare AI is a university research project tool designed for preliminary triage support only. It does not replace professional medical diagnosis, advice, or treatment.
    `.trim();

    navigator.clipboard.writeText(text);
    setSbarCopied(true);
    setTimeout(() => setSbarCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Session Triage History &amp; Trajectory Monitor
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {history.length} / {MAX_HISTORY_CAPACITY} Slots
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rolling buffer of previous 5 triage evaluations for quick recall, comparison, and clinical handover.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={() => setIsSbarModalOpen(true)}
                aria-label="Generate SBAR clinical handover report"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>SBAR Handover Report</span>
              </button>

              <button
                onClick={onClearHistory}
                aria-label="Clear session history"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700/80 transition-colors cursor-pointer"
                title="Clear local session history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Items Grid */}
      <div className="p-4 sm:p-5">
        {history.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No triage evaluations recorded in this session yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Select any clinical symptom preset or click "Calculate Emergency Severity" to start tracking clinical trajectory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((item, index) => {
              const isRed = item.result.triage_level === 'RED';
              const isYellow = item.result.triage_level === 'YELLOW';
              const isGreen = item.result.triage_level === 'GREEN';

              const tierBadgeBg = isRed
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : isYellow
                ? 'bg-amber-950 text-amber-300 border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    index === 0
                      ? 'bg-slate-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar: Timestamp + Slot Number + Trajectory */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-400">#{index + 1}</span>
                      <span className="text-slate-300 font-semibold">{item.timeFormatted}</span>
                      {index === 0 && (
                        <span className="text-[9px] px-1 rounded bg-cyan-950 text-cyan-400 font-mono uppercase">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Trajectory Badge */}
                    <div className="flex items-center gap-1">
                      {item.trajectoryVsPrevious === 'DETERIORATED' ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{item.urgencyScoreDelta} Deteriorated</span>
                        </span>
                      ) : item.trajectoryVsPrevious === 'IMPROVED' ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                          <TrendingDown className="w-3 h-3" />
                          <span>{item.urgencyScoreDelta} Improved</span>
                        </span>
                      ) : item.trajectoryVsPrevious === 'STABLE' ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          <Minus className="w-3 h-3" />
                          <span>Stable</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                          Baseline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="py-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate" title={item.presetTitle}>
                        {item.presetTitle}
                      </h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${tierBadgeBg}`}>
                        {item.result.triage_level} ({item.result.urgency_score}/10)
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.symptomsSummary}
                    </p>

                    {/* Vitals snapshot */}
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1">
                      {item.vitals.temperatureF && <span>{item.vitals.temperatureF}°F</span>}
                      {item.vitals.heartRateBpm && <span>{item.vitals.heartRateBpm} bpm</span>}
                      {item.vitals.oxygenSatPercent && <span>{item.vitals.oxygenSatPercent}% SpO2</span>}
                    </div>
                  </div>

                  {/* Restore Action */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onRestoreAssessment(item)}
                      aria-label={`Restore assessment from ${item.timeFormatted}`}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/80 hover:border-cyan-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Restore to Dashboard</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SBAR Clinical Handover Report Modal */}
      {isSbarModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sbar-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
        >
          <div
            className={`w-full max-w-2xl rounded-2xl border p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto ${
              highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 id="sbar-modal-title" className="text-sm sm:text-base font-bold text-white">
                  Clinical Handover Document (SBAR Format)
                </h3>
              </div>
              <button
                onClick={() => setIsSbarModalOpen(false)}
                aria-label="Close handover report"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SBAR Sections */}
            <div className="space-y-3 text-xs leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 font-mono uppercase block text-[11px]">
                  [S] SITUATION
                </span>
                <p className="text-slate-200">{sbarReport.situation}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 font-mono uppercase block text-[11px]">
                  [B] BACKGROUND
                </span>
                <p className="text-slate-200">{sbarReport.background}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 font-mono uppercase block text-[11px]">
                  [A] ASSESSMENT
                </span>
                <p className="text-slate-200">{sbarReport.assessment}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 font-mono uppercase block text-[11px]">
                  [R] RECOMMENDATION
                </span>
                <p className="text-slate-200">{sbarReport.recommendation}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                {sbarReport.totalAssessmentsInSession} Session Records Synthesized
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySBAR}
                  aria-label="Copy SBAR Handover Text"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {sbarCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied SBAR!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Handover Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsSbarModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
