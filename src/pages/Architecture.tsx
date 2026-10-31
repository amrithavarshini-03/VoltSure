import React, { useState } from 'react';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import { BoltIcon } from '../components/common/BoltIcon';
import {
  Layers,
  Code2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Compass,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const Architecture: React.FC = () => {
  const [selectedApi, setSelectedApi] = useState<string>('trip-predict');

  const layers = [
    {
      num: 'Layer 1',
      title: 'Data & Adapter Boundary',
      desc: 'Normalized telemetry ingestion with strict provenance badges (REAL, PUBLIC, SIMULATED). Abstract interfaces decouple live CAN/OCPP from simulated adapters.',
      tags: ['SimulatedVehicleAdapter', 'SimulatedChargingAdapter', 'CAN Stub', 'OCPP 2.0.1 Stub'],
    },
    {
      num: 'Layer 2',
      title: 'Vehicle Physics Energy Twin',
      desc: 'First-principles tractive dynamics (Fr + Fa + Fg) integrated across route grade and speed profiles, adjusted by learned temperature and stop-start penalties.',
      tags: ['Drag Area (CdA)', 'Rolling Resistance (Cr)', 'Grade Sin(θ)', 'Regen Efficiency'],
    },
    {
      num: 'Layer 3',
      title: 'Uncertainty & Reserve Engine',
      desc: 'Mulberry32 seeded PRNG executing 2,000 Monte Carlo iterations with log-normal variance scaled to driver history size and weather extremes.',
      tags: ['2,000 Samples', 'p10–p50–p90 Intervals', 'Protected Reserve Budget', 'Deterministic Seed'],
    },
    {
      num: 'Layer 4',
      title: 'Bayesian Charger Trust & Risk Planner',
      desc: 'Exponential status age decay w_fresh = exp(-age/45m), Beta-posterior historical scoring, connector hard gates, and fallback corridor allocation.',
      tags: ['Compatibility Gate', 'Freshness Decay', 'Arrival Queue Penalty', 'Utility J(r)'],
    },
    {
      num: 'Layer 5',
      title: 'Explainable Interface & Truth Mode',
      desc: 'Transparent human-machine telemetry interface with plain-language counterfactual search, Truth Mode metadata inspection, and proof certificate export.',
      tags: ['Truth Popovers', 'Counterfactual Advice', 'Interactive Age Slider', 'Boarding Pass'],
    },
    {
      num: 'Layer 6',
      title: 'Feedback Calibration & Benchmarking',
      desc: 'Continuous scoring over 120 synthetic benchmark trips, evaluating Brier calibration score, interval coverage, and reserve violation containment.',
      tags: ['Brier Score 0.08', '90.2% Coverage', 'Held-out Matrix', 'Disruption Replay'],
    },
  ];

  const apiContracts = [
    {
      id: 'trip-predict',
      endpoint: 'POST /api/v1/trip/predict',
      description: 'Calculates segment-level energy consumption and 2,000-run Monte Carlo arrival distributions for a specific vehicle and route.',
      code: `// Request Interface
interface TripPredictRequest {
  vehicleId: string;
  startingSoC: number;        // 10-100%
  reservePercent: number;     // e.g. 10%
  ambientTempC: number;       // e.g. 33
  payloadKg: number;          // e.g. 20
  trafficLevel: 'free' | 'moderate' | 'heavy';
  routeSegments: RouteSegment[];
}

// Response Interface
interface TripPredictResponse {
  p10EnergyWh: number;
  p50EnergyWh: number;
  p90EnergyWh: number;
  pFeasibleArrival: number;   // 0.0 to 1.0
  reserveViolationsCount: number; // out of 2000
  isFeasibleAtTarget: boolean;
  provenance: 'SIMULATED';
}`,
    },
    {
      id: 'charger-score',
      endpoint: 'POST /api/v1/charger/score',
      description: 'Scores charger trust with exponential telemetry decay and compatibility hard gating.',
      code: `// Request Interface
interface ChargerScoreRequest {
  chargerId: string;
  vehicleId: string;
  statusAgeMinutes: number;   // e.g. 220
  reportedStatus: 'available' | 'occupied' | 'fault';
}

// Response Interface
interface ChargerScoreResponse {
  isCompatible: boolean;
  freshnessWeight: number;    // exp(-age/45)
  historicalPUsable: number;  // Beta mean
  pUsable: number;            // [0.0 - 1.0]
  trustScore: number;         // [0 - 100]
  evidenceSummary: string;
}`,
    },
    {
      id: 'route-compare',
      endpoint: 'POST /api/v1/route/compare',
      description: 'Jointly evaluates candidate routes and ranks the safest feasible corridor.',
      code: `// Joint Route Selection
interface RouteCompareResponse {
  recommendedRouteId: string;
  evaluatedRoutes: RoutePredictionResult[];
  unmetTargetExplanation?: string;
}`,
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider">
              Screen 9 — System Architecture & Limits
            </span>
            <ProvenanceChip provenance="SIMULATED" size="xs" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900 mt-0.5">
            Architecture, API Contracts & Governance Limits
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Rigorous boundary definitions, typed service contracts, and explicit scientific limitations.
          </p>
        </div>
      </div>

      {/* Six Layer Interactive Architecture Diagram */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold font-heading text-slate-900 font-mono uppercase tracking-wider">
            Six-Layer System Architecture
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Strict separation between physics twin, uncertainty calibration, and external adapter boundaries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-lime-100 text-lime-800 border border-lime-300">
                  {layer.num}
                </span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>

              <h3 className="font-heading font-bold text-sm text-slate-900">
                {layer.title}
              </h3>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {layer.desc}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {layer.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REST API Contracts Interactive Explorer */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 font-mono uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-5 h-5 text-lime-600" />
              <span>Production-Ready TypeScript API Contracts</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              These typed interfaces define the backend contract and are used directly by the in-browser engine
            </p>
          </div>

          <div className="flex gap-2">
            {apiContracts.map((api) => (
              <button
                key={api.id}
                onClick={() => setSelectedApi(api.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition ${
                  selectedApi === api.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {api.endpoint.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {apiContracts
          .filter((api) => api.id === selectedApi)
          .map((api) => (
            <div key={api.id} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                <span className="px-2 py-0.5 rounded bg-lime-100 text-lime-900">
                  {api.endpoint.split(' ')[0]}
                </span>
                <span>{api.endpoint.split(' ')[1]}</span>
                <span className="text-slate-500 font-sans font-normal text-xs ml-2">
                  — {api.description}
                </span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <code>{api.code}</code>
              </pre>
            </div>
          ))}
      </div>

      {/* Claims We Avoid vs Claims We Make (Honesty Table) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claims We Avoid */}
        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-heading font-bold text-base">
            <XCircle className="w-5 h-5 text-red-600" />
            <span>Claims We Explicitly Avoid</span>
          </div>

          <ul className="space-y-2 text-xs text-red-950 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Never say &ldquo;guaranteed to reach&rdquo; — always phrase as &ldquo;estimated probability of arriving with reserve intact&rdquo;.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Never claim live OEM telematics integration or authorized fleet telemetry partnership without credentials.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Never claim &ldquo;90% accuracy&rdquo; for confidence intervals — we state &ldquo;calibrated 90% interval coverage&rdquo;.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">✗</span>
              <span>Never claim live charger grid control — demo uses a documented OCPP-compatible adapter simulator.</span>
            </li>
          </ul>
        </div>

        {/* Claims We Make */}
        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-heading font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Claims We Confidently Prove</span>
          </div>

          <ul className="space-y-2 text-xs text-emerald-950 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Explainable, segment-level physics modeling across elevation grade, speed, and ambient temperature.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Bayesian status age decay where stale &ldquo;available&rdquo; pings are defensively downgraded over time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Deterministic 2,000-run Monte Carlo simulation quantifying arrival risk budget.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Dynamic in-flight replanning with automatic secondary fallback corridor allocation.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Commercial Pathway Roadmap */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold font-heading text-slate-900 font-mono uppercase tracking-wider">
          Commercial Deployment Pathway
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-700">Phase 1: Q1 2027</span>
            <h4 className="font-bold text-xs text-slate-900 font-sans">B2B Delivery Fleets</h4>
            <p className="text-[11px] text-slate-600">
              Dispatch risk scoring API integration for last-mile 2W/3W commercial delivery networks.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-700">Phase 2: Q3 2027</span>
            <h4 className="font-bold text-xs text-slate-900 font-sans">CPO Trust Integration</h4>
            <p className="text-[11px] text-slate-600">
              Live OCPI 2.2.1 roaming connectors with Indian charge point operators to score real telemetry.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-700">Phase 3: Q1 2028</span>
            <h4 className="font-bold text-xs text-slate-900 font-sans">OEM Cluster SDK</h4>
            <p className="text-[11px] text-slate-600">
              Embedded Android Automotive / Linux infotainment SDK for native vehicle instrument clusters.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-mono font-bold text-lime-700">Phase 4: Q4 2028</span>
            <h4 className="font-bold text-xs text-slate-900 font-sans">Battery Swap Grid</h4>
            <p className="text-[11px] text-slate-600">
              Automated pack diagnostic matching for national two-wheeler battery swapping stations.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory Prototype Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-600 font-mono">
        Concept prototype. No OEM partnership, live charger integration or validated vehicle performance is claimed.
        Built for HackFront India — Problem Statement T6.1 &ldquo;Will I Make It&rdquo;.
      </div>
    </div>
  );
};

