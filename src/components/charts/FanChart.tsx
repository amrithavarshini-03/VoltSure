import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { RoutePredictionResult } from '../../data/types';

interface FanChartProps {
  prediction: RoutePredictionResult;
  startingSoC: number;
  reservePercent: number;
}

export const FanChart: React.FC<FanChartProps> = ({
  prediction,
  startingSoC,
  reservePercent,
}) => {
  // Generate route progress points from 0% distance to 100% distance
  const points = [];
  const hasStop = !!prediction.chargingStop;
  const numSteps = 10;

  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    const distanceKm = Math.round(fraction * prediction.totalDistanceKm * 10) / 10;

    let p50 = startingSoC;
    let p10 = startingSoC;
    let p90 = startingSoC;

    if (!hasStop) {
      // Linear/graded depletion to arrival
      p50 = startingSoC - (startingSoC - prediction.p50ArrivalSoC) * fraction;
      p10 = startingSoC - (startingSoC - prediction.p10ArrivalSoC) * fraction;
      p90 = startingSoC - (startingSoC - prediction.p90ArrivalSoC) * fraction;
    } else {
      // Stops mid-way
      const stopFraction = 0.5;
      if (fraction < stopFraction) {
        const leg1Frac = fraction / stopFraction;
        p50 = startingSoC - (startingSoC - prediction.chargingStop!.socAtArrivalAtStop) * leg1Frac;
        p10 = p50 - 3 * leg1Frac;
        p90 = p50 + 3 * leg1Frac;
      } else if (fraction === stopFraction) {
        // Charging jump!
        p50 = 78;
        p10 = 76;
        p90 = 80;
      } else {
        const leg2Frac = (fraction - stopFraction) / (1 - stopFraction);
        const postCharge = 78;
        p50 = postCharge - (postCharge - prediction.p50ArrivalSoC) * leg2Frac;
        p10 = p50 - 4 * leg2Frac;
        p90 = p50 + 4 * leg2Frac;
      }
    }

    points.push({
      distanceKm,
      label: `${distanceKm} km`,
      p10: Math.round(p10 * 10) / 10,
      p50: Math.round(p50 * 10) / 10,
      p90: Math.round(p90 * 10) / 10,
      band: [Math.round(p10 * 10) / 10, Math.round(p90 * 10) / 10],
    });
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div>
          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] block">
            SoC Trajectory & Confidence Fan (p10–p50–p90)
          </span>
          <span className="text-slate-500 text-[10px]">
            Joint uncertainty band across terrain grade & traffic
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-lime-500" />
            <span>Median (p50)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-slate-900" />
            <span>{reservePercent}% Reserve</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="distanceKm"
              tickFormatter={(v) => `${v} km`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-lg text-xs font-mono border border-slate-700">
                    <p className="font-sans font-semibold text-slate-200 mb-1">{d.label}</p>
                    <p className="text-lime-400">p50 SoC: {d.p50}%</p>
                    <p className="text-slate-300">p10 SoC: {d.p10}%</p>
                    <p className="text-slate-300">p90 SoC: {d.p90}%</p>
                  </div>
                );
              }}
            />
            {/* Protected Reserve Horizontal Line */}
            <ReferenceLine
              y={reservePercent}
              stroke="#0F172A"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: `Protected Reserve (${reservePercent}%)`,
                position: 'insideBottomRight',
                fill: '#0F172A',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Confidence spread Area */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="transparent"
              fill="#84CC16"
              fillOpacity={0.18}
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="transparent"
              fill="#FFFFFF"
              fillOpacity={1.0}
            />

            {/* Median Line */}
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#65A30D"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#65A30D' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

