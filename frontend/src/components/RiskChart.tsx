import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { TrendingDown, TrendingUp, Calendar } from 'lucide-react';

interface RiskChartProps {
  history: Array<{
    id: string;
    overall_score: number;
    risk_level: string;
    recorded_at: string;
  }>;
}

export const RiskChart: React.FC<RiskChartProps> = ({ history = [] }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>('30d');

  // Format data for Recharts
  const formattedData = history.map((item, index) => {
    const d = new Date(item.recorded_at);
    return {
      index,
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      score: Number(item.overall_score),
      level: item.risk_level,
    };
  });

  const displayData =
    timeRange === '7d'
      ? formattedData.slice(-7)
      : timeRange === '14d'
      ? formattedData.slice(-14)
      : formattedData;

  const firstScore = displayData[0]?.score || 50;
  const lastScore = displayData[displayData.length - 1]?.score || 50;
  const scoreDelta = Math.round((lastScore - firstScore) * 10) / 10;
  const isImproving = scoreDelta <= 0; // Lower risk score is better

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/90 backdrop-blur-md border border-slate-800/90 shadow-card flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Risk Score Historical Trajectory
            </h3>
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isImproving
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
              }`}
            >
              {isImproving ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {Math.abs(scoreDelta)} pts {isImproving ? 'Reduction' : 'Increase'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous posture evaluation across 20 historical snapshot intervals.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          {(['7d', '14d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase rounded transition-all ${
                timeRange === r
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis domain={[30, 100]} stroke="#64748B" fontSize={11} tickLine={false} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0F172A] border border-slate-700 p-3 rounded-xl shadow-xl text-xs font-mono">
                      <p className="text-slate-400 mb-1">{data.date}</p>
                      <p className="font-bold text-white text-sm">
                        Score: <span className="text-cyan-400">{data.score.toFixed(1)}</span>
                      </p>
                      <p className="text-slate-400 text-[10px] uppercase mt-0.5">Tier: {data.level}</p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Threshold reference lines */}
            <ReferenceLine
              y={80}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{ value: 'Critical (80)', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={60}
              stroke="#F97316"
              strokeDasharray="4 4"
              label={{ value: 'High (60)', fill: '#F97316', fontSize: 10, position: 'insideTopRight' }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Enterprise Risk Trajectory
        </span>
        <span className="text-slate-500">Live PostgreSQL Telemetry Feed</span>
      </div>
    </div>
  );
};
