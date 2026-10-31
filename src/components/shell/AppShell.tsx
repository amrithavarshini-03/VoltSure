import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { Header } from './Header';
import { NavigationRail } from './NavigationRail';
import { CommandPalette } from '../modals/CommandPalette';
import { ProofCertificateModal } from '../modals/ProofCertificateModal';
import { SplashScreen } from '../splash/SplashScreen';
import { OnboardingLogin } from '../../pages/OnboardingLogin';

export const AppShell: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user } = useVoltSureStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sleek Transition Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* When Splash finishes: If not signed in, show Minimal Login & Vehicle Setup */}
      {!user ? (
        <OnboardingLogin />
      ) : (
        <>
          {/* Persistent Top Header */}
          <Header />

          <div className="flex-1 flex w-full max-w-7xl mx-auto">
            {/* Left Navigation Rail (Desktop) */}
            <NavigationRail />

            {/* Main View Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-full overflow-x-hidden">
              <Outlet />
            </main>
          </div>

          {/* Persistent Global Overlays */}
          <CommandPalette />
          <ProofCertificateModal />

          {/* Footer */}
          <footer className="hidden lg:block py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <span>Concept prototype • Simulated live demo telemetry • VoltSure AI</span>
              <span>Problem Statement T6.1: &ldquo;Will I Make It&rdquo;</span>
              <span>HackFront India 2026</span>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};
