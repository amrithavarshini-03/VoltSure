import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import {
  Search,
  Compass,
  Zap,
  Navigation,
  BatteryCharging,
  BarChart3,
  ShieldCheck,
  Radio,
  RotateCcw,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleTruthMode,
    resetScenarioDefaults,
  } = useVoltSureStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Global key listener for Ctrl+K, Cmd+K, and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const actions = [
    {
      id: 'nav-plan',
      category: 'Navigation',
      label: 'Plan & My EV (Dashboard)',
      icon: <Compass className="w-4 h-4 text-sky-600" />,
      run: () => { navigate('/'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-proof',
      category: 'Navigation',
      label: 'Journey Feasibility Proof (Verdict)',
      icon: <Zap className="w-4 h-4 text-lime-600" />,
      run: () => { navigate('/proof'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-drive',
      category: 'Navigation',
      label: 'Live Drive HUD Simulation',
      icon: <Navigation className="w-4 h-4 text-emerald-600" />,
      run: () => { navigate('/drive'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-chargers',
      category: 'Navigation',
      label: 'Charger Trust & Station Directory',
      icon: <BatteryCharging className="w-4 h-4 text-amber-600" />,
      run: () => { navigate('/chargers'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-evidence',
      category: 'Navigation',
      label: 'Model Evidence (120-Trip Benchmark)',
      icon: <BarChart3 className="w-4 h-4 text-purple-600" />,
      run: () => { navigate('/evidence'); setCommandPaletteOpen(false); },
    },
    {
      id: 'act-truth',
      category: 'Actions',
      label: 'Toggle Truth Mode (Inspect mathematical derivations)',
      icon: <ShieldCheck className="w-4 h-4 text-sky-600" />,
      run: () => { toggleTruthMode(); setCommandPaletteOpen(false); },
    },
    {
      id: 'act-reset',
      category: 'Actions',
      label: 'Reset Trip Scenario to Defaults',
      icon: <RotateCcw className="w-4 h-4 text-slate-600" />,
      run: () => { resetScenarioDefaults(); setCommandPaletteOpen(false); },
    },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[1300] flex items-start justify-center pt-24 px-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Type a screen, action, or command... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-sans"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-mono">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={action.run}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-white shadow-xs">
                    {action.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-sans">
                      {action.label}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {action.category}
                    </span>
                  </div>
                </div>
                <span className="text-slate-400 text-xs font-mono group-hover:text-slate-700">
                  Select ↵
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-xs">Ctrl+K</kbd> anywhere</span>
          <span>VoltSure AI Mobility Intelligence</span>
        </div>
      </div>
    </div>
  );
};
