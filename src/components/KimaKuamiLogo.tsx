import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface LogoProps {
  variant?: 'horizontal' | 'compact' | 'icon';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const KimaKuamiLogo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'dark',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-[#F5F7F3]' : 'text-[#101312]';
  const subTextColor = isDark ? 'text-[#929B95]' : 'text-[#245C43]';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const SymbolSvg = (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0`}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={isDark ? '#1C2421' : '#101312'}
        stroke={isDark ? '#245C43' : '#1C2421'}
        strokeWidth="1.5"
      />
      {/* Left structural spine */}
      <path
        d="M14 11V37"
        stroke="#F5F7F3"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Upper kinetic wing (power & upward evolution) */}
      <path
        d="M19 24L31.5 11.5H36.5L23.5 24.5"
        fill="#B7F34A"
      />
      {/* Lower grounded force stroke */}
      <path
        d="M21 25L36 37H29.5L18.5 27.5L21 25Z"
        fill="#245C43"
      />
      {/* Precision accent bar */}
      <path
        d="M28 24H35"
        stroke="#B7F34A"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{SymbolSvg}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
        {SymbolSvg}
        <span className={`font-display font-bold tracking-tight whitespace-nowrap ${titleSizes[size]} ${textColor}`}>
          KIMA KUAMI
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      {SymbolSvg}
      <div className="flex flex-col leading-none">
        <span className={`font-display font-bold tracking-tight whitespace-nowrap ${titleSizes[size]} ${textColor}`}>
          KIMA KUAMI
        </span>
        {showTagline && (
          <span className={`text-[11px] font-medium tracking-wide mt-1 whitespace-nowrap ${subTextColor}`}>
            Fitness App
          </span>
        )}
      </div>
    </div>
  );
};

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const MediaImage: React.FC<MediaImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C2421] via-[#141A18] to-[#101312] text-[#929B95] border border-[#245C43]/30 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Dumbbell className="w-7 h-7 text-[#B7F34A]/70 mb-1.5" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-[#F5F7F3]/80 px-3 text-center truncate max-w-full">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
