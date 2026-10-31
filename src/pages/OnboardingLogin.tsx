import React, { useState } from 'react';
import { useVoltSureStore, DEMO_USERS, UserProfile } from '../store/useVoltSureStore';
import { VEHICLE_PROFILES } from '../data/vehicles';
import { ORIGIN_HUBS, DESTINATION_CORRIDORS } from '../data/corridors';
import { BoltIcon } from '../components/common/BoltIcon';
import {
  Car,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Radio,
  CheckCircle2,
  User,
  Sliders,
  Check,
  Loader2,
  MapPin,
} from 'lucide-react';

interface OnboardingLoginProps {
  onSuccess?: () => void;
}

export const OnboardingLogin: React.FC<OnboardingLoginProps> = ({ onSuccess }) => {
  const { loginUser, setCustomLocations } = useVoltSureStore();

  // Selected preset or custom
  const [selectedUserIndex, setSelectedUserIndex] = useState<number>(0);
  const [driverName, setDriverName] = useState('Arun Kumar');
  const [driverRole, setDriverRole] = useState('Personal EV Commuter');
  const [vehicleId, setVehicleId] = useState('ref-ola-s1z-3kwh');
  const [licensePlate, setLicensePlate] = useState('TN-38-BZ-4102');
  const [startingSoC, setStartingSoC] = useState<number>(42);
  const [originText, setOriginText] = useState('Gandhipuram Transit Center, Coimbatore');
  const [destText, setDestText] = useState('Anaikatti Foothills (Western Ghats)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedVehicle = VEHICLE_PROFILES.find((v) => v.id === vehicleId) || VEHICLE_PROFILES[0];

  // Quick 1-click preset selector
  const handleSelectPreset = (index: number) => {
    setSelectedUserIndex(index);
    const demo = DEMO_USERS[index];
    setDriverName(demo.name);
    setDriverRole(demo.role);
    setVehicleId(demo.defaultVehicleId);

    if (demo.defaultVehicleId.includes('cargo')) {
      setLicensePlate('TN-38-CG-9011');
      setStartingSoC(35);
    } else if (demo.defaultVehicleId.includes('escooter')) {
      setLicensePlate('TN-38-EF-5520');
      setStartingSoC(58);
    } else {
      setLicensePlate('TN-38-BZ-4102');
      setStartingSoC(42);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!driverName.trim()) return;

    setIsSubmitting(true);
    setStatusMessage('Pairing vehicle CAN registers...');

    setTimeout(() => {
      setStatusMessage('Syncing battery SoC & cell temperature...');
    }, 250);

    setTimeout(() => {
      setStatusMessage('Calibrated! Launching Dashboard...');
    }, 500);

    setTimeout(() => {
      const demoUser = DEMO_USERS[selectedUserIndex] || DEMO_USERS[0];
      const profile: UserProfile = {
        id: demoUser ? demoUser.id : `user-${Date.now()}`,
        name: driverName.trim(),
        email: `${driverName.toLowerCase().replace(/\s+/g, '.')}@voltsure.in`,
        phone: '+91 98401 23456',
        avatar: demoUser
          ? demoUser.avatar
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: driverRole,
        defaultVehicleId: vehicleId,
      };

      setCustomLocations(originText, destText);

      loginUser(profile, {
        vehicleId,
        licensePlate: licensePlate.trim().toUpperCase() || 'TN-38-BZ-4102',
        currentSoC: startingSoC,
        connectionType: 'Cloud Telematics',
        isConnected: true,
        lastSynced: 'Just now (BMS Handshake Verified)',
      });

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
    }, 800);
  };

  // Quick SoC preset chips
  const socPresets = [30, 42, 60, 80, 100];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-telemetry-grid">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl p-6 sm:p-10 space-y-8 animate-fadeIn relative">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-lime-100 border border-lime-300 text-lime-700 shadow-xs">
              <BoltIcon size={26} className="text-lime-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900">
                  VoltSure <span className="text-lime-600 font-mono">AI</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-200 uppercase">
                  T6.1 Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Sign in & pair vehicle CAN telematics to initialize route uncertainty calculations
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Presets */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>1-Click Demo Profiles (Instant Test)</span>
            <span className="text-[10px] text-lime-700 font-normal">Select to auto-populate</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_USERS.map((demo, idx) => {
              const isSelected = selectedUserIndex === idx;
              const veh = VEHICLE_PROFILES.find((v) => v.id === demo.defaultVehicleId);
              const soc = demo.defaultVehicleId.includes('cargo')
                ? 35
                : demo.defaultVehicleId.includes('escooter')
                ? 58
                : 42;

              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-lime-500 bg-lime-50/70 shadow-sm ring-2 ring-lime-400/40'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={demo.avatar}
                      alt={demo.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 font-sans truncate">
                        {demo.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{demo.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-200/60">
                    <span className="text-slate-600 truncate max-w-[90px]">
                      {veh?.name.split('—')[1]?.trim() || veh?.name}
                    </span>
                    <span className="font-bold text-lime-700 px-1.5 py-0.5 bg-white rounded-md border border-lime-200">
                      {soc}% SoC
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-lime-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Minimal Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Driver Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 block">
                Driver Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition shadow-2xs"
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* License / Registration Plate */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 block">
                EV Registration Plate
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="e.g. TN-38-BZ-4102"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs uppercase focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition shadow-2xs"
                />
                <Car className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>

          {/* Vehicle Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 block">
              Select Vehicle Energy Model
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition shadow-2xs cursor-pointer"
            >
              {VEHICLE_PROFILES.map((veh) => (
                <option key={veh.id} value={veh.id}>
                  {veh.name} • {veh.claimedCapacityKWh} kWh pack ({veh.claimedRangeKm} km claimed)
                </option>
              ))}
            </select>
          </div>

          {/* Route Geography: Origin & Destination */}
          {/* Route Geography: Manually Typeable Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-600" />
                  <span>Starting Origin</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Type freely</span>
              </label>
              <input
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                placeholder="e.g. Gandhipuram, Ukkadam, Peelamedu..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-lime-600" />
                  <span>Target Destination</span>
                </span>
                <span className="text-[10px] text-lime-700 font-normal">Type freely</span>
              </label>
              <input
                type="text"
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                placeholder="e.g. Anaikatti, Ooty, Marudhamalai, Airport..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-sans text-xs focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Battery SoC Slider & Presets */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-lime-600" />
                Current Battery State of Charge (SoC)
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-2xl font-black text-lime-700">{startingSoC}%</span>
                <span className="text-xs text-slate-400 font-sans">
                  (~{((startingSoC / 100) * selectedVehicle.claimedCapacityKWh).toFixed(2)} kWh)
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={startingSoC}
              onChange={(e) => setStartingSoC(parseInt(e.target.value, 10))}
              className="w-full accent-lime-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            {/* Quick SoC chips */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Presets:</span>
              <div className="flex gap-1.5">
                {socPresets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setStartingSoC(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      startingSoC === val
                        ? 'bg-lime-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {val}% {val === 42 ? '★ Challenge' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connected Vehicle Live Twin Specs */}
          <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Pack Capacity</span>
              <span className="font-bold text-slate-800">{selectedVehicle.claimedCapacityKWh} kWh</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Curb Mass</span>
              <span className="font-bold text-slate-800">{selectedVehicle.massKg} kg</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase block">Reserve Buffer</span>
              <span className="font-bold text-emerald-700">10% Locked</span>
            </div>
          </div>

          {/* Submission Feedback or Connect Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !driverName.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 hover:from-lime-400 hover:to-emerald-300 text-slate-950 font-black font-heading text-base tracking-wide shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>{statusMessage || 'Connecting vehicle...'}</span>
                </>
              ) : (
                <>
                  <span>Connect Vehicle & Launch Dashboard</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Physics-calibrated energy twin • Deterministic Mulberry32 seeded engine</span>
        </div>
      </div>
    </div>
  );
};

