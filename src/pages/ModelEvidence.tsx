import React, { useMemo } from 'react';
import { generateEvaluationReport } from '../engine/evaluation';
import { CalibrationChart } from '../components/charts/CalibrationChart';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  BarChart3,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const ModelEvidence: React.FC = () => {
  // Deterministic 120-trip evaluation report
  const report = useMemo(() => generateEvaluationReport(777), []);

  const { baselineA, baselineB, voltSure } = report.metrics;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 6 — Model Calibration & Empirical Evidence
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            {report.datasetTitle}
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Strict out-of-sample benchmark across 120 complete trips contrasting standard OEM range, deterministic navigation, and VoltSure AI.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-purple-50 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <span>Synthetic Held-Out Split: 84 Train / 36 Test</span>
        </div>
      </div>

      {/* Mandatory Calibration Honesty Callout */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-950 font-sans flex items-start gap-3 shadow-xs">
        <AlertOctagon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold font-mono uppercase text-amber-900 text-[11px] mb-0.5">
            Scientific Integrity Safeguard
          </strong>
          <p className="leading-relaxed">
            Scenario demonstrations on other screens are not evidence of calibration. One successful trip is not calibration. The metrics below are computed strictly over a seeded held-out synthetic evaluation of 120 distinct driving cycles and charger disruption scenarios.
          </p>
        </div>
      </div>

      {/* Three-System Comparison Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider font-mono">
            Key Performance Indicators Across 3 Paradigms
          </h2>
          <span className="text-[10px] font-mono text-slate-400">120 Trips Seeded Evaluation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 text-[11px] uppercase">
                <th className="py-3 px-3">Evaluation Metric</th>
                <th className="py-3 px-3 bg-red-50/50 text-red-950 border-r border-slate-200">
                  Baseline A (Dashboard Range)
                </th>
                <th className="py-3 px-3 bg-sky-50/50 text-sky-950 border-r border-slate-200">
                  Baseline B (Deterministic Route)
                </th>
                <th className="py-3 px-3 bg-lime-50/80 text-lime-950 font-bold">
                  VoltSure AI (Confidence Engine)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Range / Energy MAE (km equivalent)
                </td>
                <td className="py-3 px-3 font-bold text-red-700 bg-red-50/20 border-r border-slate-100">
                  {baselineA.maeKm} km
                </td>
                <td className="py-3 px-3 text-sky-800 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.maeKm} km
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.maeKm} km (Best)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  90% Prediction Interval Coverage
                </td>
                <td className="py-3 px-3 text-slate-400 bg-red-50/20 border-r border-slate-100">
                  N/A (Point forecast only)
                </td>
                <td className="py-3 px-3 font-bold text-amber-700 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.intervalCoverage90}% (Severe under-coverage)
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.intervalCoverage90}% (Calibrated near nominal 90%)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Brier Calibration Score (Lower is better)
                </td>
                <td className="py-3 px-3 text-red-700 bg-red-50/20 border-r border-slate-100">
                  {baselineA.brierScore}
                </td>
                <td className="py-3 px-3 text-amber-700 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.brierScore}
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.brierScore} (Excellent calibration)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Successful Arrival Rate
                </td>
                <td className="py-3 px-3 text-red-700 bg-red-50/20 border-r border-slate-100">
                  {baselineA.successfulArrivalRate}%
                </td>
                <td className="py-3 px-3 text-sky-800 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.successfulArrivalRate}%
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.successfulArrivalRate}% (Safe dispatches)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Reserve Violations Rate (&lt; 10% reserve)
                </td>
                <td className="py-3 px-3 font-bold text-red-700 bg-red-50/20 border-r border-slate-100">
                  {baselineA.reserveViolationRate}%
                </td>
                <td className="py-3 px-3 text-amber-700 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.reserveViolationRate}%
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.reserveViolationRate}% (Virtually eliminated)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Average Added Detour (trade-off)
                </td>
                <td className="py-3 px-3 text-slate-500 bg-red-50/20 border-r border-slate-100">
                  0 min (Naive direct)
                </td>
                <td className="py-3 px-3 text-slate-700 bg-sky-50/20 border-r border-slate-100">
                  +{baselineB.avgAddedDetourMin} min
                </td>
                <td className="py-3 px-3 text-slate-800 bg-lime-50/40">
                  +{voltSure.avgAddedDetourMin} min (Safe charging buffer)
                </td>
              </tr>

              <tr className="hover:bg-slate-50">
                <td className="py-3 px-3 font-sans font-semibold text-slate-800">
                  Unnecessary Charging Stops
                </td>
                <td className="py-3 px-3 text-slate-400 bg-red-50/20 border-r border-slate-100">
                  0 (Never stops)
                </td>
                <td className="py-3 px-3 text-amber-700 bg-sky-50/20 border-r border-slate-100">
                  {baselineB.unnecessaryStopsCount} stops
                </td>
                <td className="py-3 px-3 font-bold text-emerald-700 bg-lime-50/40">
                  {voltSure.unnecessaryStopsCount} stops (Optimized)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reliability (Calibration) Curve Component */}
      <CalibrationChart data={report.calibrationCurve} />

      {/* Disruption Scenario Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-heading text-slate-900 uppercase tracking-wider font-mono">
            Disruption Scenario Stress-Testing Matrix
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Robustness across 5 edge conditions</span>
        </div>

        <div className="space-y-3">
          {report.disruptionMatrix.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="font-bold font-sans text-slate-900 text-sm">
                  {item.scenarioName}
                </span>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                    Baseline A: {item.baselineAResult}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                    Baseline B: {item.baselineBResult}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    VoltSure: {item.voltSureResult}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 font-sans">{item.description}</p>
              <p className="text-[11px] font-mono font-medium text-lime-900 bg-lime-100/60 p-2 rounded-lg">
                ↳ <strong>VoltSure Response:</strong> {item.voltSureNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

