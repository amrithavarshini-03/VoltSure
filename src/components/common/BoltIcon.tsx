import React from 'react';

interface BoltIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const BoltIcon: React.FC<BoltIconProps> = ({
  className = 'w-5 h-5 text-lime-600',
  size = 20,
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'filter drop-shadow-[0_0_8px_rgba(132,204,22,0.6)]' : ''} inline-block flex-shrink-0`}
    >
      <path
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

