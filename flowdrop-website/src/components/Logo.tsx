import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  lightText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  lightText = false
}) => {
  const iconDimensions = {
    sm: { w: 24, h: 24, text: 'text-base font-bold' },
    md: { w: 32, h: 32, text: 'text-xl font-bold' },
    lg: { w: 42, h: 42, text: 'text-2xl font-extrabold' },
    xl: { w: 56, h: 56, text: 'text-4xl font-extrabold' }
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* FlowDrop directional dual-arrow mark */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        {/* Top directional arrow pointing right (Cyan / Sky Blue) */}
        <path
          d="M22 42h44a14 14 0 0 0 14-14v-2a14 14 0 0 0-14-14H38l9-9-7-7L18 22l22 22 7-7-9-9h28a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H22a5 5 0 0 0-5 5v1a5 5 0 0 0 5 5z"
          fill="url(#flowdrop-cyan-grad)"
        />
        {/* Bottom directional arrow pointing left (Electric / Royal Blue) */}
        <path
          d="M78 58H34a14 14 0 0 0-14 14v2a14 14 0 0 0 14 14h28l-9 9 7 7 22-22-22-22-7 7 9 9H34a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4h44a5 5 0 0 0 5-5v-1a5 5 0 0 0-5-5z"
          fill="url(#flowdrop-blue-grad)"
        />

        <defs>
          <linearGradient id="flowdrop-cyan-grad" x1="18" y1="6" x2="80" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="flowdrop-blue-grad" x1="82" y1="58" x2="20" y2="94" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span
          className={`tracking-tight transition-colors ${iconDimensions.text} ${
            lightText
              ? 'text-white'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          Flow<span className="text-blue-600 dark:text-blue-400">Drop</span>
        </span>
      )}
    </div>
  );
};
