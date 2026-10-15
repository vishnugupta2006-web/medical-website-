import React from 'react';
import { Activity, ShieldAlert, PhoneCall, Compass, Video, LayoutTemplate, Eye } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scanner' | 'wireframes' | 'spatial' | 'telehealth';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onEmergencyCall: () => void;
  isEmergencyActive?: boolean;
  historyCount?: number;
  onScrollToHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  highContrast,
  setHighContrast,
  onEmergencyCall,
  isEmergencyActive,
  historyCount = 0,
  onScrollToHistory
}) => {
  return (
    <header
      role="banner"
      className={`border-b sticky top-0 z-40 transition-colors ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/95 backdrop-blur-md border-slate-800 text-slate-100'
      }`}
    >
      {/* Critical Emergency Banner if Red tier is triggered */}
      {isEmergencyActive && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-red-600 text-white px-4 py-2 font-bold flex items-center justify-between animate-pulse text-sm"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            <span>CRITICAL EMERGENCY ACTIVE: Tier 1 Triage detected. Immediate dispatch recommended.</span>
          </div>
          <button
            onClick={onEmergencyCall}
            aria-label="Direct dial emergency 911"
            className="bg-white text-red-700 px-3 py-1 rounded text-xs uppercase tracking-wider font-extrabold shadow hover:bg-red-100 transition-colors cursor-pointer"
          >
            Call 911 / 112 Now
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Research Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                    PulseCare AI Engine
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                    v2.4 Research
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Multimodal Medical Triage & Autonomous Navigation Matrix
                </p>
              </div>
            </div>

            {/* Mobile Emergency Action */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={onEmergencyCall}
                aria-label="Emergency Speed Dial"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-900/50"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>911</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav aria-label="Main Navigation" className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Triage Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('wireframes')}
              aria-current={activeTab === 'wireframes' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'wireframes'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Website Wireframes</span>
            </button>

            <button
              onClick={() => setActiveTab('spatial')}
              aria-current={activeTab === 'spatial' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'spatial'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Spatial Facilities</span>
            </button>

            <button
              onClick={() => setActiveTab('telehealth')}
              aria-current={activeTab === 'telehealth' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'telehealth'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>WebRTC Tele-Health</span>
            </button>

            {/* Quick Session History Anchor */}
            {onScrollToHistory && (
              <button
                onClick={onScrollToHistory}
                aria-label="View previous triage assessments history"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>History ({historyCount})</span>
              </button>
            )}

            {/* Accessibility Contrast Switch */}
            <div className="ml-auto flex items-center gap-2 pl-2 border-l border-slate-700/60">
              <button
                onClick={() => setHighContrast(!highContrast)}
                aria-pressed={highContrast}
                aria-label="Toggle high contrast accessibility mode"
                className={`p-1.5 rounded-lg text-xs border flex items-center gap-1 transition-colors cursor-pointer ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
                title="High Contrast Accessibility Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{highContrast ? 'Hi-Contrast' : 'Contrast'}</span>
              </button>

              {/* Desktop 911 quick call */}
              <button
                onClick={onEmergencyCall}
                aria-label="Call Emergency 911 / 112"
                className="hidden md:flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-red-950/50 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 911 / 112</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
