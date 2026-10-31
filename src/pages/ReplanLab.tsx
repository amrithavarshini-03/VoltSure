import React from 'react';
import { useVoltSureStore, EventLogEntry } from '../store/useVoltSureStore';
import { SIMULATED_TELEMETRY_STREAM } from '../data/telemetry';
import { RouteMap } from '../components/map/RouteMap';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  RotateCcw,
  AlertTriangle,
  Flame,
  Car,
  Weight,
  BatteryLow,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const ReplanLab: React.FC = () => {
  const {
    replanActiveEvent,
    replanTelemetryOffset,
    replanEventLog,
    triggerReplanEvent,
    resetReplanScenario,
    setReplanTelemetryOffset,
    getVehicle,
    getRoutes,
    getChargers,
    getRoutePlan,
    selectedRouteId,
    setSelectedRouteId,
  } = useVoltSureStore();

  const vehicle = getVehicle();
  const routes = getRoutes();
  const chargers = getChargers();
  const { evaluatedRoutes, recommendedRouteId } = getRoutePlan();

  // Find telemetry point matching scrubber
  const currentTelemetryIndex = Math.min(
    Math.floor(replanTelemetryOffset / 120),
    SIMULATED_TELEMETRY_STREAM.length - 1
  );
  const currentTelemetry = SIMULATED_TELEMETRY_STREAM[currentTelemetryIndex];

  const activeRoute = evaluatedRoutes.find((r) => r.routeId === selectedRouteId) || evaluatedRoutes[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 5 — Replan Lab
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Dynamic In-Flight Replan & Scenario Replay
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Scrub live BMS telemetry and simulate real-time road disruptions to test reactive decision proving.
          </p>
        </div>

        <button
          onClick={resetReplanScenario}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono text-slate-700 shadow-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Disruption Scenario</span>
        </button>
      </div>

      {/* Disruption Event Trigger Buttons Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Simulate Mid-Trip Real-World Disruption
          </span>
          {replanActiveEvent !== 'none' && (
            <span className="text-xs font-mono font-bold text-red-700 px-2.5 py-0.5 rounded bg-red-100 border border-red-200 animate-pulse">
              ACTIVE DISRUPTION: {replanActiveEvent.toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => triggerReplanEvent('charger_failed')}
            className={`p-3 rounded-xl border text-left transition-all ${replanActiveEvent === 'charger_failed'
              ? 'bg-red-50 border-red-500 shadow-xs ring-1 ring-red-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-600 mb-1" />
            <p className="font-bold text-xs font-sans text-slate-900">Charger Fails</p>
            <p className="text-[10px] text-slate-500 font-mono">GreenGrid goes offline</p>
          </button>

          <button
            onClick={() => triggerReplanEvent('traffic_worsened')}
            className={`p-3 rounded-xl border text-left transition-all ${replanActiveEvent === 'traffic_worsened'
              ? 'bg-amber-50 border-amber-500 shadow-xs ring-1 ring-amber-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
          >
            <Car className="w-4 h-4 text-amber-600 mb-1" />
            <p className="font-bold text-xs font-sans text-slate-900">Traffic Surge</p>
            <p className="text-[10px] text-slate-500 font-mono">Speed drops to 14 km/h</p>
          </button>

          <button
            onClick={() => triggerReplanEvent('temp_spike')}
            className={`p-3 rounded-xl border text-left transition-all ${replanActiveEvent === 'temp_spike'
              ? 'bg-orange-50 border-orange-500 shadow-xs ring-1 ring-orange-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
          >
            <Flame className="w-4 h-4 text-orange-600 mb-1" />
            <p className="font-bold text-xs font-sans text-slate-900">Temp Spike (41°C)</p>
            <p className="text-[10px] text-slate-500 font-mono">Thermal pack derating</p>
          </button>

          <button
            onClick={() => triggerReplanEvent('payload_increased')}
            className={`p-3 rounded-xl border text-left transition-all ${replanActiveEvent === 'payload_increased'
              ? 'bg-purple-50 border-purple-500 shadow-xs ring-1 ring-purple-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
          >
            <Weight className="w-4 h-4 text-purple-600 mb-1" />
            <p className="font-bold text-xs font-sans text-slate-900">Heavy Cargo (+35kg)</p>
            <p className="text-[10px] text-slate-500 font-mono">Grade force surge</p>
          </button>

          <button
            onClick={() => triggerReplanEvent('soc_drop')}
            className={`p-3 rounded-xl border text-left transition-all ${replanActiveEvent === 'soc_drop'
              ? 'bg-rose-50 border-rose-500 shadow-xs ring-1 ring-rose-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
          >
            <BatteryLow className="w-4 h-4 text-rose-600 mb-1" />
            <p className="font-bold text-xs font-sans text-slate-900">SoC Deficit (-6%)</p>
            <p className="text-[10px] text-slate-500 font-mono">BMS lower than expected</p>
          </button>
        </div>
      </div>

      {/* Telemetry Timeline Scrubber */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-slate-800 uppercase tracking-wider">
            In-Flight BMS Telemetry Scrubber (40-Minute Simulated Stream)
          </span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-900">
            Time: +{Math.floor(replanTelemetryOffset / 60)}m {replanTelemetryOffset % 60}s
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="2400"
          step="120"
          value={replanTelemetryOffset}
          onChange={(e) => setReplanTelemetryOffset(Number(e.target.value))}
          className="w-full accent-lime-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />

        {/* Live BMS Readings Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Distance Traveled</span>
            <span className="font-bold text-slate-900 text-sm">{currentTelemetry.distanceCompletedKm} km</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Live BMS SoC</span>
            <span className="font-bold text-lime-700 text-sm">{currentTelemetry.currentSoC}%</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Pack Voltage</span>
            <span className="font-bold text-slate-900 text-sm">{currentTelemetry.packVoltageV} V</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Instant Current</span>
            <span className="font-bold text-slate-900 text-sm">{currentTelemetry.packCurrentA} A</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Pack Temperature</span>
            <span className="font-bold text-amber-700 text-sm">{currentTelemetry.batteryTempC}°C</span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase block">Instant Power</span>
            <span className="font-bold text-slate-900 text-sm">{currentTelemetry.instantaneousPowerW} W</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map with Ghost Replan vs Before/After & Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map with Ghost Path (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <RouteMap
            routes={routes}
            chargers={chargers}
            predictions={evaluatedRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            heightClass="h-[440px]"
          />
        </div>

        {/* Before / After Deltas & Event Log (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Before vs After Comparison Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Before vs After Replan Comparison
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Pre-Disruption Baseline</span>
                <p className="font-bold text-slate-900 text-lg">94% Feasible</p>
                <p className="text-slate-500 text-[11px]">Primary: GreenGrid Hub</p>
                <p className="text-slate-500 text-[11px]">Duration: 52 mins</p>
              </div>

              <div className="p-3 bg-lime-50 rounded-xl border border-lime-300 space-y-1">
                <span className="text-lime-900 text-[10px] uppercase font-semibold">Active Dynamic Plan</span>
                <p
                  className={`font-bold text-lg ${activeRoute.isFeasibleAtTarget ? 'text-emerald-700' : 'text-red-600'
                    }`}
                >
                  {(activeRoute.pFeasibleArrival * 100).toFixed(0)}% Feasible
                </p>
                <p className="text-slate-700 text-[11px]">
                  {replanActiveEvent === 'charger_failed' ? 'Fallback: Kavundampalayam' : 'Adjusted Buffer'}
                </p>
                <p className="text-slate-700 text-[11px]">Duration: {activeRoute.durationMinutes} mins (+{activeRoute.durationMinutes - 52}m)</p>
              </div>
            </div>
          </div>

          {/* Sequential Event Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Autonomous Decision Audit Log
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {replanEventLog.length} events recorded
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {replanEventLog.map((log: EventLogEntry) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900">{log.title}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-sans">{log.description}</p>
                  <div className="text-[11px] font-mono font-semibold text-lime-800 bg-lime-100/60 px-2 py-0.5 rounded w-fit">
                    ↳ {log.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

