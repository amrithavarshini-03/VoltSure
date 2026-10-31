import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Zap,
  Navigation,
  BatteryCharging,
  BarChart3,
  RotateCw,
  Layers,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Plan & My EV', sublabel: 'Vehicle Sync & Destination', icon: Compass },
  { to: '/proof', label: 'Feasibility Proof', sublabel: 'Will I Make It? Verdict', icon: Zap, badge: 'Core' },
  { to: '/drive', label: 'Live Drive HUD', sublabel: 'In-Flight Simulation & Replan', icon: Navigation, badge: 'Live' },
  { to: '/chargers', label: 'Charger Trust', sublabel: 'Bayesian Decay & Status Age', icon: BatteryCharging },
  { to: '/evidence', label: 'Model Evidence', sublabel: '120-Trip Synthetic Benchmark', icon: BarChart3 },
];

export const NavigationRail: React.FC = () => {
  return (
    <>
      {/* Desktop Left Rail */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-4 justify-between h-[calc(100vh-4rem)] sticky top-16 select-none flex-shrink-0">
        <div className="space-y-2">
          <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Navigation Flow
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-lime-50 text-slate-900 border-2 border-lime-400 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
                    <div>
                      <span className="block leading-tight font-sans font-bold">{item.label}</span>
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">
                        {item.sublabel}
                      </span>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-lime-200 text-lime-900 border border-lime-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500 font-sans">
          <button
            onClick={() => {
              sessionStorage.removeItem('voltsure_splash_seen');
              window.location.reload();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-600 text-xs transition font-mono"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Replay Splash Screen</span>
          </button>

          <div className="px-3 py-1 text-[10px] text-slate-400 font-mono">
            <span>HackFront India T6.1</span>
            <span className="block text-[9px] text-slate-400">All data simulated demo</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-2.5 px-2 select-none shadow-lg">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-mono transition ${
                  isActive ? 'text-lime-700 font-bold bg-lime-50' : 'text-slate-500'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
