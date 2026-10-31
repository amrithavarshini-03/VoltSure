import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CalibrationBin } from '../../engine/evaluation';

interface CalibrationChartProps {
  data: CalibrationBin[];
}

export const CalibrationChart: React.FC<CalibrationChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            Reliability (Calibration) Diagram
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            120 synthetic held-out trips: Observed empirical success rate vs predicted confidence probability
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            SIMULATED HELD-OUT EVALUATION
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="predictedProb"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              label={{ value: 'Forecasted Confidence Target (%)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              label={{ value: 'Observed Empirical Arrival Rate (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as CalibrationBin;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs font-mono border border-slate-700 shadow-lg">
                    <p className="font-semibold text-slate-200 mb-1">Target: {d.predictedProb}%</p>
                    <p className="text-lime-400">VoltSure AI: {d.actualRateVoltSure}%</p>
                    <p className="text-sky-400">Baseline B: {d.actualRateBaselineB}%</p>
                    <p className="text-slate-400">Ideal Diagonal: {d.diagonalReference}%</p>
                  </div>
                );
              }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 12 }} />

            {/* Ideal 45-degree diagonal reference */}
            <Line
              name="Ideal Calibration (y = x)"
              type="linear"
              dataKey="diagonalReference"
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />

            {/* Baseline B (Overconfident) */}
            <Line
              name="Baseline B (Deterministic Route)"
              type="monotone"
              dataKey="actualRateBaselineB"
              stroke="#0284C7"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0284C7' }}
            />

            {/* VoltSure AI (Well-calibrated) */}
            <Line
              name="VoltSure AI (Uncertainty-calibrated)"
              type="monotone"
              dataKey="actualRateVoltSure"
              stroke="#65A30D"
              strokeWidth={3}
              dot={{ r: 4, fill: '#65A30D' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Interpretation:</span> VoltSure's curve adheres tightly to the ideal diagonal reference (Brier score 0.08), demonstrating calibrated probability targets. Baseline B shows severe overconfidence due to unmodelled charger failures and grade variance.
      </div>
    </div>
  );
};

