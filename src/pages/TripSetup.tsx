import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { VEHICLE_PROFILES } from '../data/vehicles';
import { BoltIcon } from '../components/common/BoltIcon';
import { TruthBadge } from '../components/common/TruthBadge';
import {
  ArrowRight,
  RotateCcw,
  Sliders,
  Sparkles,
  Gauge,
  Thermometer,
  Weight,
  Car,
  Shield,
  Zap,
} from 'lucide-react';

export const TripSetup: React.FC = () => {
  const {
    scenarioInputs,
    setScenarioInputs,
    resetScenarioDefaults,
    getVehicle,
    getRoutes,
    getRoutePlan,
    setSelectedRouteId,
  } = useVoltSureStore();
  const navigate = useNavigate();

  const currentVehicle = getVehicle();
  const routes = getRoutes();
  const plan = getRoutePlan();

  // Simple nominal dashboard DTE estimation: (SoC / 100) * claimedRange
  const naiveDashboardRangeKm = Math.round((scenarioInputs.startingSoC / 100) * currentVehicle.claimedRangeKm);

  // Safest evaluated route
  const recommendedRoute = plan.evaluatedRoutes.find((r) => r.routeId === plan.recommendedRouteId) || plan.evaluatedRoutes[0];

  const handleProveJourney = () => {
    if (plan.recommendedRouteId) {
      setSelectedRouteId(plan.recommendedRouteId);
    }
    navigate('/proof');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider block">
            Screen 2 — Scenario Lab
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-1">
            Trip Setup & Boundary Simulation
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Calibrate battery state, environmental physics, and confidence criteria in real time.
          </p>
        </div>

        <button
          onClick={resetScenarioDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono text-slate-700 transition shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Live "Dashboard Says vs VoltSure Says" Preview Strip */}
      <div className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-card grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Naive Dashboard DTE */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Standard Dashboard Says (DTE)
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
              Linear Division
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-3xl text-slate-900">
              {naiveDashboardRangeKm} km
            </span>
            <span className="text-xs text-emerald-600 font-medium font-sans">
              &ldquo;Looks safe for 35 km trip&rdquo;
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-sans">
            Blinded to 320m uphill ascent, 33°C heat derating, and stop-start congestion.
          </p>
        </div>

        {/* Right: VoltSure Probabilistic Verdict */}
        <div className="p-4 rounded-xl bg-lime-50/70 border border-lime-300 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-lime-900 uppercase tracking-wider font-semibold">
              VoltSure AI Engine Says
            </span>
            <TruthBadge source="2,000 Monte Carlo runs with protected reserve" unit="%">
              <span className="px-2 py-0.5 rounded bg-lime-200 text-lime-900 font-mono text-[10px] font-bold">
                PROVENANCE: SIMULATED
              </span>
            </TruthBadge>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono font-bold text-3xl ${
                recommendedRoute.isFeasibleAtTarget ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {(recommendedRoute.pFeasibleArrival * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-700 font-medium font-sans">
              Estimated arrival probability (Route B recommended)
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-sans">
            Direct Route A rejected due to reserve breach; safe corridor via GreenGrid Karamadai required.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Sliders & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vehicle Profile Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Vehicle Profile Selection
              </label>
              <span className="text-[10px] font-mono text-slate-400">Reference Specification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VEHICLE_PROFILES.map((veh) => {
                const isSelected = veh.id === scenarioInputs.vehicleId;
                return (
                  <button
                    key={veh.id}
                    onClick={() => setScenarioInputs({ vehicleId: veh.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-lime-50 border-lime-500 shadow-xs ring-1 ring-lime-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 font-sans">{veh.name.split('—')[1] || veh.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {veh.claimedCapacityKWh} kWh
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Claimed: {veh.claimedRangeKm} km • {veh.massKg} kg
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Non-negotiable reference note */}
            <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
              * Note: Reference vehicle profiles use claimed manufacturer figures from user-supplied references; not independently validated. No OEM partnership claimed.
            </p>
          </div>

          {/* Sliders Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Boundary & Environmental Variables
            </h3>

            {/* Starting SoC Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-lime-600" />
                  <span>Starting State of Charge (SoC)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                  {scenarioInputs.startingSoC}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="100"
                step="1"
                value={scenarioInputs.startingSoC}
                onChange={(e) => setScenarioInputs({ startingSoC: Number(e.target.value) })}
                className="w-full accent-lime-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>15% (Critical)</span>
                <span className="font-bold text-lime-800">42% (Demo Default)</span>
                <span>100% (Full)</span>
              </div>
            </div>

            {/* Ambient Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ambient Temperature</span>
                </span>
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                  {scenarioInputs.ambientTempC}°C
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="45"
                step="1"
                value={scenarioInputs.ambientTempC}
                onChange={(e) => setScenarioInputs({ ambientTempC: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>18°C (Cool)</span>
                <span className="font-bold text-amber-800">33°C (Coimbatore Heat)</span>
                <span>45°C (Extreme Derate)</span>
              </div>
            </div>

            {/* Additional Cargo / Passenger Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-purple-600" />
                  <span>Payload & Luggage (Rider is +75kg)</span>
                </span>
                <span className="font-mono font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                  {scenarioInputs.payloadKg} kg (Total: {scenarioInputs.payloadKg + 75} kg)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={scenarioInputs.payloadKg}
                onChange={(e) => setScenarioInputs({ payloadKg: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Traffic Level Radio Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>Urban Traffic Density</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['free', 'moderate', 'heavy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setScenarioInputs({ trafficLevel: lvl })}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold capitalize border transition-all ${
                      scenarioInputs.trafficLevel === lvl
                        ? 'bg-lime-50 text-slate-900 border-lime-500 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Protected Reserve % & Confidence Target q */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Protected Reserve (%)</span>
                </label>
                <select
                  value={scenarioInputs.reservePercent}
                  onChange={(e) => setScenarioInputs({ reservePercent: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                >
                  <option value="5">5% (Minimal)</option>
                  <option value="10">10% (Recommended Protected)</option>
                  <option value="15">15% (Cautious)</option>
                  <option value="20">20% (Ultra Defensive)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-lime-600" />
                  <span>Confidence Target (q)</span>
                </label>
                <select
                  value={scenarioInputs.confidenceTarget}
                  onChange={(e) => setScenarioInputs({ confidenceTarget: Number(e.target.value) as 80 | 90 | 95 })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800"
                >
                  <option value="80">80% Confidence</option>
                  <option value="90">90% Confidence (Strict Target)</option>
                  <option value="95">95% Mission Critical</option>
                </select>
              </div>
            </div>

            {/* Rider History Trips (Confidence Calibration Width) */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Rider History Reference Calibration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 25, 120] as const).map((trips) => (
                  <button
                    key={trips}
                    onClick={() => setScenarioInputs({ riderHistoryTrips: trips })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-mono border transition ${
                      scenarioInputs.riderHistoryTrips === trips
                        ? 'bg-sky-50 text-sky-900 border-sky-400 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {trips} trips {trips === 3 ? '(Wide σ)' : trips === 120 ? '(Calibrated)' : '(Normal)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Routes Summary & Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Candidate Routes (Hero Scenario)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Coimbatore → Anaikatti</span>
            </div>

            <div className="space-y-3">
              {routes.map((route) => {
                const pred = plan.evaluatedRoutes.find((r) => r.routeId === route.id);
                const isRec = route.id === plan.recommendedRouteId;

                return (
                  <div
                    key={route.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isRec
                        ? 'bg-lime-50/50 border-lime-400 ring-1 ring-lime-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 font-sans">
                        {route.name}
                      </span>
                      {pred && (
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            pred.isFeasibleAtTarget
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {(pred.pFeasibleArrival * 100).toFixed(0)}% Feasible
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 mb-2">
                      {route.tagline}
                    </p>

                    <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                      <div>Dist: <strong>{route.totalDistanceKm} km</strong></div>
                      <div>Gain: <strong>+{route.elevationGainM}m</strong></div>
                      <div>ETA: <strong>{route.estDurationMinutes}m</strong></div>
                    </div>

                    {isRec && (
                      <span className="inline-block mt-2 text-[10px] font-mono font-bold text-lime-800 uppercase tracking-wider">
                        ★ Recommended Safe Plan
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleProveJourney}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-[1.01]"
            >
              <span>Prove This Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
