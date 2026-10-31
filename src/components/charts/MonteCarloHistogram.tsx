import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { RoutePredictionResult } from '../../data/types';
import { runMonteCarloSimulation } from '../../engine/uncertainty';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { calculateUsableEnergy } from '../../engine/battery';

interface MonteCarloHistogramProps {
  prediction: RoutePredictionResult;
}

export const MonteCarloHistogram: React.FC<MonteCarloHistogramProps> = ({
  prediction,
}) => {
  const { scenarioInputs, getVehicle, getRoutes } = useVoltSureStore();
  const vehicle = getVehicle();
  const routes = getRoutes();
  const route = routes.find((r) => r.id === prediction.routeId) || routes[0];

  const usable = calculateUsableEnergy(
    vehicle,
    scenarioInputs.startingSoC,
    scenarioInputs.reservePercent,
    scenarioInputs.ambientTempC
  );

  const sim = runMonteCarloSimulation(
    route.segments,
    vehicle,
    scenarioInputs.startingSoC,
    scenarioInputs.reservePercent,
    usable.effectiveCapacityWh,
    scenarioInputs.riderHistoryTrips,
    scenarioInputs.trafficLevel,
    scenarioInputs.ambientTempC,
    scenarioInputs.payloadKg,
    scenarioInputs.auxLoadW,
    42
  );

  const violations = sim.reserveViolationsCount;
  const isSafe = violations <= (1 - scenarioInputs.confidenceTarget / 100) * 2000;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div>
          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block">
            Arrival SoC Monte Carlo Distribution (2,000 Scenarios)
          </span>
          <span className="text-slate-500 text-[10px]">
            Simulated end-of-trip state of charge outcomes
          </span>
        </div>
        <div
          className={`px-2.5 py-1 rounded-md font-mono text-xs font-semibold border ${
            isSafe
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {violations} / 2,000 Violated Reserve ({((violations / 2000) * 100).toFixed(1)}%)
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sim.histogramBins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2 rounded text-xs font-mono border border-slate-700">
                    <p className="font-sans font-semibold text-slate-200">{d.label} SoC Range</p>
                    <p className="text-slate-100">{d.count} of 2,000 scenarios</p>
                    {d.isReserveBreached && (
                      <p className="text-red-400 font-bold mt-0.5">⚠️ Reserve Breached</p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {sim.histogramBins.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isReserveBreached ? '#EF4444' : '#84CC16'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span>Violates {scenarioInputs.reservePercent}% reserve threshold</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-lime-500" />
          <span>Reserve intact (Feasible)</span>
        </span>
      </div>
    </div>
  );
};

