import React, { useState } from 'react';
import { ShieldAlert, HelpCircle, ChevronRight, X, Info } from 'lucide-react';

interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  contribution: number;
  explanation: string;
}

interface RiskScoreProps {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors?: RiskFactor[];
  compact?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({ score, level, factors = [], compact = false }) => {
  const [showFactorModal, setShowFactorModal] = useState(false);

  // SVG Gauge calculations (Semi-circle Arc)
  const radius = 80;
  const strokeWidth = 14;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = Math.PI * radius; // 180 degree semi-circle
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#10B981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.3)';
  let badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';

  if (level === 'Critical') {
    strokeColor = '#EF4444';
    glowColor = 'rgba(239, 68, 68, 0.4)';
    badgeBg = 'bg-red-500/15 border-red-500/30 text-red-400';
  } else if (level === 'High') {
    strokeColor = '#F97316';
    glowColor = 'rgba(249, 115, 22, 0.4)';
    badgeBg = 'bg-orange-500/15 border-orange-500/30 text-orange-400';
  } else if (level === 'Moderate') {
    strokeColor = '#F59E0B';
    glowColor = 'rgba(245, 158, 11, 0.4)';
    badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs border ${badgeBg}`}>
          {score.toFixed(1)} / 100 — {level.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/90 backdrop-blur-md border border-slate-800/90 shadow-card flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      ></div>

      <div className="w-full flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Enterprise Cyber Risk Score
          </h3>
        </div>
        <button
          onClick={() => setShowFactorModal(true)}
          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why is this score {score}?</span>
        </button>
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative my-4 flex items-center justify-center">
        <svg width="220" height="130" viewBox="0 0 200 120" className="overflow-visible">
          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Risk Score Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute top-12 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 -mt-0.5">
            Out of 100
          </span>
        </div>
      </div>

      {/* Status Badges & Summary */}
      <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800/80 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Posture:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border uppercase ${badgeBg}`}>
            {level} Risk
          </span>
        </div>
        <button
          onClick={() => setShowFactorModal(true)}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium group"
        >
          <span>5-Factor Model</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Factor Breakdown Modal */}
      {showFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  Cyber Risk Score Explainability Model
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Deterministic 5-factor mathematical weighting computed across active assets, vulnerabilities, and telemetry.
                </p>
              </div>
              <button
                onClick={() => setShowFactorModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formula Reference */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 text-center">
              RiskScore = (0.30 &times; S_vuln) + (0.20 &times; S_asset) + (0.25 &times; S_threat) + (0.15 &times; S_event) + (0.10 &times; S_controls)
            </div>

            {/* Factor List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {factors.map((f, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{f.factor}</span>
                      <span className="font-mono text-[10px] text-slate-400">Weight: {(f.weight * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Raw: {f.score.toFixed(1)}</span>
                      <span className="text-cyan-400 font-bold">Contribution: +{f.contribution.toFixed(1)} pts</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.min(100, (f.score / 100) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-0.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{f.explanation}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowFactorModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
