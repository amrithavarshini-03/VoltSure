import React, { useState } from 'react';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { calculateChargerTrustScore } from '../engine/charger';
import { FreshnessDecayRing } from '../components/gauges/FreshnessDecayRing';
import { TruthBadge } from '../components/common/TruthBadge';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  BatteryCharging,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Zap,
  Info,
  CheckCircle,
} from 'lucide-react';

export const ChargerTrust: React.FC = () => {
  const { getChargers, getVehicle, chargerAgeOverrides, setChargerAgeOverride, resetChargerAgeOverrides } = useVoltSureStore();
  const vehicle = getVehicle();
  const chargers = getChargers();

  const [selectedConnectorFilter, setSelectedConnectorFilter] = useState<string>('ALL');
  const [activeChargerId, setActiveChargerId] = useState<string>('ch-thadagam');

  const connectorFilters = ['ALL', 'LECCS', 'Type 2', 'CCS2', 'Swap-Pack'];

  const filteredChargers = chargers.filter((c) => {
    if (selectedConnectorFilter === 'ALL') return true;
    return c.connectors.includes(selectedConnectorFilter);
  });

  const activeCharger = chargers.find((c) => c.id === activeChargerId) || chargers[0];
  const activeAge = chargerAgeOverrides[activeCharger.id] !== undefined
    ? chargerAgeOverrides[activeCharger.id]
    : activeCharger.statusAgeMinutes;

  const trustResult = calculateChargerTrustScore(activeCharger, vehicle, activeAge);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 4 — Charger Trust Matrix
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Charger Trust & Bayesian Status Freshness
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            A stale &ldquo;Available&rdquo; status is not fresh evidence. Trust scores decay exponentially with telemetry age.
          </p>
        </div>

        <button
          onClick={resetChargerAgeOverrides}
          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono text-slate-700 shadow-xs transition"
        >
          Reset Telemetry Ages
        </button>
      </div>

      {/* Interactive "Age the Status" Live Decay Showcase Hero Card */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-300 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Score Gauge & Decay Status (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <FreshnessDecayRing ageMinutes={activeAge} size={90}>
            <span className="text-sm font-mono font-bold text-slate-900">
              {activeAge < 60 ? `${activeAge}m` : `${Math.floor(activeAge / 60)}h`}
            </span>
          </FreshnessDecayRing>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                {activeCharger.name}
              </span>
            </div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-3xl font-mono font-extrabold text-slate-900">
                {trustResult.trustScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100 Trust Score</span>
            </div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                trustResult.trustScore >= 75
                  ? 'bg-emerald-100 text-emerald-800'
                  : trustResult.trustScore >= 45
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              P(Usable at Arrival): {(trustResult.pUsable * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Right: Age the Status Interactive Slider (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 font-sans">
              <Clock className="w-4 h-4 text-lime-600" />
              <span>Interactive Telemetry Decay Slider: &ldquo;Age the Status&rdquo;</span>
            </span>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900">
              {activeAge < 60 ? `${activeAge} minutes old` : `${Math.floor(activeAge / 60)}h ${activeAge % 60}m old`}
            </span>
          </div>

          <input
            type="range"
            min="2"
            max="360"
            step="5"
            value={activeAge}
            onChange={(e) => setChargerAgeOverride(activeCharger.id, Number(e.target.value))}
            className="w-full accent-lime-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2m (Fresh Ping)</span>
            <span>45m (τ Half-Life)</span>
            <span>2h (Aging)</span>
            <span>6h (Stale — Low Evidence)</span>
          </div>

          <p className="text-xs text-slate-600 font-sans italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {trustResult.evidenceSummary}
          </p>
        </div>
      </div>

      {/* Trust Score Bayesian Evidence Waterfall Breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-lime-600" />
            <span>Mathematical Evidence Breakdown for {activeCharger.name}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Formula: P_usable = w_fresh·p_status + (1−w_fresh)·p_hist − penalties
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Compatibility Gate</span>
            <p className="font-bold text-emerald-700">
              {trustResult.isCompatible ? '✓ PASSED' : '✗ INCOMPATIBLE'}
            </p>
            <span className="text-[10px] text-slate-400 font-sans">Vehicle connectors match</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Freshness Weight (w_fresh)</span>
            <p className="font-bold text-slate-900">
              {(trustResult.freshnessWeight * 100).toFixed(1)}%
            </p>
            <span className="text-[10px] text-slate-400 font-sans">e^(-{activeAge}m / 45m)</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Reported Status Prior</span>
            <p className="font-bold text-slate-900">
              {(trustResult.statusPUsable * 100).toFixed(0)}%
            </p>
            <span className="text-[10px] text-slate-400 font-sans">State: &lsquo;{activeCharger.status}&rsquo;</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Historical Prior (Beta)</span>
            <p className="font-bold text-slate-900">
              {(trustResult.historicalPUsable * 100).toFixed(0)}%
            </p>
            <span className="text-[10px] text-slate-400 font-sans">
              {activeCharger.recentSuccesses} ok / {activeCharger.recentFailures} fail
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase block">Arrival Risk Penalties</span>
            <p className="font-bold text-amber-700">
              -{( (trustResult.arrivalOccupancyPenalty + trustResult.faultPenalty) * 100 ).toFixed(0)}%
            </p>
            <span className="text-[10px] text-slate-400 font-sans">Queue & fault risk</span>
          </div>
        </div>
      </div>

      {/* Charger Directory Table with Filters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Nearby Charging Network Stations ({filteredChargers.length})
          </h3>

          {/* Connector Compatibility Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-mono">
            {connectorFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedConnectorFilter(filter)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedConnectorFilter === filter
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                <th className="py-2.5 px-3">Station & Operator</th>
                <th className="py-2.5 px-3">Connectors</th>
                <th className="py-2.5 px-3">Power</th>
                <th className="py-2.5 px-3">Reported Status</th>
                <th className="py-2.5 px-3">Status Age</th>
                <th className="py-2.5 px-3">Session Ratio</th>
                <th className="py-2.5 px-3">Trust Score</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChargers.map((c) => {
                const age = chargerAgeOverrides[c.id] !== undefined ? chargerAgeOverrides[c.id] : c.statusAgeMinutes;
                const score = calculateChargerTrustScore(c, vehicle, age);
                const isSelected = c.id === activeCharger.id;

                return (
                  <tr
                    key={c.id}
                    onClick={() => setActiveChargerId(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-lime-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 font-sans">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.operator}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {c.connectors.map((conn) => (
                          <span
                            key={conn}
                            className={`text-[9px] px-1.5 py-0.5 rounded border ${
                              vehicle.compatibleConnectors.includes(conn)
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {conn}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{c.powerKw} kW</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'occupied'
                            ? 'bg-sky-100 text-sky-800'
                            : c.status === 'fault'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <FreshnessDecayRing ageMinutes={age} size={30} />
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.recentSuccesses} / {c.recentSuccesses + c.recentFailures} ({((c.recentSuccesses / (c.recentSuccesses + c.recentFailures)) * 100).toFixed(0)}%)
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                          score.trustScore >= 75
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : score.trustScore >= 45
                            ? 'text-amber-700 bg-amber-50 border border-amber-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                        }`}
                      >
                        {score.trustScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChargerId(c.id);
                        }}
                        className="text-[11px] text-lime-700 hover:text-lime-900 underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Non-negotiable OCPP disclaimer */}
        <p className="text-[10px] text-slate-400 font-mono italic pt-2 border-t border-slate-100">
          * OCPP-compatible adapter interface; operator support required; demo uses a labelled simulator. No commercial CPO relationship or live grid control is claimed.
        </p>
      </div>
    </div>
  );
};

