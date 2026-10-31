import React from 'react';
import { DataProvenance } from '../../data/types';

interface ProvenanceChipProps {
  provenance: DataProvenance;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ProvenanceChip: React.FC<ProvenanceChipProps> = ({
  provenance,
  size = 'xs',
  className = '',
}) => {
  const styles = {
    REAL: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    PUBLIC: 'bg-sky-50 text-sky-800 border-sky-300',
    SIMULATED: 'bg-purple-50 text-purple-800 border-purple-300',
  }[provenance];

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded font-mono font-medium border',
    sm: 'text-xs px-2 py-0.5 rounded-md font-mono font-medium border',
    md: 'text-xs px-2.5 py-1 rounded-md font-mono font-semibold border',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 uppercase tracking-wider select-none ${styles} ${sizeClasses} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {provenance}
    </span>
  );
};

export const GlobalSimulatedDataBanner: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full text-xs font-mono shadow-sm">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span className="font-semibold">Simulated demo data</span>
      <span className="text-amber-700 font-sans hidden sm:inline">(All unvalidated values are illustrative)</span>
    </div>
  );
};

