import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import {
  Flame,
  Search,
  Crosshair,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export const Threats: React.FC = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvestigation, setSelectedInvestigation] = useState<any | null>(null);
  const [investigating, setInvestigating] = useState(false);

  const fetchThreats = async () => {
    try {
      setLoading(true);
      const data = await api.threats.getAll();
      setThreats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, []);

  const handleInvestigate = async (threatId: string) => {
    try {
      setInvestigating(true);
      const report = await api.threats.investigate(threatId);
      setSelectedInvestigation(report);
    } catch (e) {
      console.error(e);
    } finally {
      setInvestigating(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'threat_name',
      header: 'Threat Campaign / Indicator',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-wide">{row.threat_name}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Source: {row.source}
          </span>
        </div>
      ),
    },
    {
      key: 'threat_type',
      header: 'Kill-Chain Category',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
          {row.threat_type}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (row) => {
        const colors: Record<string, string> = {
          Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
          High: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          Low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
        return (
          <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] border ${colors[row.severity] || ''}`}>
            {row.severity}
          </span>
        );
      },
    },
    {
      key: 'asset_name',
      header: 'Target Asset',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-cyan-400 text-xs">
          {row.asset_name || 'Perimeter Network'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const colors: Record<string, string> = {
          Active: 'text-red-400 bg-red-500/10 border-red-500/20',
          Investigating: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          Contained: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          Mitigated: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${colors[row.status] || ''}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'tactics_techniques',
      header: 'MITRE ATT&CK',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.tactics_techniques || []).slice(0, 2).map((t: string, i: number) => (
            <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Investigation',
      render: (row) => (
        <button
          onClick={() => handleInvestigate(row.id)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono font-semibold border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Investigate</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-mono">
            <Flame className="w-6 h-6 text-orange-400" />
            <span>THREAT INTELLIGENCE & ADVERSARY TRACKING</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Live telemetry correlation and autonomous investigation across active kill-chain vectors.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-ping" />
            Active Threats: <span className="text-red-400 font-bold">{threats.filter((t) => t.status === 'Active').length}</span>
          </span>
        </div>
      </div>

      <DataTable
        data={threats}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Filter threats by name, category, or adversary source..."
        filterOptions={{
          key: 'status',
          label: 'Status',
          options: [
            { label: 'Active', value: 'Active' },
            { label: 'Investigating', value: 'Investigating' },
            { label: 'Contained', value: 'Contained' },
            { label: 'Mitigated', value: 'Mitigated' },
          ],
        }}
      />

      {/* Threat Investigation Detail Drawer/Modal */}
      {selectedInvestigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 font-mono">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                    ThreatInvestigationAgent
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    Confidence: {(selectedInvestigation.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Investigation: {selectedInvestigation.threatName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvestigation(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Adversary Intent */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Adversary Intent & Hypothesis
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedInvestigation.adversaryIntent}
              </p>
            </div>

            {/* Correlated IOCs & Tactics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Correlated IOCs</span>
                <div className="space-y-1">
                  {selectedInvestigation.correlatedIocs.map((ioc: string, i: number) => (
                    <span key={i} className="block text-[11px] text-cyan-300 truncate">
                      • {ioc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">MITRE Tactics</span>
                <div className="space-y-1">
                  {selectedInvestigation.tacticsSummary.map((tac: string, i: number) => (
                    <span key={i} className="block text-[11px] text-amber-300 truncate">
                      • {tac}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Correlated Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Correlated Signal Timeline</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedInvestigation.investigationTimeline.map((item: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="text-cyan-400 font-bold">{item.eventType}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Containment Recommendation */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
              <span className="font-bold text-cyan-400">Containment Action: </span>
              {selectedInvestigation.containmentRecommendation}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedInvestigation(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
