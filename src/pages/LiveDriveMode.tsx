import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { RouteMap } from '../components/map/RouteMap';
import { BoltIcon } from '../components/common/BoltIcon';
import {
  Navigation,
  AlertTriangle,
  RotateCcw,
  Gauge,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Radio,
  FileCheck,
} from 'lucide-react';

export const LiveDriveMode: React.FC = () => {
  const {
    driveState,
    startDriveSimulation,
    stopDriveSimulation,
    triggerDriveDisruption,
    advanceDriveStep,
    getVehicle,
    getRoutes,
    getChargers,
    getRoutePlan,
    selectedRouteId,
    setProofCertificateOpen,
  } = useVoltSureStore();
  const navigate = useNavigate();

  const vehicle = getVehicle();
  const routes = getRoutes();
  const chargers = getChargers();
  const { evaluatedRoutes } = getRoutePlan();

  const [simRunning, setSimRunning] = useState(true);

  // Auto-drive simulation ticker
  useEffect(() => {
    if (!driveState.isActive) {
      startDriveSimulation();
    }

    if (!simRunning) return;

    const interval = setInterval(() => {
      advanceDriveStep(0.6); // advance 0.6 km every 2 seconds
    }, 2000);

    return () => clearInterval(interval);
  }, [simRunning, driveState.isActive, advanceDriveStep, startDriveSimulation]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Heads-up Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              LIVE IN-DRIVE TELEMETRY
            </span>
            <span className="text-xs font-mono text-slate-500">
              Vehicle: {vehicle.name.split('—')[1] || vehicle.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-1">
            Active Journey Navigation HUD
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setProofCertificateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-mono text-slate-700 shadow-xs transition"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Feasibility Pass</span>
          </button>

          <button
            onClick={() => {
              stopDriveSimulation();
              navigate('/proof');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono transition"
          >
            <span>Exit Drive Mode</span>
          </button>
        </div>
      </div>

      {/* Main HUD Gauge Cluster */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Speedometer */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Current Speed
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {driveState.speedKmh}
            </span>
            <span className="text-xs font-mono text-slate-500">km/h</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold block">
            Arterial Free Flow
          </span>
        </div>

        {/* Live Battery SoC */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Live Battery State
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold font-mono text-lime-700">
              {driveState.currentSoC}%
            </span>
            <span className="text-xs font-mono text-slate-500">SoC</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Protected 10% Reserve Intact
          </span>
        </div>

        {/* Trip Progress */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Distance Covered
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {driveState.currentKm}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 41.5 km</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {((driveState.currentKm / 41.5) * 100).toFixed(0)}% Completed
          </span>
        </div>

        {/* Estimated Arrival Time */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
            Estimated Remaining
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {driveState.etaMinutes}
            </span>
            <span className="text-xs font-mono text-slate-500">mins</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-semibold block">
            On Schedule
          </span>
        </div>
      </div>

      {/* Real-Time Turn-by-Turn Guidance Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          driveState.isRerouted
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-lime-50/80 border-lime-300 text-lime-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              driveState.isRerouted
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-lime-200 text-lime-900 border-lime-300'
            }`}
          >
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
              {driveState.isRerouted ? 'Dynamic Replan Active' : 'Next Navigation Step'}
            </span>
            <p className="font-heading font-bold text-sm sm:text-base">
              {driveState.nextStep}
            </p>
          </div>
        </div>

        {/* Interactive Event Simulator Button */}
        {!driveState.isRerouted ? (
          <button
            onClick={triggerDriveDisruption}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono shadow-sm transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Simulate Charger Outage</span>
          </button>
        ) : (
          <div className="flex-shrink-0 text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-700 px-2.5 py-1 rounded-md bg-white border border-emerald-300 block">
              ✓ Fallback Station Locked
            </span>
          </div>
        )}
      </div>

      {/* Interactive Map Tracking the Trip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <RouteMap
          routes={routes}
          chargers={chargers}
          predictions={evaluatedRoutes}
          selectedRouteId={selectedRouteId}
          heightClass="h-[420px]"
        />
      </div>
    </div>
  );
};

