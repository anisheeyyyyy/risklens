import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  Terminal,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const Vulnerabilities: React.FC = () => {
  const [vulns, setVulns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const fetchVulns = async () => {
    try {
      setLoading(true);
      const data = await api.vulnerabilities.getAll();
      setVulns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulns();
  }, []);

  const handleFetchRemediation = async (vulnId: string) => {
    try {
      setPlanLoading(true);
      const plan = await api.vulnerabilities.getRemediation(vulnId);
      setSelectedPlan(plan);
    } catch (e) {
      console.error('Failed to load remediation plan', e);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.vulnerabilities.update(id, { status });
      fetchVulns();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'cve_id',
      header: 'CVE / Reference',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-cyan-400">{row.cve_id}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Discovered: {new Date(row.discovered_at).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Vulnerability Title & Affected Asset',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-semibold text-white truncate">{row.title}</span>
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <span>Asset:</span>
            <span className="text-slate-300 font-semibold">{row.asset_name || 'Infrastructure'}</span>
            {row.asset_criticality && (
              <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                {row.asset_criticality}
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: 'cvss_score',
      header: 'CVSS Score',
      sortable: true,
      render: (row) => {
        const score = Number(row.cvss_score);
        let badgeColor = 'bg-red-500/15 text-red-400 border-red-500/30';
        if (score < 4.0) badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
        else if (score < 7.0) badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        else if (score < 9.0) badgeColor = 'bg-orange-500/15 text-orange-400 border-orange-500/30';

        return (
          <span className={`px-2.5 py-1 rounded font-mono font-extrabold text-xs border ${badgeColor}`}>
            {score.toFixed(1)} / 10
          </span>
        );
      },
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
      key: 'status',
      header: 'Remediation Status',
      sortable: true,
      render: (row) => {
        const statusMap: Record<string, string> = {
          Open: 'text-red-400 bg-red-500/10 border-red-500/20',
          'In Progress': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          Resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          'Risk Accepted': 'text-slate-400 bg-slate-800 border-slate-700',
        };
        return (
          <select
            value={row.status}
            onChange={(e) => handleUpdateStatus(row.id, e.target.value)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${statusMap[row.status] || ''} bg-slate-900 focus:outline-none cursor-pointer`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Risk Accepted">Risk Accepted</option>
          </select>
        );
      },
    },
    {
      key: 'actions',
      header: 'AI Playbook',
      render: (row) => (
        <button
          onClick={() => handleFetchRemediation(row.id)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 font-mono text-[11px] font-bold border border-cyan-500/30 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Remediation Plan</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 font-mono">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <span>VULNERABILITY DISCLOSURE & REMEDIATION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Prioritized CVE repository mapped directly to managed infrastructure with autonomous remediation playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
            Total Open CVEs: <span className="text-red-400 font-bold">{vulns.filter((v) => v.status !== 'Resolved').length}</span>
          </span>
        </div>
      </div>

      <DataTable
        data={vulns}
        columns={columns}
        isLoading={loading}
        searchPlaceholder="Filter CVEs by identifier, keyword, or asset name..."
        filterOptions={{
          key: 'severity',
          label: 'Severities',
          options: [
            { label: 'Critical', value: 'Critical' },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
          ],
        }}
      />

      {/* Remediation Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                    {selectedPlan.playbookName}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    Est. Risk Drop: -{selectedPlan.estimatedRiskReduction} pts
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  Autonomous Remediation: {selectedPlan.cveId}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Target: {selectedPlan.affectedAsset}</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {selectedPlan.summary}
            </p>

            {/* Steps Timeline */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Execution Steps
              </h4>
              {selectedPlan.steps.map((step: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Step {step.stepNumber}: {step.action}
                    </span>
                    <span className="text-[10px] text-slate-400">{step.estimatedDowntime}</span>
                  </div>

                  {step.commandSnippet && (
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] flex items-start gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <pre className="overflow-x-auto whitespace-pre-wrap">{step.commandSnippet}</pre>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400">
                    <span className="text-slate-500">Verification:</span> {step.verificationMethod}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
              <span className="font-bold">Rollback Procedure: </span>
              {selectedPlan.rollbackPlan}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close Playbook
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedPlan.vulnerabilityId, 'In Progress');
                  setSelectedPlan(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-glow-cyan"
              >
                Accept & Transition to In Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
