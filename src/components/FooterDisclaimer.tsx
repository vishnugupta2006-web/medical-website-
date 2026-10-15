import React from 'react';
import { ShieldCheck, GraduationCap, AlertOctagon } from 'lucide-react';
import { MANDATORY_DISCLAIMER, RX_SAFETY_WARNING } from '../utils/triageMatrix.js';

interface FooterDisclaimerProps {
  highContrast: boolean;
}

export const FooterDisclaimer: React.FC<FooterDisclaimerProps> = ({ highContrast }) => {
  return (
    <footer
      role="contentinfo"
      className={`border-t transition-colors mt-12 ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>Mandatory Research &amp; Clinical Safety Compliance</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              {MANDATORY_DISCLAIMER}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {RX_SAFETY_WARNING}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>University Biomedical Informatics Lab</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              PulseCare Triage Engine • Multimodal AI v2.4
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Compliant Ephemeral P2P WebRTC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
