import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoltSureStore } from '../../store/useVoltSureStore';
import { Play, Pause, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

const JUDGE_STEPS = [
  {
    step: 1,
    title: '1/8: The Dashboard Illusion',
    route: '/setup',
    caption: 'Standard EV dashboard displays "84 km remaining" (looks completely safe for a 35 km trip), blinding the rider to 320m uphill grade and stop-start congestion.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.setSelectedRouteId('route-a-direct');
    },
  },
  {
    step: 2,
    title: '2/8: Segment Physics & Uncertainty',
    route: '/proof',
    caption: 'VoltSure predicts energy at segment granularity (aerodynamic drag, rolling resistance, hill grade) and runs 2,000 Monte Carlo runs to quantify the p10–p90 spread.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.setSelectedRouteId('route-a-direct');
    },
  },
  {
    step: 3,
    title: '3/8: Direct Route A Rejected',
    route: '/proof',
    caption: 'Direct route fails the 90% confidence target! In over 60% of scenarios, the uphill ascent breaches your protected 10% reserve. The en-route charger has stale data.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.setSelectedRouteId('route-a-direct');
    },
  },
  {
    step: 4,
    title: '4/8: Bayesian Charger Trust',
    route: '/chargers',
    caption: 'VoltHub Thadagam claims "Available" but the status is 3h 40m old. VoltSure applies exponential freshness decay w_fresh = exp(-age/45m), dropping its Trust Score to 38/100.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.setChargerAgeOverride('ch-thadagam', 220);
    },
  },
  {
    step: 5,
    title: '5/8: Route B Recommended with Fallback',
    route: '/proof',
    caption: 'VoltSure recommends Route B via GreenGrid Karamadai (fresh 4m status, 94% confidence). A redundant secondary fallback is automatically designated to prevent stalls.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.setSelectedRouteId('route-b-saibaba');
    },
  },
  {
    step: 6,
    title: '6/8: Dynamic En-Route Replan',
    route: '/replan',
    caption: 'Simulation event: GreenGrid Karamadai unexpectedly fails! Watch VoltSure dynamically reroute to secondary fallback Kavundampalayam with an instant "What Changed" delta.',
    action: (store: ReturnType<typeof useVoltSureStore.getState>) => {
      store.triggerReplanEvent('charger_failed');
    },
  },
  {
    step: 7,
    title: '7/8: Held-Out Model Evidence',
    route: '/evidence',
    caption: '120-trip held-out evaluation against standard OEM range (Baseline A) and deterministic navigation (Baseline B). VoltSure achieves 90% interval coverage and 0.08 Brier score.',
    action: () => {},
  },
  {
    step: 8,
    title: '8/8: Honest Mobility Intelligence',
    route: '/architecture',
    caption: '"Don\'t just predict the range. Prove the journey is feasible." Clear limits, data provenance on every tile, and zero fake guarantees. Try Scenario Lab freely!',
    action: () => {},
  },
];

export const JudgeModeBar: React.FC = () => {
  const { judgeMode, setJudgeStep, toggleJudgePlay, stopJudgeMode } = useVoltSureStore();
  const navigate = useNavigate();

  const current = JUDGE_STEPS[judgeMode.currentStepIndex];

  // Auto-advance timer when playing
  useEffect(() => {
    if (!judgeMode.active || !judgeMode.isPlaying) return;

    // Apply step action and navigate
    current.action(useVoltSureStore.getState());
    navigate(current.route);

    const timer = setTimeout(() => {
      if (judgeMode.currentStepIndex < JUDGE_STEPS.length - 1) {
        setJudgeStep(judgeMode.currentStepIndex + 1);
      } else {
        // Finished tour
        toggleJudgePlay();
      }
    }, 7500); // 7.5s per step = 60s total

    return () => clearTimeout(timer);
  }, [judgeMode.active, judgeMode.isPlaying, judgeMode.currentStepIndex, current, navigate, setJudgeStep, toggleJudgePlay]);

  if (!judgeMode.active) return null;

  const handleNext = () => {
    if (judgeMode.currentStepIndex < JUDGE_STEPS.length - 1) {
      const nextIndex = judgeMode.currentStepIndex + 1;
      setJudgeStep(nextIndex);
      JUDGE_STEPS[nextIndex].action(useVoltSureStore.getState());
      navigate(JUDGE_STEPS[nextIndex].route);
    } else {
      stopJudgeMode();
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1200] w-[95%] max-w-4xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 animate-slideUp">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Caption Info */}
        <div className="flex items-start gap-3 w-full md:w-3/4">
          <div className="p-2 rounded-xl bg-lime-500/20 text-lime-400 border border-lime-500/40 mt-0.5 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-lime-400 uppercase tracking-wider">
                Judge Mode Auto-Walkthrough
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Step {judgeMode.currentStepIndex + 1} of {JUDGE_STEPS.length}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-200 leading-relaxed font-normal">
              {current.caption}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
          <button
            onClick={toggleJudgePlay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
            title={judgeMode.isPlaying ? 'Pause auto-tour' : 'Play auto-tour'}
          >
            {judgeMode.isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-lime-400" />}
            <span className="font-mono">{judgeMode.isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={handleNext}
            className="px-3 py-2 rounded-xl bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold text-xs font-mono transition flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={stopJudgeMode}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-700 transition"
            title="Exit Judge Mode (manual control)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Step Progress Bar */}
      <div className="flex gap-1.5 mt-3 pt-2 border-t border-slate-800/80">
        {JUDGE_STEPS.map((s, idx) => (
          <div
            key={idx}
            onClick={() => {
              setJudgeStep(idx);
              s.action(useVoltSureStore.getState());
              navigate(s.route);
            }}
            className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
              idx < judgeMode.currentStepIndex
                ? 'bg-lime-500'
                : idx === judgeMode.currentStepIndex
                ? 'bg-lime-400 ring-2 ring-lime-400/30'
                : 'bg-slate-800'
            }`}
            title={`Jump to step ${idx + 1}: ${s.title}`}
          />
        ))}
      </div>
    </div>
  );
};

