import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Clock, ArrowUpRight } from 'lucide-react';

export interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source_type: 'vulnerability' | 'threat' | 'security_event' | 'system';
  asset_id?: string;
  asset_name?: string;
  vulnerability_id?: string;
  threat_id?: string;
  status: 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  created_at: string;
  acknowledged_by_name?: string;
}

interface AlertCardProps {
  alert: AlertData;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDrilldown?: (alert: AlertData) => void;
}

const severityConfig = {
  Critical: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    border: 'border-red-500/20 hover:border-red-500/40',
    iconColor: 'text-red-400',
  },
  High: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    iconColor: 'text-orange-400',
  },
  Medium: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
  },
  Low: {
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onDrilldown,
}) => {
  const conf = severityConfig[alert.severity] || severityConfig.Medium;

  return (
    <div
      className={`p-4 rounded-xl bg-[#111827]/80 backdrop-blur-sm border ${conf.border} shadow-card transition-all flex flex-col justify-between gap-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 p-2 rounded-lg bg-slate-900 border border-slate-800 ${conf.iconColor}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${conf.badge}`}>
                {alert.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {alert.source_type}
              </span>
              {alert.asset_name && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {alert.asset_name}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white tracking-tight leading-snug">{alert.title}</h4>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{new Date(alert.created_at).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {alert.status === 'Open' && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Acknowledge
            </button>
          )}

          {alert.status !== 'Resolved' && onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
            >
              Resolve
            </button>
          )}

          {alert.status === 'Resolved' && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved
            </span>
          )}

          {onDrilldown && (
            <button
              onClick={() => onDrilldown(alert)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Inspect Details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
