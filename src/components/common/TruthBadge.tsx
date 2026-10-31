import React, { useState } from 'react';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { Info } from 'lucide-react';

interface TruthBadgeProps {
  source: string;
  unit?: string;
  modelVersion?: string;
  timestamp?: string;
  formula?: string;
  children: React.ReactNode;
}

export const TruthBadge: React.FC<TruthBadgeProps> = ({
  source,
  unit,
  modelVersion = 'VoltSure-v1.2-physics',
  timestamp = '2026-10-31T23:00:00Z',
  formula,
  children,
}) => {
  const { truthMode } = useVoltSureStore();
  const [hovered, setHovered] = useState(false);

  if (!truthMode) {
    return <>{children}</>;
  }

  return (
    <span
      className="relative inline-block cursor-help border-b border-dashed border-sky-400 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Truth Mode Active: Hover to inspect evidence origin"
    >
      {children}
      <span className="inline-block ml-0.5 text-sky-600 align-super text-[10px]">
        <Info className="w-2.5 h-2.5 inline" />
      </span>

      {hovered && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-slate-100 rounded-lg shadow-xl text-xs font-sans pointer-events-none border border-slate-700 animate-fadeIn">
          <span className="block font-semibold text-sky-400 text-[11px] uppercase tracking-wider mb-1 font-mono">
            Truth Mode Evidence Card
          </span>
          <span className="block text-slate-300 mb-0.5">
            <strong className="text-slate-100">Source:</strong> {source}
          </span>
          {unit && (
            <span className="block text-slate-300 mb-0.5">
              <strong className="text-slate-100">Unit:</strong> {unit}
            </span>
          )}
          {formula && (
            <span className="block text-slate-300 font-mono text-[10px] bg-slate-800 p-1 rounded my-1 border border-slate-700">
              {formula}
            </span>
          )}
          <span className="block text-slate-400 text-[10px] mt-1 font-mono">
            Model: {modelVersion} • {timestamp.slice(11, 19)}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};

