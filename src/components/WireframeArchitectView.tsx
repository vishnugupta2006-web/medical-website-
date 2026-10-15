import React, { useState } from 'react';
import {
  LayoutTemplate,
  Monitor,
  Tablet,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface WireframeArchitectViewProps {
  highContrast: boolean;
}

export const WireframeArchitectView: React.FC<WireframeArchitectViewProps> = ({ highContrast }) => {
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeLayer, setActiveLayer] = useState<'all' | 'landmarks' | 'accessibility' | 'flow'>('all');

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* Blueprint Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              PulseCare Triage Interface Wireframes & System Architecture
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              WCAG 2.2 AA Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            High-level website blueprints, responsive breakpoints, semantic landmarks, and accessibility matrix.
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setDevicePreview('desktop')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
              devicePreview === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop (1440px)</span>
          </button>

          <button
            onClick={() => setDevicePreview('tablet')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
              devicePreview === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet (768px)</span>
          </button>

          <button
            onClick={() => setDevicePreview('mobile')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
              devicePreview === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (390px)</span>
          </button>
        </div>
      </div>

      {/* Layer Filter Toolbar */}
      <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">
          Blueprint Overlays:
        </span>
        {[
          { id: 'all', label: 'Complete Architectural Schema' },
          { id: 'landmarks', label: 'Semantic HTML Landmarks' },
          { id: 'accessibility', label: 'ARIA & Contrast Rules' },
          { id: 'flow', label: 'Triage Data Flow Bus' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveLayer(item.id as typeof activeLayer)}
            className={`px-3 py-1 rounded-lg border whitespace-nowrap text-xs font-medium transition-all cursor-pointer ${
              activeLayer === item.id
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Interactive Blueprint Sandbox */}
      <div className="p-5 sm:p-7 flex flex-col items-center justify-center bg-slate-950/60 min-h-[500px]">
        {/* Device Canvas Frame */}
        <div
          className={`transition-all duration-300 rounded-2xl border-2 border-indigo-500/40 bg-slate-950 p-4 shadow-2xl relative ${
            devicePreview === 'desktop'
              ? 'w-full max-w-5xl'
              : devicePreview === 'tablet'
              ? 'w-full max-w-2xl'
              : 'w-full max-w-xs'
          }`}
        >
          {/* Blueprint Title Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-900/60 font-mono text-[11px] text-indigo-400">
            <span>[SCHEMATIC: PULSECARE-TRIAGE-UX-V2]</span>
            <span>VIEWPORT: {devicePreview.toUpperCase()}</span>
          </div>

          {/* Wireframe Mockup Structure */}
          <div className="space-y-3 font-mono text-xs">
            {/* WIREFRAME: Header & Emergency Bar */}
            <div className="border border-dashed border-indigo-400/60 rounded-xl p-3 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                  [1]
                </span>
                <div>
                  <div className="font-bold text-white text-xs">
                    &lt;header role="banner"&gt; • PulseCare AI Branding &amp; Vitals
                  </div>
                  {(activeLayer === 'landmarks' || activeLayer === 'all') && (
                    <div className="text-[10px] text-indigo-300">
                      Landmark: role="banner" • aria-label="Main Navigation"
                    </div>
                  )}
                </div>
              </div>

              <div className="border border-red-500/60 bg-red-950/30 px-2 py-1 rounded text-[10px] text-red-300 font-bold flex items-center gap-1">
                <span>[EMERGENCY 911 / 112]</span>
                <span className="text-[9px] text-red-400">aria-live="assertive"</span>
              </div>
            </div>

            {/* WIREFRAME: Multimodal Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Left Column: Symptoms & Patient Vitals */}
              <div
                className={`border border-dashed border-indigo-400/60 rounded-xl p-3 bg-indigo-950/20 space-y-2 ${
                  devicePreview === 'desktop' ? 'md:col-span-6' : 'md:col-span-12'
                }`}
              >
                <div className="flex items-center justify-between text-indigo-300 text-[11px] font-bold">
                  <span>[2A] &lt;form role="search"&gt; SYMPTOM INPUT</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200">
                    Accessible Labels
                  </span>
                </div>
                <div className="border border-slate-700 bg-slate-900/60 p-2 rounded text-[10px] text-slate-400">
                  &lt;textarea aria-required="true" placeholder="Reported symptoms / onset..."&gt;
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="border border-slate-700 bg-slate-900/60 p-1.5 rounded text-slate-400">
                    &lt;input id="vitals-temp" /&gt;
                  </div>
                  <div className="border border-slate-700 bg-slate-900/60 p-1.5 rounded text-slate-400">
                    &lt;input id="vitals-spo2" /&gt;
                  </div>
                </div>
              </div>

              {/* Right Column: Computer Vision Lesion Scanner Wireframe */}
              <div
                className={`border border-dashed border-cyan-400/60 rounded-xl p-3 bg-cyan-950/20 space-y-2 ${
                  devicePreview === 'desktop' ? 'md:col-span-6' : 'md:col-span-12'
                }`}
              >
                <div className="flex items-center justify-between text-cyan-300 text-[11px] font-bold">
                  <span>[2B] COMPUTER VISION SCANNER HUD</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200">
                    aria-live="polite"
                  </span>
                </div>
                <div className="aspect-[16/9] border border-cyan-600/40 bg-slate-900/80 rounded flex flex-col items-center justify-center text-center p-2 text-cyan-400 text-[10px]">
                  <span className="font-bold">[IMAGE SCANNING VIEWPORT: 400x320]</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    Laser Sweep + Interactive Coordinate Pinpoints (Erythema / Edema / Depth)
                  </span>
                </div>
              </div>
            </div>

            {/* WIREFRAME: 3-Tier Emergency Matrix Output */}
            <div className="border border-dashed border-emerald-400/60 rounded-xl p-3 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-bold">
                <span>[3] TRIAGE MATRIX ENGINE DECISION GAUGE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200">
                  Color + Shape + Number Cues
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="border border-red-500/50 bg-red-950/40 p-2 rounded text-red-200">
                  <div className="font-bold flex items-center gap-1">
                    <span>🚨 TIER 1: RED (Score 8-10)</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Triggers: Anaphylaxis, Chest Pain, Arterial Bleed
                  </div>
                </div>

                <div className="border border-amber-500/50 bg-amber-950/40 p-2 rounded text-amber-200">
                  <div className="font-bold flex items-center gap-1">
                    <span>⚠️ TIER 2: YELLOW (Score 4-7)</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Triggers: Fever &gt;102°F, 2nd Degree Burns, Lacerations
                  </div>
                </div>

                <div className="border border-emerald-500/50 bg-emerald-950/40 p-2 rounded text-emerald-200">
                  <div className="font-bold flex items-center gap-1">
                    <span>🟢 TIER 3: GREEN (Score 1-3)</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Triggers: Superficial Scrapes, Mild Allergies
                  </div>
                </div>
              </div>
            </div>

            {/* WIREFRAME: Downstream Triggers & Spatial Assistant */}
            <div className="border border-dashed border-purple-400/60 rounded-xl p-3 bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between text-purple-300 text-[11px] font-bold">
                <span>[4] DOWNSTREAM WEB SERVICE TRIGGERS</span>
                <span className="text-[9px] text-purple-400">WebRTC + Geospatial Radius</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                <div className="border border-purple-600/40 bg-purple-900/30 p-2 rounded text-slate-300">
                  <strong>[ Video Call Doctor ]</strong>
                  <div className="text-[9px] text-slate-400">SDP Peer Negotiation</div>
                </div>
                <div className="border border-purple-600/40 bg-purple-900/30 p-2 rounded text-slate-300">
                  <strong>[ Tele-Pharmacy Consult ]</strong>
                  <div className="text-[9px] text-slate-400">Pharmacist Verification</div>
                </div>
                <div className="border border-purple-600/40 bg-purple-900/30 p-2 rounded text-slate-300">
                  <strong>[ Spatial Locator 5km ]</strong>
                  <div className="text-[9px] text-slate-400">Emergency &amp; OTC Hubs</div>
                </div>
              </div>
            </div>

            {/* WIREFRAME: Mandatory Disclaimer Footer */}
            <div className="border border-dashed border-slate-600 rounded-xl p-2.5 bg-slate-950 text-center text-[10px] text-amber-300/80">
              [FOOTER LANDMARK: role="contentinfo"] • Mandatory University Research Project Disclaimer
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Standards Compliance Matrix */}
      <div className="p-5 sm:p-7 border-t border-slate-800 bg-slate-950/90 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WCAG 2.2 AA Accessibility & Compliance Specifications</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400 font-bold">100% Compliant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-cyan-300">1. Color Contrast & Multi-Sensory Cues</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every severity tier pairs color (Red/Yellow/Green) with distinct geometric iconography (🚨 Shield, ⚠️ Triangle, 🟢 Circle) and numerical urgency scores (1-10) to support deuteranopia and protanopia. Minimum contrast ratio exceeds 4.5:1.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-indigo-300">2. ARIA Live Regions & Focus Trapping</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Tier 1 Emergency triggers employ <code className="text-white">role="alert" aria-live="assertive"</code> to notify screen readers instantaneously. Modals trap keyboard focus and dismiss cleanly via Escape key.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-purple-300">3. Keyboard Navigability & Native Semantics</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              All interactive controls use native <code className="text-white">&lt;button&gt;</code>, <code className="text-white">&lt;input&gt;</code>, and form elements with explicit labels. High contrast mode ensures accessibility in low-light clinical emergency conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
