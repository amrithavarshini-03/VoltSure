import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { BoltIcon } from '../common/BoltIcon';
import { GlobalSimulatedDataBanner } from '../common/ProvenanceChip';
import { TruthModeToggle } from '../common/TruthModeToggle';
import { AuthModal } from '../modals/AuthModal';
import { AICopilotModal } from '../modals/AICopilotModal';
import { Command, LogIn, LogOut, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, telemetry, scenarioInputs, setCommandPaletteOpen, logoutUser } = useVoltSureStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);

  return (
    <>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <AICopilotModal
        isOpen={copilotModalOpen}
        onClose={() => setCopilotModalOpen(false)}
      />

      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Connected Chip */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-2xl bg-lime-100 border border-lime-300 text-lime-700 group-hover:scale-105 transition-transform shadow-xs">
                <BoltIcon size={20} className="text-lime-700" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                  VoltSure <span className="text-lime-600 font-mono text-base">AI</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:block">
                  Decision Proof Engine
                </span>
              </div>
            </Link>

            {/* Connected Vehicle Status (if logged in) */}
            {user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-50 border border-lime-300 text-xs font-mono text-slate-800 hover:bg-lime-100 transition shadow-xs"
                title="Vehicle connected via live telematics. Click to manage."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">{telemetry.licensePlate}</span>
                <span className="text-lime-800">({scenarioInputs.startingSoC}% SoC)</span>
                <span className="text-[10px] text-slate-400 font-sans">Synced</span>
              </button>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* AI Copilot Button */}
            <button
              onClick={() => setCopilotModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 text-xs font-bold font-mono shadow-xs transition"
              title="Open VoltSure AI Route Copilot"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Simulated Data Badge */}
            <div className="hidden lg:block">
              <GlobalSimulatedDataBanner />
            </div>

            {/* Truth Mode Toggle */}
            <TruthModeToggle />

            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-mono transition shadow-xs"
              title="Open Command Palette (Ctrl+K)"
            >
              <Command className="w-3.5 h-3.5 text-slate-400" />
              <kbd className="text-[10px] font-semibold text-slate-500">Ctrl+K</kbd>
            </button>

            {/* Sign In / User Profile & Sign Out Button */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                  title="Click to view vehicle profile"
                >
                  <span className="text-xs font-bold text-slate-800 font-sans hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white shadow-xs"
                  />
                </button>
                <button
                  onClick={() => logoutUser()}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition text-xs font-mono"
                  title="Sign Out / Switch EV"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs font-mono shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
