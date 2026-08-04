"use client";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: number;
}

export default function ScoreGauge({ score, label = "Overall Score", size = 180 }: ScoreGaugeProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorGradientId = "score-gradient-yellow";
  let statusText = "Needs Work";
  let statusColor = "text-amber-600";

  if (normalizedScore >= 80) {
    colorGradientId = "score-gradient-green";
    statusText = "Excellent";
    statusColor = "text-emerald-600";
  } else if (normalizedScore >= 60) {
    colorGradientId = "score-gradient-blue";
    statusText = "Good";
    statusColor = "text-indigo-600";
  } else if (normalizedScore < 40) {
    colorGradientId = "score-gradient-red";
    statusText = "Needs Major Fixes";
    statusColor = "text-rose-600";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="score-gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="score-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="score-gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="score-gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${colorGradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black tracking-tight text-slate-900">
            {normalizedScore}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-0.5">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className={`text-sm font-bold ${statusColor}`}>{statusText}</span>
        {label && <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>}
      </div>
    </div>
  );
}
