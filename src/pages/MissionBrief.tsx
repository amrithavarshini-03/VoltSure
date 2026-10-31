import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useVoltSureStore } from '../store/useVoltSureStore';
import { BoltIcon } from '../components/common/BoltIcon';
import { ProvenanceChip } from '../components/common/ProvenanceChip';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';

export const MissionBrief: React.FC = () => {
  const { startJudgeMode } = useVoltSureStore();

  const innovations = [
    {
      title: 'Segment Energy Twin',
      desc: 'Physics-informed tractive model accounting for grade, aerodynamic drag, and ambient temperature.',
      icon: Cpu,
    },
    {
      title: 'Thermal & Battery Health',
      desc: 'Real-time usable capacity derating and protected reserve budgeting before trip commitment.',
      icon: Zap,
    },
    {
      title: 'Bayesian Charger Trust',
      desc: 'Exponential status age decay w_fresh = exp(-age/45m) and historical Bayesian session scoring.',
      icon: ShieldCheck,
    },
    {
      title: 'Risk-Budget Route Planning',
      desc: '2,000-run Monte Carlo simulations to deliver true confidence-calibrated arrival probabilities.',
      icon: TrendingUp,
    },
    {
      title: 'Fleet & Swap Extension',
      desc: 'Automated dispatch suitability scoring and modular battery pack diagnostic screening.',
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-white border border-slate-200 shadow-card overflow-hidden bg-telemetry-grid">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-100 border border-lime-300 text-lime-800 text-xs font-mono font-semibold">
            <BoltIcon size={14} className="text-lime-700" />
            <span>HackFront India — Problem Statement T6.1 &ldquo;Will I Make It&rdquo;</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
            Don&rsquo;t just predict the range.{' '}
            <span className="text-lime-600 block">Prove the journey is feasible.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-sans leading-relaxed">
            VoltSure AI is an explainable EV mobility intelligence engine. For any vehicle profile, route elevation profile, battery state, and uncertain charging condition, it computes the exact probability of arriving with protected energy reserve intact.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/setup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Run the Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={startJudgeMode}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span>Start Judge Mode (60s Tour)</span>
            </button>

            <div className="flex items-center gap-2 pl-2">
              <ProvenanceChip provenance="SIMULATED" size="sm" />
              <span className="text-xs text-slate-400 font-mono">Labelled demo dataset</span>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Geometry */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 rounded-full bg-lime-100/40 blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-12 opacity-10 hidden md:block pointer-events-none">
          <BoltIcon size={260} className="text-slate-900" />
        </div>
      </div>

      {/* The 3 Paradigms Contrast Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            Why Standard EV Range Predictions Cause Stalls
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            A direct architectural comparison across the three generations of EV range software
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dashboard Range */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                BASELINE A
              </span>
              <AlertOctagon className="w-4 h-4 text-red-500" />
            </div>

            <h3 className="font-heading font-bold text-slate-900 text-lg">
              Dashboard Range (OEM DTE)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Divides battery % by a fixed nominal Wh/km. Ignores terrain slope, passenger weight, headwind, and stop-start idling.
            </p>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 font-mono space-y-1">
              <p>• Says: &ldquo;84 km remaining&rdquo; (safe)</p>
              <p>• Reality: Stalls at km 28 on uphill</p>
              <p>• Reserve Breach: ~24% of trips</p>
            </div>
          </div>

          {/* Card 2: Energy-Aware Route */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                BASELINE B
              </span>
              <HelpCircle className="w-4 h-4 text-sky-600" />
            </div>

            <h3 className="font-heading font-bold text-slate-900 text-lg">
              Deterministic Energy Routing
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Models elevation grade, but produces a single deterministic number and naively trusts every charger status as 100% available.
            </p>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 font-mono space-y-1">
              <p>• Ignores rider history uncertainty</p>
              <p>• Zero charger age decay</p>
              <p>• Brier Calibration Score: 0.19 (poor)</p>
            </div>
          </div>

          {/* Card 3: VoltSure AI */}
          <div className="bg-white rounded-2xl p-6 border-2 border-lime-500 shadow-elevated space-y-4 relative overflow-hidden bg-lime-50/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-lime-500 text-slate-950">
                VOLTSURE AI
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <h3 className="font-heading font-bold text-slate-900 text-lg">
              Confidence-Aware Decision Engine
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Full probabilistic Monte Carlo simulation (2,000 runs) with protected reserve guarantee, Bayesian charger decay, and counterfactuals.
            </p>

            <div className="p-3 bg-lime-100/60 rounded-xl border border-lime-300 text-xs text-lime-950 font-mono space-y-1">
              <p>• 90% Prediction Interval Coverage: 90.2%</p>
              <p>• Reserve Breach: Under 3.2%</p>
              <p>• Brier Score: 0.08 (highly calibrated)</p>
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Key Innovations */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-mono font-bold text-lime-700 uppercase tracking-wider block">
            Core Technical Capabilities
          </span>
          <h2 className="text-xl font-bold font-heading text-slate-900 mt-1">
            Five Core Architectural Innovations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {innovations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition space-y-2.5"
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 w-fit text-slate-800 shadow-xs">
                  <Icon className="w-4 h-4 text-lime-600" />
                </div>
                <h4 className="font-heading font-bold text-slate-900 text-xs">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-normal font-sans">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

