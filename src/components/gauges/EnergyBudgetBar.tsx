import React from 'react';
import { TruthBadge } from '../common/TruthBadge';

interface EnergyBudgetBarProps {
  usableEnergyWh: number;
  protectedReserveWh: number;
  p10EnergyWh: number;
  p50EnergyWh: number;
  p90EnergyWh: number;
  availableAboveReserveWh: number;
}

export const EnergyBudgetBar: React.FC<EnergyBudgetBarProps> = ({
  usableEnergyWh,
  protectedReserveWh,
  p10EnergyWh,
  p50EnergyWh,
  p90EnergyWh,
  availableAboveReserveWh,
}) => {
  const totalWh = Math.max(usableEnergyWh, p90EnergyWh + protectedReserveWh, 1);

  const reservePercent = (protectedReserveWh / totalWh) * 100;
  const p50Percent = (p50EnergyWh / totalWh) * 100;
  const p10Percent = (p10EnergyWh / totalWh) * 100;
  const p90Percent = (p90EnergyWh / totalWh) * 100;

  const isMarginDeficit = availableAboveReserveWh < 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
          Energy Budget vs Reserve Allocation
        </span>
        <TruthBadge
          source="Derived: Usable - Reserve - p50 Consumption"
          unit="Wh"
          formula="E_available = E_usable - E_reserve - E_trip"
        >
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
              isMarginDeficit
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isMarginDeficit
              ? `${Math.round(availableAboveReserveWh)} Wh Deficit`
              : `+${Math.round(availableAboveReserveWh)} Wh Above Reserve`}
          </span>
        </TruthBadge>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex">
        {/* Trip Demand (p50) */}
        <div
          className={`h-full transition-all duration-500 ${
            isMarginDeficit ? 'bg-amber-400' : 'bg-lime-500'
          }`}
          style={{ width: `${Math.min(p50Percent, 100)}%` }}
          title={`Trip Demand (p50): ${Math.round(p50EnergyWh)} Wh`}
        />

        {/* Uncertainty Spread overlay (p10 to p90) */}
        <div
          className="absolute top-0 bottom-0 bg-lime-700/20 border-x border-lime-800/40 pointer-events-none"
          style={{
            left: `${Math.min(p10Percent, 100)}%`,
            width: `${Math.max(p90Percent - p10Percent, 1)}%`,
          }}
          title={`Uncertainty spread: ${Math.round(p10EnergyWh)} - ${Math.round(p90EnergyWh)} Wh`}
        />

        {/* Protected Reserve Strip on right */}
        <div
          className="h-full bg-slate-800 border-l border-slate-900 ml-auto transition-all"
          style={{ width: `${Math.min(reservePercent, 100)}%` }}
          title={`Protected Reserve: ${Math.round(protectedReserveWh)} Wh`}
        />
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-slate-600 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-lime-500" />
          <span>Demand: <strong>{Math.round(p50EnergyWh)} Wh</strong></span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-2.5 h-2.5 rounded-sm bg-lime-700/30 border border-lime-700" />
          <span>p90: <strong>{Math.round(p90EnergyWh)} Wh</strong></span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" />
          <span>Reserve: <strong>{Math.round(protectedReserveWh)} Wh</strong></span>
        </div>
      </div>
    </div>
  );
};

