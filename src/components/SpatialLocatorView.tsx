import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  PackageCheck,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Pill
} from 'lucide-react';
import { SPATIAL_FACILITIES_DATABASE, HealthcareFacility } from '../data/facilities.js';

interface SpatialLocatorViewProps {
  highContrast: boolean;
  onSelectFacility?: (fac: HealthcareFacility) => void;
}

export const SpatialLocatorView: React.FC<SpatialLocatorViewProps> = ({
  highContrast,
  onSelectFacility
}) => {
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeFacility, setActiveFacility] = useState<HealthcareFacility | null>(SPATIAL_FACILITIES_DATABASE[0]);
  const [dispatchedFacilityId, setDispatchedFacilityId] = useState<string | null>(null);

  const filteredFacilities = SPATIAL_FACILITIES_DATABASE.filter(f => {
    if (f.distanceKm > radiusKm) return false;
    if (selectedType !== 'ALL' && f.type !== selectedType) return false;
    return true;
  });

  const handleDispatch = (id: string) => {
    setDispatchedFacilityId(id);
    setTimeout(() => {
      setDispatchedFacilityId(null);
    }, 5000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        highContrast ? 'bg-black border-yellow-400 text-white' : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-xl'
      }`}
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Spatial Healthcare & 24/7 Pharmacy Locator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial queries for verified Level-1 trauma centers, urgent care, and 24/7 pharmacies.
          </p>
        </div>

        {/* Radius query selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] px-2 font-mono uppercase">Radius:</span>
          {[1, 3, 5, 10, 25].map(r => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                radiusKm === r
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { label: 'All Facilities', value: 'ALL' },
          { label: 'Level 1 Trauma', value: 'TRAUMA_CENTER' },
          { label: 'Emergency Rooms', value: 'EMERGENCY_ROOM' },
          { label: 'Urgent Care Clinics', value: 'URGENT_CARE' },
          { label: '24/7 Pharmacies', value: '24_7_PHARMACY' }
        ].map(item => (
          <button
            key={item.value}
            onClick={() => setSelectedType(item.value)}
            className={`px-3 py-1 rounded-lg border whitespace-nowrap text-xs font-medium transition-colors cursor-pointer ${
              selectedType === item.value
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content: Interactive Spatial Radar Map + Facility List */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Spatial Radar Canvas */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[380px] rounded-2xl border-2 border-emerald-500/40 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Concentric Radar Grid Rings */}
            <div className="absolute w-[85%] h-[85%] rounded-full border border-emerald-500/20" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-emerald-500/25" />
            <div className="absolute w-[35%] h-[35%] rounded-full border border-emerald-500/30" />
            <div className="absolute w-[12%] h-[12%] rounded-full bg-emerald-500/20 border border-emerald-400 animate-ping" />

            {/* Radar Crosshairs */}
            <div className="absolute w-full h-px bg-emerald-500/20" />
            <div className="absolute h-full w-px bg-emerald-500/20" />

            {/* Sweeping Radar Beam */}
            <div
              className="absolute inset-0 origin-center pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.25) 0deg, rgba(16, 185, 129, 0) 60deg)',
                animation: 'spin 4s linear infinite'
              }}
            />

            {/* Center Patient Location Pin */}
            <div className="absolute z-20 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-400 animate-pulse" />
              <span className="text-[9px] font-bold text-cyan-300 font-mono mt-0.5 bg-black/70 px-1 rounded">
                PATIENT (0.0km)
              </span>
            </div>

            {/* Plotted Facility Radar Blips */}
            {filteredFacilities.map((fac, idx) => {
              // Map lat/lng relative to center
              const angle = (idx * 72) * (Math.PI / 180);
              const normalizedDist = Math.min(1, fac.distanceKm / radiusKm) * 42; // percentage offset
              const xPercent = 50 + Math.cos(angle) * normalizedDist;
              const yPercent = 50 + Math.sin(angle) * normalizedDist;
              const isSelected = activeFacility?.id === fac.id;

              return (
                <button
                  key={fac.id}
                  onClick={() => setActiveFacility(fac)}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  aria-label={`Select facility: ${fac.name}`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full border-2 transition-transform cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-400 scale-125 shadow-lg shadow-emerald-400/80'
                      : fac.type === 'TRAUMA_CENTER' || fac.type === 'EMERGENCY_ROOM'
                      ? 'bg-rose-600 border-rose-300 hover:scale-110'
                      : fac.type === 'URGENT_CARE'
                      ? 'bg-amber-500 border-amber-300 hover:scale-110'
                      : 'bg-emerald-500 border-emerald-200 hover:scale-110'
                  }`}
                  title={`${fac.name} (${fac.distanceKm} km)`}
                >
                  <span className="sr-only">{fac.name}</span>
                </button>
              );
            })}

            {/* Bottom Radar Status Label */}
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded text-[10px] text-slate-300 flex items-center justify-between font-mono">
              <span className="text-emerald-400">ACTIVE RADAR • {radiusKm} KM RANGE</span>
              <span>{filteredFacilities.length} NODES FOUND</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Click any pulsating radar blip to inspect facility wait-times and inventory.
          </p>
        </div>

        {/* Right: Detailed Facility Cards */}
        <div className="lg:col-span-7 space-y-3">
          {filteredFacilities.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-950 text-center border border-slate-800">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">No facilities found within {radiusKm} km.</p>
              <p className="text-xs text-slate-400 mt-1">Try expanding the spatial radius query to 10 km or 25 km.</p>
            </div>
          ) : (
            filteredFacilities.map(fac => {
              const isSelected = activeFacility?.id === fac.id;
              const isDispatched = dispatchedFacilityId === fac.id;

              return (
                <div
                  key={fac.id}
                  onClick={() => setActiveFacility(fac)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            fac.type === 'TRAUMA_CENTER' || fac.type === 'EMERGENCY_ROOM'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : fac.type === 'URGENT_CARE'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {fac.categoryTitle}
                        </span>
                        {fac.open24Hours && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            24/7 OPEN
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1">{fac.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{fac.address}, {fac.cityState}</span>
                      </p>
                    </div>

                    {/* ETA & Distance */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                      <span className="text-emerald-400 font-bold text-sm">{fac.distanceKm} km away</span>
                      <span className="text-xs text-slate-400 font-mono">~{fac.driveTimeMin} min drive</span>
                    </div>
                  </div>

                  {/* Badges: Verified Pharmacist / Bed count */}
                  <div className="flex items-center flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{fac.verifiedStatus}</span>
                    </div>

                    {fac.pharmacistOnDuty && (
                      <div className="flex items-center gap-1 text-cyan-300">
                        <Pill className="w-3.5 h-3.5" />
                        <span>{fac.pharmacistOnDuty}</span>
                      </div>
                    )}

                    {fac.availableBeds !== undefined && (
                      <span className="text-slate-400 font-mono">
                        Available Trauma Bays: <strong className="text-white">{fac.availableBeds}</strong>
                      </span>
                    )}

                    <span className="text-slate-400 font-mono ml-auto">
                      Wait Time: <strong className="text-white">{fac.currentWaitTimeMin} min</strong>
                    </span>
                  </div>

                  {/* Stock inventory tags */}
                  {fac.stockAvailability && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[10px]">
                      <span className="text-slate-500">Inventory Status:</span>
                      {fac.stockAvailability.firstAidSupplies && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">First-Aid ✓</span>
                      )}
                      {fac.stockAvailability.burnDressings && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Burn Dressings ✓</span>
                      )}
                      {fac.stockAvailability.epinephrineAutoInjectors && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300">EpiPen ✓</span>
                      )}
                      {fac.stockAvailability.sutureKits && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Suture Bays ✓</span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                      aria-label={`Call ${fac.name}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>{fac.phone}</span>
                    </a>

                    {fac.type === '24_7_PHARMACY' && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDispatch(fac.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>Pharmacist Verified & Dispatched!</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3" />
                            <span>Dispatch OTC Courier (15m ETA)</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        alert(`GPS Route plotted to ${fac.name} (${fac.address}). Estimated arrival: ${fac.driveTimeMin} minutes.`);
                      }}
                      className="ml-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-emerald-400" />
                      <span>Directions</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
