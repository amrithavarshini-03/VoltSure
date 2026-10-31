import React, { useState } from 'react';
import { SWAP_CABINET_PACKS } from '../data/swap';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Thermometer,
  Zap,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const SwapNetwork: React.FC = () => {
  const { getVehicle } = useVoltSureStore();
  const vehicle = getVehicle();

  const [selectedPackId, setSelectedPackId] = useState<string>('pack-bay-01');

  const selectedPack = SWAP_CABINET_PACKS.find((p) => p.id === selectedPackId) || SWAP_CABINET_PACKS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 8 — Battery Swap Network Extension
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Automated Battery Pack Diagnostic & Exchange
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time screening of 10-bay swap cabinet packs evaluating cell voltage balance, thermal health, and trip suitability.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Station: <strong className="text-slate-800">SwapStation Coimbatore West</strong>
        </div>
      </div>

      {/* Main Grid: 10-Slot Cabinet Grid vs Active Pack Diagnostic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 10-Slot Interactive Cabinet View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-lime-600" />
              <span>Swap Cabinet Bay Matrix (10 Automated Slots)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Click a slot to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SWAP_CABINET_PACKS.map((pack) => {
              const isSelected = pack.id === selectedPack.id;
              const isCompatible = pack.compatibleVehicles.includes(vehicle.id);

              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-lime-50 border-lime-500 ring-2 ring-lime-400 shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="font-bold text-slate-500">Bay #{pack.slotNumber}</span>
                    {pack.isRecommended && (
                      <span className="text-emerald-700 font-bold">★ Best</span>
                    )}
                  </div>

                  <div className="space-y-0.5 my-auto">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold font-mono text-slate-900">
                        {pack.socPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">SoC</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {pack.voltageV}V • {pack.internalTempC}°C
                    </div>
                  </div>

                  <div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full ${
                          pack.socPercent > 80
                            ? 'bg-lime-500'
                            : pack.socPercent > 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pack.socPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[9px] font-mono block truncate ${
                        isCompatible ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {isCompatible ? '✓ Compatible' : 'Incompatible'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 font-mono italic pt-2 border-t border-slate-100">
            * Automated mechanical latch interlock prevents ejection of hot or degraded packs.
          </p>
        </div>

        {/* Right: Active Pack Deep Diagnostic & Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                  Diagnostic Telemetry: Slot #{selectedPack.slotNumber}
                </span>
                <h3 className="font-bold text-base text-slate-900 font-sans">
                  {selectedPack.packModel}
                </h3>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                  selectedPack.suitabilityScore >= 90
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : selectedPack.suitabilityScore >= 70
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                Suitability: {selectedPack.suitabilityScore}/100
              </span>
            </div>

            {/* Diagnostic Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase block">State of Charge</span>
                <span className="text-xl font-bold text-slate-900">{selectedPack.socPercent}%</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase block">Cell Voltage</span>
                <span className="text-xl font-bold text-slate-900">{selectedPack.voltageV} V</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase block">Internal Temp</span>
                <span
                  className={`text-xl font-bold ${
                    selectedPack.internalTempC > 38 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {selectedPack.internalTempC}°C
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase block">SoH Health Estimate</span>
                <span className="text-xl font-bold text-slate-900">
                  {selectedPack.sohEstimate !== null ? `${selectedPack.sohEstimate}%` : 'Unavailable'}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">
                  Confidence: {selectedPack.sohConfidence}
                </span>
              </div>
            </div>

            {/* Graceful Telemetry Gap Notice */}
            {selectedPack.sohEstimate === null && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Telemetry Gap Handled:</strong> BMS State-of-Health register is unreadable. VoltSure automatically applies conservative capacity deratings without crashing.
                </p>
              </div>
            )}

            {/* Explanation Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                Why This Pack:
              </span>
              <p className="leading-relaxed">{selectedPack.notes}</p>
            </div>

            <button
              onClick={() => alert(`Simulated mechanical unlock for Bay #${selectedPack.slotNumber}. Battery exchange initiated.`)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono shadow-sm transition"
            >
              <span>Authorize Bay #{selectedPack.slotNumber} Exchange</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

