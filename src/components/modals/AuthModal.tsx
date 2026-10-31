import React, { useState } from 'react';
import { useVoltSureStore, DEMO_USERS, UserProfile } from '../../store/useVoltSureStore';
import { VEHICLE_PROFILES } from '../../data/vehicles';
import { BoltIcon } from '../common/BoltIcon';
import {
  LogOut,
  LogIn,
  User,
  Car,
  CheckCircle2,
  Radio,
  X,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, telemetry, loginUser, logoutUser, syncVehicleTelemetry } = useVoltSureStore();
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const handleSelectProfile = (profile: UserProfile) => {
    loginUser(profile);
    syncVehicleTelemetry(profile.defaultVehicleId);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const customProfile: UserProfile = {
      id: `user-${Date.now()}`,
      name: customName,
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@voltsure.in`,
      phone: customPhone || '+91 98400 00000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'EV Driver',
      defaultVehicleId: 'ref-ola-s1z-3kwh',
    };

    loginUser(customProfile);
    syncVehicleTelemetry(customProfile.defaultVehicleId);
    onClose();
  };

  const handleSignOut = () => {
    logoutUser();
    onClose();
  };

  const currentVehicle = VEHICLE_PROFILES.find((v) => v.id === telemetry.vehicleId) || VEHICLE_PROFILES[0];

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-lime-100 border border-lime-300 text-lime-700">
              <BoltIcon size={18} className="text-lime-700" />
            </div>
            <div>
              <span className="font-heading font-bold text-slate-900 text-sm block">
                {user ? 'Driver Profile & EV Account' : 'Sign In to VoltSure AI'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {user ? 'Connected Session' : 'Authenticate & link your vehicle'}
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {user ? (
            /* Signed In View: Account Details & Sign Out Button */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-300 shadow-xs"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-slate-900 font-sans">
                      {user.name}
                    </h3>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-sans">{user.role}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>

              {/* Linked Vehicle Info */}
              <div className="p-3.5 rounded-2xl bg-lime-50/70 border border-lime-300 space-y-1 font-sans text-xs">
                <span className="text-[10px] font-mono text-lime-900 uppercase font-bold block">
                  Connected Vehicle Telematics
                </span>
                <p className="font-bold text-slate-900">
                  {currentVehicle.name.split('—')[1] || currentVehicle.name}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 pt-1">
                  <span>Plate: <strong>{telemetry.licensePlate}</strong></span>
                  <span>Battery: <strong className="text-lime-800">{telemetry.currentSoC}% SoC</strong></span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs font-mono border border-red-200 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Driver Account</span>
              </button>
            </div>
          ) : (
            /* Signed Out View: Choose Profile or Custom Sign In */
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-sans">
                  Choose a Driver Profile to Sign In
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Select a test driver profile or enter your phone/name to link live EV telematics.
                </p>
              </div>

              {!isCustomMode ? (
                <>
                  <div className="space-y-2">
                    {DEMO_USERS.map((profile) => {
                      const veh = VEHICLE_PROFILES.find((v) => v.id === profile.defaultVehicleId)!;
                      return (
                        <div
                          key={profile.id}
                          onClick={() => handleSelectProfile(profile)}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-lime-500 hover:bg-lime-50/50 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={profile.avatar}
                              alt={profile.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-300"
                            />
                            <div>
                              <p className="font-bold text-xs text-slate-900 font-sans group-hover:text-lime-900">
                                {profile.name}
                              </p>
                              <span className="text-[10px] text-slate-500 block">
                                {profile.role}
                              </span>
                              <span className="text-[10px] font-mono text-lime-700 block">
                                🚗 {veh.name.split('—')[1] || veh.name}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-lime-700 bg-lime-100 px-2.5 py-1 rounded-lg">
                            Sign In
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setIsCustomMode(true)}
                    className="w-full text-center text-xs font-mono text-slate-500 hover:text-slate-800 underline pt-1"
                  >
                    Or enter custom driver credentials ›
                  </button>
                </>
              ) : (
                <form onSubmit={handleCustomLogin} className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Driver Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand R."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-sans text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">Phone / Mobile</label>
                    <input
                      type="text"
                      placeholder="+91 98400 12345"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-xs font-sans text-slate-900"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="w-1/2 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-600 hover:bg-slate-100"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono shadow-xs"
                    >
                      Sign In & Link EV
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Encrypted BLE / Cloud Handshake</span>
          <span className="text-lime-700 font-bold">VoltSure Mobility Core</span>
        </div>
      </div>
    </div>
  );
};

