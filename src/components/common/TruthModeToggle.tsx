import React from 'react';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const TruthModeToggle: React.FC = () => {
  const { truthMode, toggleTruthMode } = useVoltSureStore();

  return (
    <button
      onClick={toggleTruthMode}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        truthMode
          ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
      }`}
      title={
        truthMode
          ? 'Truth Mode is ON: Hover any metric to see its mathematical derivation & data provenance'
          : 'Enable Truth Mode to inspect sources, models, and evidence derivations'
      }
    >
      {truthMode ? (
        <>
          <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
          <span className="font-semibold">Truth Mode ON</span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Truth Mode</span>
        </>
      )}
    </button>
  );
};

