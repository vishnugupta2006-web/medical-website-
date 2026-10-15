import React, { useState } from 'react';
import { Scan, Eye, AlertCircle, Sparkles, CheckCircle2, Crosshair, RefreshCw, Upload, ShieldCheck } from 'lucide-react';
import { ClinicalPreset, CLINICAL_PRESETS } from '../data/clinicalPresets.js';
import { ClinicalFeatureObservation } from '../utils/triageMatrix.js';

interface ImageScannerModuleProps {
  currentPreset: ClinicalPreset;
  onSelectPreset: (preset: ClinicalPreset) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
  scanComplete: boolean;
  highContrast: boolean;
  customUploadedImage: string | null;
  onCustomImageUpload: (base64: string) => void;
}

export const ImageScannerModule: React.FC<ImageScannerModuleProps> = ({
  currentPreset,
  onSelectPreset,
  isScanning,
  onTriggerScan,
  scanComplete,
  highContrast,
  customUploadedImage,
  onCustomImageUpload
}) => {
  const [activePinpoint, setActivePinpoint] = useState<number | null>(null);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [activeIndicatorFilter, setActiveIndicatorFilter] = useState<string>('all');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCustomImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredFeatures = currentPreset.detectedFeatures.filter(f => {
    if (activeIndicatorFilter === 'all') return true;
    return f.clinicalTag === activeIndicatorFilter;
  });

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* Top Header of Scanner */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Computer Vision & Lesion Symptom Scanner
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              HUD Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual feature scanning for erythema, edema, margin irregularity, exudate, and depth.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            aria-pressed={showOverlays}
            aria-label="Toggle visual HUD overlay pinpoints"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showOverlays
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOverlays ? 'Hide Pinpoints' : 'Show Pinpoints'}</span>
          </button>

          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            aria-label="Run automated optical scan on image"
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-900/40 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Image...</span>
              </>
            ) : (
              <>
                <Scan className="w-3.5 h-3.5" />
                <span>Scan Image Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Selector Bar */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium whitespace-nowrap text-[11px] uppercase tracking-wider">
          Clinical Presets:
        </span>
        {CLINICAL_PRESETS.map(preset => {
          const isSelected = currentPreset.id === preset.id && !customUploadedImage;
          const tierColor =
            preset.tier === 'RED'
              ? 'border-red-500/40 text-red-300 hover:bg-red-950/40'
              : preset.tier === 'YELLOW'
              ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/40'
              : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40';

          return (
            <button
              key={preset.id}
              onClick={() => {
                onCustomImageUpload('');
                onSelectPreset(preset);
              }}
              className={`px-3 py-1 rounded-lg border whitespace-nowrap text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/50'
                  : `bg-slate-900/60 ${tierColor}`
              }`}
            >
              <span className="mr-1.5">
                {preset.tier === 'RED' ? '🚨' : preset.tier === 'YELLOW' ? '⚠️' : '🟢'}
              </span>
              <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
            </button>
          );
        })}

        {/* Custom Upload Trigger */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
          aria-label="Upload wound photo"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto px-3 py-1 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-slate-900/40 text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Main Viewport & HUD Scanner */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas / Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[460px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner group">
            {/* Base Image or SVG */}
            {customUploadedImage ? (
              <img
                src={customUploadedImage}
                alt="Patient uploaded wound feature"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: currentPreset.imageSvg }}
              />
            )}

            {/* Active Scanning Laser Beam Animation */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-[scanLaser_1.8s_ease-in-out_infinite] opacity-90" />
                <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[0.5px] animate-pulse" />
                <div className="absolute top-3 left-3 bg-cyan-950/80 border border-cyan-500 text-cyan-300 text-[10px] font-mono px-2 py-1 rounded">
                  ANALYZING CHROMATIC HISTOGRAM & TISSUE CONTOUR...
                </div>
              </div>
            )}

            {/* Viewport Reticle Corner Brackets */}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-500/70 pointer-events-none" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-500/70 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-500/70 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-500/70 pointer-events-none" />

            {/* Center Crosshair watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <Crosshair className="w-24 h-24 text-cyan-400" />
            </div>

            {/* Interactive Pinpoints showing detected clinical symptoms */}
            {showOverlays && (
              <div className="absolute inset-0 pointer-events-auto">
                {filteredFeatures.map((feat, idx) => {
                  const isActive = activePinpoint === idx;
                  const severityBadgeColor =
                    feat.severity === 'Severe'
                      ? 'bg-rose-500 text-white'
                      : feat.severity === 'Moderate'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-white';

                  return (
                    <div
                      key={idx}
                      style={{ left: `${feat.x}%`, top: `${feat.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      {/* Pulse Circle */}
                      <span className="absolute -inset-2 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />

                      {/* Clickable Target Pin */}
                      <button
                        onClick={() => setActivePinpoint(isActive ? null : idx)}
                        onMouseEnter={() => setActivePinpoint(idx)}
                        aria-label={`Inspect feature: ${feat.name}`}
                        className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500 border-white scale-125 shadow-lg shadow-cyan-400/80 z-30'
                            : 'bg-slate-900/90 border-cyan-400 hover:scale-110 shadow-md shadow-black'
                        }`}
                      >
                        <span className="text-[10px] font-black text-white">{idx + 1}</span>
                      </button>

                      {/* Floating Mini-Badge */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap pointer-events-none">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${severityBadgeColor}`}>
                          {feat.clinicalTag.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Overlay Status bar at bottom of image */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Resolution: 1024x768 • RGB Depth</span>
              </div>
              <span className="font-mono text-cyan-300">
                {currentPreset.detectedFeatures.length} Markers Detected
              </span>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="w-full flex items-center justify-center gap-1.5 mt-3 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Filter Indicators:</span>
            {['all', 'erythema', 'edema', 'margin_irregularity', 'exudate_pus', 'depth_tissue_involvement', 'skin_discoloration'].map(
              tag => (
                <button
                  key={tag}
                  onClick={() => setActiveIndicatorFilter(tag)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    activeIndicatorFilter === tag
                      ? 'bg-cyan-500 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Right: Clinical Indicators Readout & Observational Safety Breakdown */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Observed Clinical Indicators</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">
                {filteredFeatures.length} Visual Findings
              </span>
            </div>

            {/* List of Detected Clinical Symptoms on Image */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredFeatures.map((feat, idx) => {
                const isSelected = activePinpoint === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePinpoint(idx)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">{feat.name}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          feat.severity === 'Severe'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : feat.severity === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {feat.severity} ({Math.round(feat.confidence * 100)}%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                      {feat.observation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Guardrail Box */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200/90 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-blue-300">Safety Guardrail:</span> All visual features above represent preliminary non-definitive observations of tissue characteristics, not final clinical diagnoses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
