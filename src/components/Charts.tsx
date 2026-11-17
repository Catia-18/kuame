import React, { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineTrendChartProps {
  data: DataPoint[];
  unit?: string;
  accentColor?: string;
  height?: number;
  formatValue?: (val: number) => string;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  unit = '',
  accentColor = '#B7F34A',
  height = 170,
  formatValue,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#929B95]">
        Sem registos disponíveis para o período selecionado.
      </div>
    );
  }

  const width = 420;
  const padX = 28;
  const padY = 22;
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const coords = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((d.value - minVal) / range) * (height - padY * 2);
    return { x, y, ...d };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = `M ${coords[0].x},${height - padY} L ${coords
    .map((c) => `${c.x},${c.y}`)
    .join(' L ')} L ${coords[coords.length - 1].x},${height - padY} Z`;

  const activePoint = hoverIdx !== null ? coords[hoverIdx] : coords[coords.length - 1];
  const displayVal = formatValue
    ? formatValue(activePoint.value)
    : `${activePoint.value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-[#929B95]">{activePoint.label}</span>
        <span className="text-sm font-semibold font-mono-tabular text-[#F5F7F3] tabular-nums">
          {displayVal}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label="Gráfico de tendência"
      >
        <defs>
          <linearGradient id="kkLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle horizontal reference lines */}
        {[0.25, 0.5, 0.75].map((pct) => {
          const y = padY + pct * (height - padY * 2);
          return (
            <line
              key={pct}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#245C43"
              strokeOpacity="0.3"
              strokeDasharray="3 4"
            />
          );
        })}

        <path d={areaPath} fill="url(#kkLineFill)" />
        <polyline
          fill="none"
          stroke={accentColor}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {coords.map((c, idx) => {
          const isSelected = hoverIdx === idx || (hoverIdx === null && idx === coords.length - 1);
          return (
            <g
              key={c.label}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => setHoverIdx(idx)}
            >
              <circle cx={c.x} cy={c.y} r="14" fill="transparent" />
              <circle
                cx={c.x}
                cy={c.y}
                r={isSelected ? 5 : 3.5}
                fill={isSelected ? accentColor : '#1C2421'}
                stroke={accentColor}
                strokeWidth="2"
              />
              <text
                x={c.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-[#929B95] text-[10px]"
              >
                {c.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

interface BarComparisonChartProps {
  data: { label: string; primary: number; secondary?: number }[];
  primaryLabel?: string;
  secondaryLabel?: string;
  formatValue?: (val: number) => string;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  primaryLabel = 'Recebido',
  secondaryLabel = 'Pendente',
  formatValue,
}) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.primary, d.secondary || 0]), 1);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-4 text-xs text-[#929B95]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B7F34A]" />
          {primaryLabel}
        </span>
        {data.some((d) => d.secondary !== undefined) && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#245C43]" />
            {secondaryLabel}
          </span>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2 items-end h-36 pt-3">
        {data.map((item) => {
          const pHeight = Math.max(8, Math.round((item.primary / maxVal) * 100));
          const sHeight = item.secondary !== undefined
            ? Math.max(4, Math.round((item.secondary / maxVal) * 100))
            : 0;

          return (
            <div key={item.label} className="flex flex-col items-center h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 flex-1">
                <div
                  title={`${item.label} (${primaryLabel}): ${
                    formatValue ? formatValue(item.primary) : item.primary
                  }`}
                  style={{ height: `${pHeight}%` }}
                  className="w-3.5 sm:w-4 rounded-t-md bg-[#B7F34A] transition-opacity group-hover:opacity-90"
                />
                {item.secondary !== undefined && (
                  <div
                    title={`${item.label} (${secondaryLabel}): ${
                      formatValue ? formatValue(item.secondary) : item.secondary
                    }`}
                    style={{ height: `${sHeight}%` }}
                    className="w-3.5 sm:w-4 rounded-t-md bg-[#245C43]"
                  />
                )}
              </div>
              <span className="text-[11px] text-[#929B95] mt-2 font-mono-tabular">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export const DonutDistributionChart: React.FC<{
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}> = ({ segments, centerValue, centerLabel }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="#101312"
            strokeWidth="12"
          />
          {segments.map((seg) => {
            const segLen = (seg.value / total) * circumference;
            const dashArray = `${segLen} ${circumference - segLen}`;
            const dashOffset = -offsetAcc;
            offsetAcc += segLen;
            return (
              <circle
                key={seg.label}
                cx="56"
                cy="56"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold font-mono-tabular text-[#F5F7F3] tabular-nums">
            {centerValue}
          </span>
          <span className="text-[11px] text-[#929B95]">{centerLabel}</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={seg.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[#F5F7F3]">{seg.label}</span>
              </div>
              <span className="font-mono-tabular text-[#929B95] tabular-nums">
                {seg.value} · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProgressRing: React.FC<{
  percent: number;
  size?: number;
  strokeWidth?: number;
}> = ({ percent, size = 64, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#101312"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#B7F34A"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-xs font-bold font-mono-tabular text-[#F5F7F3] tabular-nums">
        {clamped}%
      </span>
    </div>
  );
};
