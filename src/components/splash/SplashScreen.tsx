import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoltIcon } from '../common/BoltIcon';

interface SplashScreenProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const [phase, setPhase] = useState<'drawing' | 'wordmark' | 'checklist' | 'exit'>('drawing');
  const [checklistIndex, setChecklistIndex] = useState(0);

  const checklistItems = [
    'Loading vehicle energy twin … OK',
    'Calibrating uncertainty engine (2,000 runs) … OK',
    'Scoring charger trust with Bayesian decay … OK',
    'Building risk-aware planner & fallback matrix … OK',
    'Data mode: SIMULATED (truth-labelled)',
  ];

  useEffect(() => {
    // Check session storage if already seen
    const hasSeen = sessionStorage.getItem('voltsure_splash_seen');
    if (hasSeen && !forcePlay) {
      onComplete();
      return;
    }

    // Step 1: Bolt drawing (0 - 1.6s)
    const tWordmark = setTimeout(() => {
      setPhase('wordmark');
    }, 1600);

    // Step 2: Checklist (2.4s)
    const tChecklist = setTimeout(() => {
      setPhase('checklist');
    }, 2400);

    // Step 3: Exit transition (4.2s)
    const tExit = setTimeout(() => {
      setPhase('exit');
    }, 4200);

    // Step 4: Complete callback (4.7s)
    const tComplete = setTimeout(() => {
      sessionStorage.setItem('voltsure_splash_seen', 'true');
      onComplete();
    }, 4700);

    return () => {
      clearTimeout(tWordmark);
      clearTimeout(tChecklist);
      clearTimeout(tExit);
      clearTimeout(tComplete);
    };
  }, [onComplete, forcePlay]);

  // Tick checklist items sequentially
  useEffect(() => {
    if (phase === 'checklist') {
      const interval = setInterval(() => {
        setChecklistIndex((prev) => {
          if (prev < checklistItems.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 260);
      return () => clearInterval(interval);
    }
  }, [phase, checklistItems.length]);

  const handleSkip = () => {
    sessionStorage.setItem('voltsure_splash_seen', 'true');
    setPhase('exit');
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 text-slate-900 overflow-hidden bg-telemetry-grid select-none"
      initial={{ opacity: 1 }}
      animate={
        phase === 'exit'
          ? {
              clipPath: 'circle(150% at 50% 50%)',
              opacity: 0,
              filter: 'blur(10px)',
            }
          : { opacity: 1 }
      }
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onClick={handleSkip}
    >
      {/* Skip button in top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-300 text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 hover:bg-white shadow-sm transition-all"
      >
        Skip intro ›
      </button>

      <div className="relative flex flex-col items-center max-w-lg px-6 text-center">
        {/* Animated Bolt Mark & Confidence Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <svg width={144} height={144} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={72}
              cy={72}
              r={60}
              stroke="#E2E8F0"
              strokeWidth={6}
              fill="transparent"
            />
            {/* Clockwise confidence ring filling to 92% */}
            <motion.circle
              cx={72}
              cy={72}
              r={60}
              stroke="#65A30D"
              strokeWidth={6}
              fill="transparent"
              strokeDasharray={2 * Math.PI * 60}
              initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - 0.92) }}
              transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
              strokeLinecap="round"
            />
            {/* Reserve notch at 10% */}
            <circle
              cx={72 + 60 * Math.cos(((10 / 100) * 360 - 90) * (Math.PI / 180))}
              cy={72 + 60 * Math.sin(((10 / 100) * 360 - 90) * (Math.PI / 180))}
              r={4}
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          </svg>

          {/* SVG Bolt Drawing */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                fill="#84CC16"
                stroke="#0F172A"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        </div>

        {/* Wordmark & Tagline */}
        <div className="space-y-2 mb-6">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight font-heading text-slate-900"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            VoltSure <span className="text-lime-600 font-mono">AI</span>
          </motion.h1>

          <motion.p
            className="text-sm font-medium text-slate-600 max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <em>&ldquo;Don&rsquo;t just predict the range. Prove the journey is feasible.&rdquo;</em>
          </motion.p>
        </div>

        {/* Boot Checklist Ticker */}
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 shadow-sm text-left font-mono text-[11px] space-y-1.5 h-36">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100 pb-1">
            Core Initialization Sequence
          </div>
          {checklistItems.slice(0, checklistIndex).map((item, idx) => (
            <motion.div
              key={idx}
              className="flex items-center gap-2 text-slate-700"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BoltIcon size={12} className="text-lime-600" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>

        {/* Thin progress bar */}
        <div className="w-full max-w-sm h-1 bg-slate-200 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-lime-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.8, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

