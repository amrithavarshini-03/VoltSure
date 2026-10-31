import React, { useState } from 'react';
import { useVoltSureStore, DEMO_USERS, UserProfile } from '../../store/useVoltSureStore';
import { VEHICLE_PROFILES } from '../../data/vehicles';
import { BoltIcon } from '../common/BoltIcon';
import {
  Car,
  CheckCircle2,
  Cpu,
  Radio,
  ShieldCheck,
  User,
  Zap,
  ArrowRight,
  Sparkles,
  RotateCw,
  X,
} from 'lucide-react';

interface VehicleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VehicleConnectModal: React.FC<VehicleConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, telemetry, loginUser, syncVehicleTelemetry } = useVoltSureStore();
  const [selectedUser, setSelectedUser] = useState<UserProfile>(user || DEMO_USERS[0]);
  const [step, setStep] = useState<'SELECT' | 'CONNECTING' | 'SUCCESS'>('SELECT');
  const [handshakeLogs, setHandshakeLogs] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleStartPairing = async (profile: UserProfile) => {
    setSelectedUser(profile);
    setStep('CONNECTING');
    setHandshakeLogs(['Initiating BLE & Cloud Telematics handshake...']);

    await new Promise((r) => setTimeout(r, 600));
    setHandshakeLogs((prev) => [
      ...prev,
      `Connecting to vehicle VIN: ${telemetry.vin}...`,
    ]);

    await new Promise((r) => setTimeout(r, 650));
    setHandshakeLogs((prev) => [
      ...prev,
      'Querying On-Board BMS State-of-Charge & Health registers...',
    ]);

    await new Promise((r) => setTimeout(r, 700));
    const veh = VEHICLE_PROFILES.find((v) => v.id === profile.defaultVehicleId) || VEHICLE_PROFILES[0];
    const soc = profile.defaultVehicleId.includes('cargo') ? 35 : profile.defaultVehicleId.includes('escooter') ? 58 : 42;

    setHandshakeLogs((prev) => [
      ...prev,
      `Telematics Handshake OK! SoC: ${soc}% | Health: 96% | Cell Temp: 32.4°C`,
    ]);

    loginUser(profile);
    await syncVehicleTelemetry(profile.defaultVehicleId);

    setStep('SUCCESS');
    setTimeout(() => {
      onClose();
      setStep('SELECT');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-lime-100 border border-lime-300 text-lime-700">
              <BoltIcon size={18} className="text-lime-700" />
            </div>
            <div>
              <span className="font-heading font-bold text-slate-900 text-sm block">
                Connect & Link Your Electric Vehicle
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Live BMS Telematics & Driver Authentication
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {step === 'SELECT' && (
            <>
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Select User & Vehicle Profile
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  How does VoltSure know your EV? The app authenticates your driver account and pairs directly with your vehicle&rsquo;s CAN/BMS telematics unit.
                </p>
              </div>

              {/* Demo Profiles */}
              <div className="space-y-2.5">
                {DEMO_USERS.map((profile) => {
                  const veh = VEHICLE_PROFILES.find((v) => v.id === profile.defaultVehicleId)!;
                  const isCurrent = user?.id === profile.id;

                  return (
                    <div
                      key={profile.id}
                      onClick={() => handleStartPairing(profile)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between ${
                        isCurrent
                          ? 'bg-lime-50/80 border-lime-500 ring-2 ring-lime-400/50 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-300"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 font-sans">
                              {profile.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-lime-200 text-lime-900">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-sans block">
                            {profile.role}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-lime-700 block mt-0.5">
                            🚗 {veh.name.split('—')[1] || veh.name} ({veh.claimedCapacityKWh} kWh)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <button className="px-3 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-bold transition">
                          Sync EV
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {step === 'CONNECTING' && (
            <div className="py-6 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-lime-200 animate-ping opacity-60" />
                <div className="w-14 h-14 rounded-full bg-lime-100 border border-lime-400 flex items-center justify-center">
                  <Radio className="w-7 h-7 text-lime-700 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="font-heading font-bold text-base text-slate-900">
                  Pairing with Connected Vehicle...
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Synchronizing battery telemetry registers
                </p>
              </div>

              {/* Handshake Telemetry Logs */}
              <div className="bg-slate-900 text-lime-400 p-3.5 rounded-xl text-left font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto border border-slate-800">
                {handshakeLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-slate-500">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-heading font-bold text-lg text-slate-900">
                Vehicle Telematics Synced!
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Live BMS connected • Battery state updated in real-time
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Connection: Bluetooth BLE / 4G eSIM Telematics</span>
          <span className="text-lime-700 font-bold">100% End-to-End Live Sync</span>
        </div>
      </div>
    </div>
  );
};

