import React from 'react';

interface FreshnessDecayRingProps {
  ageMinutes: number;
  size?: number; // px, default 40
  children?: React.ReactNode;
}

export const FreshnessDecayRing: React.FC<FreshnessDecayRingProps> = ({
  ageMinutes,
  size = 44,
  children,
}) => {
  // Freshness weight: exp(-age / 45)
  const freshness = Math.max(0.01, Math.min(1.0, Math.exp(-ageMinutes / 45)));
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - freshness * circumference;

  let strokeColor = '#059669'; // Fresh emerald
  let statusText = `${ageMinutes}m fresh`;
  if (ageMinutes > 120) {
    strokeColor = '#DC2626'; // Stale red
    statusText = `${Math.floor(ageMinutes / 60)}h stale`;
  } else if (ageMinutes > 40) {
    strokeColor = '#D97706'; // Aging amber
    statusText = `${ageMinutes}m aging`;
  }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      title={`Telemetry freshness: ${statusText} (weight: ${(freshness * 100).toFixed(0)}%)`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={3}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={3.5}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-[10px] font-mono font-bold text-slate-800">
            {ageMinutes < 60 ? `${ageMinutes}m` : `${Math.floor(ageMinutes / 60)}h`}
          </span>
        )}
      </div>
    </div>
  );
};

