import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FLEET_VEHICLES } from '../data/fleet';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const FleetMode: React.FC = () => {
  const { setScenarioInputs, setSelectedRouteId } = useVoltSureStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'GO' | 'GO_WITH_STOP' | 'DO_NOT_DISPATCH'>('ALL');

  const filteredVehicles = FLEET_VEHICLES.filter((v) => {
    if (filter === 'ALL') return true;
    return v.suitability === filter;
  });

  const goCount = FLEET_VEHICLES.filter((v) => v.suitability === 'GO').length;
  const stopCount = FLEET_VEHICLES.filter((v) => v.suitability === 'GO_WITH_STOP').length;
  const blockedCount = FLEET_VEHICLES.filter((v) => v.suitability === 'DO_NOT_DISPATCH').length;

  const handleInspectVehicle = (v: typeof FLEET_VEHICLES[0]) => {
    // Map to scenario lab inputs
    setScenarioInputs({
      startingSoC: v.currentSoC,
    });
    if (v.suitability === 'DO_NOT_DISPATCH') {
      setSelectedRouteId('route-a-direct');
    } else {
      setSelectedRouteId('route-b-saibaba');
    }
    navigate('/proof');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 7 — Commercial Fleet Extension
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Fleet Dispatch Board & Risk Screening
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Automated trip-vehicle feasibility matching to prevent towing incidents, dispatch stalls, and late SLA penalties.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
            {goCount} Go
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold">
            {stopCount} Go + Stop
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold">
            {blockedCount} Do Not Dispatch
          </span>
        </div>
      </div>

      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Infeasible Dispatches Blocked
          </span>
          <p className="text-2xl font-bold font-mono text-red-600">3 Vehicles</p>
          <span className="text-[11px] text-slate-500 font-sans">
            Zero-charge stalls averted at dispatch gate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Expected Route Delay Saved
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-700">~46 Mins</p>
          <span className="text-[11px] text-slate-500 font-sans">
            By avoiding blind queues at dead chargers
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Protected Reserve Compliance
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900">97.8%</p>
          <span className="text-[11px] text-slate-500 font-sans">
            Target 10% pack reserve preserved across roster
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
            Fleet Energy Efficiency
          </span>
          <p className="text-2xl font-bold font-mono text-slate-900">24.2 Wh/km</p>
          <span className="text-[11px] text-slate-500 font-sans">
            Average across delivery and cargo units
          </span>
        </div>
      </div>

      {/* Filter Tabs & Dispatch Roster Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Active Fleet Vehicle Matrix ({filteredVehicles.length} of {FLEET_VEHICLES.length})
          </h2>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-mono">
            {(['ALL', 'GO', 'GO_WITH_STOP', 'DO_NOT_DISPATCH'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg transition ${
                  filter === tab
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                <th className="py-2.5 px-3">Vehicle & Plate</th>
                <th className="py-2.5 px-3">Pack & SoC</th>
                <th className="py-2.5 px-3">Assigned Trip Destination</th>
                <th className="py-2.5 px-3">Suitability Decision</th>
                <th className="py-2.5 px-3">P(Arrival)</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => handleInspectVehicle(v)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block font-sans">{v.licensePlate}</span>
                    <span className="text-[10px] text-slate-500">{v.model}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{v.currentSoC}%</span>
                      <span className="text-[10px] text-slate-400">({v.currentSoH}% SoH)</span>
                    </div>
                    <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          v.currentSoC > 50
                            ? 'bg-lime-500'
                            : v.currentSoC > 25
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${v.currentSoC}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 font-sans block">
                      {v.assignedTrip.destinationName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {v.assignedTrip.distanceKm} km • +{v.assignedTrip.elevationGainM}m
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        v.suitability === 'GO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : v.suitability === 'GO_WITH_STOP'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {v.suitability === 'GO' && <CheckCircle2 className="w-3 h-3" />}
                      {v.suitability === 'GO_WITH_STOP' && <Clock className="w-3 h-3" />}
                      {v.suitability === 'DO_NOT_DISPATCH' && <XCircle className="w-3 h-3" />}
                      <span>{v.suitability.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold text-sm ${
                        v.arrivalProbability >= 0.90
                          ? 'text-emerald-700'
                          : v.arrivalProbability >= 0.70
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }`}
                    >
                      {(v.arrivalProbability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {v.riskTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {v.chargerDependency && (
                      <span className="text-[9px] text-sky-700 block mt-0.5 font-semibold">
                        Stop: {v.chargerDependency}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectVehicle(v);
                      }}
                      className="text-xs text-lime-700 hover:text-lime-900 font-semibold underline flex items-center gap-1"
                    >
                      <span>Proof</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

