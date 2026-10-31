import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { RouteMap } from '../components/map/RouteMap';
import { ConfidenceRing } from '../components/gauges/ConfidenceRing';
import { EnergyBudgetBar } from '../components/gauges/EnergyBudgetBar';
import { FanChart } from '../components/charts/FanChart';
import { MonteCarloHistogram } from '../components/charts/MonteCarloHistogram';
import { TruthBadge } from '../components/common/TruthBadge';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import { BoltIcon } from '../components/common/BoltIcon';
import { generateCounterfactualExplanations } from '../engine/explain';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Navigation,
} from 'lucide-react';

export const ProofDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    getVehicle,
    getRoutes,
    getChargers,
    getRoutePlan,
    selectedRouteId,
    setSelectedRouteId,
    scenarioInputs,
    setProofCertificateOpen,
    startJudgeMode,
  } = useVoltSureStore();

  const vehicle = getVehicle();
  const routes = getRoutes();
  const chargers = getChargers();
  const { evaluatedRoutes, recommendedRouteId, overallFeasible } = getRoutePlan();

  const activeRoute = evaluatedRoutes.find((r) => r.routeId === selectedRouteId) || evaluatedRoutes[0];
  const activeRouteDef = routes.find((r) => r.id === activeRoute.routeId) || routes[0];
  const recommendedRoute = evaluatedRoutes.find((r) => r.routeId === recommendedRouteId);

  // Counterfactual explanation generator
  const explanations = generateCounterfactualExplanations(
    activeRoute,
    activeRouteDef,
    vehicle,
    scenarioInputs,
    recommendedRoute
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumb & Route Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 3 — Decision Proof Dashboard
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Proof Before You Go
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {activeRouteDef?.viaName || 'Corridor Route'} • {activeRoute?.totalDistanceKm} km
          </p>
        </div>

        {/* Route Selector Tabs (Direct vs Route B vs Route C) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
          {routes.map((route) => {
            const pred = evaluatedRoutes.find((r) => r.routeId === route.id);
            const isSelected = route.id === selectedRouteId;
            const isFeasible = pred ? pred.isFeasibleAtTarget : false;

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFeasible ? 'bg-lime-500' : 'bg-red-500'
                  }`}
                />
                <span>{route.name.split('—')[0]}</span>
                {pred && (
                  <span className="text-[10px] text-slate-400">
                    ({(pred.pFeasibleArrival * 100).toFixed(0)}%)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Map (55%) vs Right Decision Cards (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Segment Heatmap */}
        <div className="lg:col-span-7 space-y-6">
          <RouteMap
            routes={routes}
            chargers={chargers}
            predictions={evaluatedRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            heightClass="h-[460px]"
          />

          {/* Segment-Level Energy & Heatmap Strip */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                  Segment-Level Energy Consumption Heatmap
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">
                  Physics tractive force model (Fr + Fa + Fg) with gradient & congestion deratings
                </p>
              </div>
              <span className="text-xs font-mono text-slate-600">
                Total: <strong>{Math.round(activeRoute.p50EnergyWh)} Wh</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-2 px-2">Segment</th>
                    <th className="py-2 px-2">Distance</th>
                    <th className="py-2 px-2">Grade %</th>
                    <th className="py-2 px-2">Avg Speed</th>
                    <th className="py-2 px-2">Power (W)</th>
                    <th className="py-2 px-2">Energy (Wh)</th>
                    <th className="py-2 px-2">Intensity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRoute.segmentBreakdown.map((seg, idx) => {
                    const isSteep = seg.gradePercent > 1.0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-2 font-bold text-slate-800">Leg {idx + 1}</td>
                        <td className="py-2 px-2">{seg.distanceKm} km</td>
                        <td className={`py-2 px-2 ${isSteep ? 'text-red-600 font-bold' : ''}`}>
                          {seg.gradePercent > 0 ? `+${seg.gradePercent}%` : `${seg.gradePercent}%`}
                        </td>
                        <td className="py-2 px-2">{seg.avgSpeedKmh} km/h</td>
                        <td className="py-2 px-2">{seg.powerW} W</td>
                        <td className="py-2 px-2 font-bold text-slate-900">{seg.energyWh} Wh</td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              seg.whPerKm > 32
                                ? 'bg-red-100 text-red-800'
                                : seg.whPerKm > 24
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {seg.whPerKm} Wh/km
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Verdict Card, Confidence Ring, Energy Budget & Counterfactuals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Verdict Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                  Feasibility Proof Verdict
                </span>
                <h2 className="text-base font-bold font-sans text-slate-900">
                  {activeRoute.routeName}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/drive')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs font-mono shadow-xs transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-lime-400" />
                  <span>Start Live Drive</span>
                </button>
                <button
                  onClick={() => setProofCertificateOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono shadow-xs transition"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Certificate</span>
                </button>
              </div>
            </div>

            {/* Confidence Ring Gauge */}
            <div className="flex justify-center py-2">
              <ConfidenceRing
                probability={activeRoute.pFeasibleArrival}
                reservePercent={scenarioInputs.reservePercent}
                targetThreshold={scenarioInputs.confidenceTarget}
                size={180}
                strokeWidth={14}
              />
            </div>

            {/* Plain-Language Verdict Narrative */}
            <div
              className={`p-3.5 rounded-xl border text-xs font-sans space-y-1 ${
                activeRoute.isFeasibleAtTarget
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-red-50/80 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {activeRoute.isFeasibleAtTarget ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>FEASIBLE JOURNEY AT {scenarioInputs.confidenceTarget}% TARGET</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>NOT FEASIBLE AT {scenarioInputs.confidenceTarget}% TARGET</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">
                {activeRoute.isFeasibleAtTarget
                  ? `Recommended: ${activeRoute.routeName} provides a verified en-route replenishment buffer at ${activeRoute.chargingStop?.charger.name} with ${activeRoute.chargingStop?.trustScore.trustScore}/100 trust score.`
                  : activeRoute.rejectionReason}
              </p>
              <p className="text-[10px] text-slate-500 font-mono italic pt-1 border-t border-slate-200">
                * Estimated probability of arriving with reserve intact, under stated data and model assumptions.
              </p>
            </div>

            {/* Energy Budget Bar Breakdown */}
            <EnergyBudgetBar
              usableEnergyWh={activeRoute.usableEnergyWh}
              protectedReserveWh={activeRoute.protectedReserveWh}
              p10EnergyWh={activeRoute.p10EnergyWh}
              p50EnergyWh={activeRoute.p50EnergyWh}
              p90EnergyWh={activeRoute.p90EnergyWh}
              availableAboveReserveWh={activeRoute.availableAboveReserveWh}
            />

            {/* Fallback Plan Card */}
            {activeRoute.chargingStop && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 font-bold">
                  <span>Planned Stop: {activeRoute.chargingStop.charger.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-100 text-lime-800">
                    Trust: {activeRoute.chargingStop.trustScore.trustScore}/100
                  </span>
                </div>
                {activeRoute.chargingStop.fallbackCharger && (
                  <p className="text-slate-600 text-[11px] font-sans">
                    <strong>Designated Fallback:</strong> In case of outage, plan switches dynamically at km 18 to {activeRoute.chargingStop.fallbackCharger.name}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Counterfactuals & "Why / Why Not" Drawer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-600" />
              <span>Explainable Counterfactual Analysis</span>
            </h3>

            {/* Bulletins */}
            <div className="space-y-2 text-xs text-slate-700 font-sans">
              {explanations.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  <p>{reason}</p>
                </div>
              ))}
            </div>

            {/* Actionable Recommendations to Flip Infeasible Route */}
            {explanations.advices.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Minimal Conditions to Make Feasible
                </span>
                {explanations.advices.map((advice, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 font-mono"
                  >
                    💡 {advice.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Visualization Strip: Fan Chart & Monte Carlo Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FanChart
          prediction={activeRoute}
          startingSoC={scenarioInputs.startingSoC}
          reservePercent={scenarioInputs.reservePercent}
        />
        <MonteCarloHistogram prediction={activeRoute} />
      </div>
    </div>
  );
};

