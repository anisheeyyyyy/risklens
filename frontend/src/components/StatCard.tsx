import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: 'cyan' | 'red' | 'orange' | 'amber' | 'emerald' | 'purple';
}

const colorMap = {
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-glow-cyan',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-glow-red',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-glow-orange',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: '',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: '',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: '',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'cyan',
}) => {
  const c = colorMap[accentColor] || colorMap.cyan;

  return (
    <div className="p-5 rounded-xl bg-[#111827]/80 backdrop-blur-sm border border-slate-800/90 shadow-card hover:border-slate-700/80 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1.5 font-mono tracking-tight group-hover:text-cyan-300 transition-colors">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg ${c.bg} ${c.border} border ${c.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-400 text-[11px]">{subtitle}</span>}
        {trend && (
          <span
            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
              trend.isNeutral
                ? 'bg-slate-800 text-slate-300'
                : trend.isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/15 text-red-400 border border-red-500/20'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
};
