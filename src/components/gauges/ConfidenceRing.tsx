import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceRingProps {
  probability: number; // 0.0 to 1.0 (e.g. 0.94)
  reservePercent?: number; // e.g. 10
  size?: number; // px, default 160
  strokeWidth?: number; // px, default 12
  targetThreshold?: number; // default 90
  label?: string;
  showVerdictBadge?: boolean;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  probability,
  reservePercent = 10,
  size = 170,
  strokeWidth = 14,
  targetThreshold = 90,
  label,
  showVerdictBadge = true,
}) => {
  const percent = Math.round(probability * 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Reserve marker notch angle on perimeter
  const reserveAngle = (reservePercent / 100) * 360 - 90;
  const reserveRad = (reserveAngle * Math.PI) / 180;
  const reserveX = size / 2 + radius * Math.cos(reserveRad);
  const reserveY = size / 2 + radius * Math.sin(reserveRad);

  // Status color styling for crisp light theme
  const isSafe = percent >= targetThreshold;
  const isWarning = percent >= 75 && percent < targetThreshold;

  let strokeColor = '#059669'; // Emerald 600
  let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let statusText = 'FEASIBLE';

  if (isWarning) {
    strokeColor = '#D97706'; // Amber 600
    badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
    statusText = 'HIGH RISK';
  } else if (!isSafe) {
    strokeColor = '#DC2626'; // Red 600
    badgeBg = 'bg-red-100 text-red-800 border-red-300';
    statusText = 'REJECTED';
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Probability Stroke */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />

          {/* Protected Reserve Notch */}
          <circle
            cx={reserveX}
            cy={reserveY}
            r={strokeWidth / 2 + 1}
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-4xl font-bold font-mono tracking-tight text-slate-900"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {percent}%
          </motion.span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5 font-sans">
            Feasibility
          </span>
          <span className="text-[9px] text-slate-400 font-mono mt-0.5">
            {reservePercent}% reserve locked
          </span>
        </div>
      </div>

      {showVerdictBadge && (
        <div className="mt-3 text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border shadow-sm ${badgeBg}`}>
            {statusText} ({percent}% vs {targetThreshold}% Target)
          </span>
          {label && (
            <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-tight">
              {label}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

