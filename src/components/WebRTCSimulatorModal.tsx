import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  Activity,
  Send,
  Package,
  CheckCircle2,
  Lock,
  Wifi,
  Sparkles,
  Truck
} from 'lucide-react';
import { TriageResult } from '../utils/triageMatrix.js';

interface WebRTCSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'doctor' | 'pharmacist';
  triageResult: TriageResult;
  highContrast: boolean;
}

export const WebRTCSimulatorModal: React.FC<WebRTCSimulatorModalProps> = ({
  isOpen,
  onClose,
  role,
  triageResult,
  highContrast
}) => {
  const [micActive, setMicActive] = useState<boolean>(true);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected'>('connecting');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [deliveryOrdered, setDeliveryOrdered] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConnectionState('connecting');
      const timer = setTimeout(() => {
        setConnectionState('connected');
        if (role === 'doctor') {
          setChatMessages([
            {
              sender: 'Dr. Sarah Jenkins, MD',
              text: `Hello, I see the PulseCare triage alert with urgency score ${triageResult.urgency_score}/10 (${triageResult.triage_level}). I am reviewing your observed symptoms now. Are you in a safe position?`,
              time: 'Just now'
            }
          ]);
        } else {
          setChatMessages([
            {
              sender: 'Dr. Elena Rostova, PharmD',
              text: `Hello! I have reviewed your Tier 3 triage assessment. I can guide you through OTC dressing application and dispatch a sterile home first-aid care pack to your location.`,
              time: 'Just now'
            }
          ]);
        }
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, role, triageResult]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = {
      sender: 'You',
      text: inputMessage,
      time: 'Now'
    };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Automated doctor / pharmacist response
    setTimeout(() => {
      const reply =
        role === 'doctor'
          ? 'Understood. Please keep applying direct pressure if bleeding, or maintain your seated position. Emergency EMS dispatch is also on standby.'
          : 'Thank you for confirming. I have verified the OTC antiseptic ointment and sterile hydrocolloid dressings. They comply with all non-Rx safety guidelines.';
      setChatMessages(prev => [
        ...prev,
        {
          sender: role === 'doctor' ? 'Dr. Sarah Jenkins, MD' : 'Dr. Elena Rostova, PharmD',
          text: reply,
          time: 'Now'
        }
      ]);
    }, 1000);
  };

  const isDoctor = role === 'doctor';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="webrtc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
    >
      <div
        className={`w-full max-w-4xl rounded-2xl border flex flex-col overflow-hidden max-h-[90vh] shadow-2xl transition-all ${
          highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
              }`}
            />
            <div>
              <h3 id="webrtc-modal-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isDoctor ? 'Emergency WebRTC Video Consult' : 'Tele-Pharmacy Video Consult'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  {connectionState === 'connected' ? 'P2P ENCRYPTED' : 'HANDSHAKE...'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isDoctor ? 'Attending Trauma Physician: Dr. Sarah Jenkins, MD' : 'Clinical Pharmacist: Dr. Elena Rostova, PharmD'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>SRTP-AES-128 • 24ms</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close video consultation"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Feed & Side Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Main Video Screen */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between bg-slate-950 relative min-h-[300px] sm:min-h-[400px]">
            {/* Doctor / Pharmacist Simulated Feed */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              {connectionState === 'connecting' ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span className="text-xs font-mono">Negotiating ICE Candidates with STUN/TURN relay...</span>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                  {/* Doctor/Pharmacist Avatar Artwork */}
                  <div className="relative">
                    <div
                      className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 flex items-center justify-center shadow-2xl ${
                        isDoctor ? 'border-blue-500/80 bg-blue-950/60' : 'border-emerald-500/80 bg-emerald-950/60'
                      }`}
                    >
                      <span className="text-5xl sm:text-6xl">{isDoctor ? '👩‍⚕️' : '🧑‍⚕️'}</span>
                    </div>
                    <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="mt-3 text-center">
                    <h4 className="text-sm font-bold text-white">
                      {isDoctor ? 'Dr. Sarah Jenkins, MD' : 'Dr. Elena Rostova, PharmD'}
                    </h4>
                    <p className="text-xs text-cyan-300">
                      {isDoctor ? 'Emergency Medicine • On Duty' : 'State Board Licensed Pharmacist'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Top Telemetry HUD */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    triageResult.triage_level === 'RED' ? 'bg-rose-500' : triageResult.triage_level === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                <span className="font-bold uppercase tracking-wider">{triageResult.triage_level} Triage Feed</span>
                <span className="text-slate-400 font-mono">Score: {triageResult.urgency_score}/10</span>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>1080p @ 60fps</span>
              </div>
            </div>

            {/* Floating Picture-in-Picture Patient Camera View */}
            <div className="relative z-10 self-end w-32 sm:w-40 aspect-video rounded-xl border-2 border-slate-700 bg-slate-900 overflow-hidden shadow-2xl flex items-center justify-center">
              {videoActive ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs relative">
                  <span className="text-3xl">👤</span>
                  <span className="absolute bottom-1 left-2 text-[10px] font-mono text-slate-400 bg-black/60 px-1 rounded">
                    You
                  </span>
                </div>
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center text-slate-500 text-xs">
                  <VideoOff className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>

            {/* In-Call Controls Bar */}
            <div className="relative z-10 flex items-center justify-center gap-3 mt-4 pt-2">
              <button
                onClick={() => setMicActive(!micActive)}
                aria-label={micActive ? 'Mute microphone' : 'Unmute microphone'}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  micActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                    : 'bg-red-600 text-white border-red-500'
                }`}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVideoActive(!videoActive)}
                aria-label={videoActive ? 'Turn off camera' : 'Turn on camera'}
                className={`p-3 rounded-full border transition-all cursor-pointer ${
                  videoActive
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                    : 'bg-red-600 text-white border-red-500'
                }`}
              >
                {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                aria-label="End consultation call"
                className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950 cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            </div>
          </div>

          {/* Side Tele-Health Chat & Dispatch Actions */}
          <div className="lg:col-span-4 p-4 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between bg-slate-900/90">
            {/* Top Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-300">Live Consultation Notes</span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified License
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl ${
                      msg.sender === 'You'
                        ? 'bg-cyan-950/70 border border-cyan-800/60 ml-4'
                        : 'bg-slate-800/80 border border-slate-700/70 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[10px] font-semibold text-slate-400">
                      <span>{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions: Dispatch Courier for Tier 3, or Message Input */}
            <div className="mt-4 space-y-3 pt-3 border-t border-slate-800">
              {!isDoctor && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      OTC First-Aid Care Pack
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Free Courier</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">
                    Includes sterile hydrocolloid dressings, antiseptic saline spray, and wound tape.
                  </p>

                  {deliveryOrdered ? (
                    <div className="p-2 rounded bg-emerald-900/60 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-300 animate-pulse" />
                      <span>Courier Dispatched! ETA: 18 mins</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeliveryOrdered(true)}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispatch Doorstep Delivery</span>
                    </button>
                  )}
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Type message to clinician..."
                  aria-label="Type message to clinician"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
