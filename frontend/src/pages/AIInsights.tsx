import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BrainCircuit,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Play,
  RotateCw,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const AIInsights: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'forecast' | 'compliance' | 'anomalies'>('agents');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsRes, tasksRes] = await Promise.all([
        api.ai.getInsights(),
        api.ai.getTasks(),
      ]);
      setData(insightsRes as any);
      setTasks(tasksRes as any[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setRunningPipeline(true);
      await api.ai.runPipeline();
      await fetchData();
    } catch (e) {
      console.error('Pipeline failed', e);
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    try {
      setActionLoadingId(taskId);
      await api.ai.approveTask(taskId);
      await fetchData();
    } catch (e) {
      console.error('Approval failed', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (taskId: string) => {
    try {
      setActionLoadingId(taskId);
      await api.ai.rejectTask(taskId, 'Unauthorized by SecOps analyst.');
      await fetchData();
    } catch (e) {
      console.error('Rejection failed', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
        <div className="h-48 bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800 rounded-2xl"></div>
          <div className="h-64 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === 'pending_approval');
  const completedTasks = tasks.filter((t) => t.status !== 'pending_approval');
  const forecast = data.forecast;
  const anomalies = data.anomalies || [];
  const compliance = data.compliance;
  const insights = data.insights || [];

  return (
    <div className="space-y-7 animate-in fade-in duration-300 font-mono">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>AI INSIGHTS & AUTONOMOUS AGENT ORCHESTRATOR</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable mathematical risk scoring, predictive trajectory forecasting, and human-in-the-loop defense execution.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={runningPipeline}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${runningPipeline ? 'animate-spin' : ''}`} />
          <span>{runningPipeline ? 'Running Orchestrator...' : 'Trigger Full Orchestrator Pipeline'}</span>
        </button>
      </div>

      {/* Human Approval Gate Section (Rendered prominently when pending tasks exist) */}
      {pendingTasks.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-950/20 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Human-in-the-Loop Authorization Gate ({pendingTasks.length} Action Pending)
              </h3>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              PROTECTIVE SAFETY INTERLOCK ENGAGED
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Autonomous analytical agents have proposed destructive or state-changing containment actions. SecOps Analyst explicit authorization is required prior to infrastructure command dispatch.
          </p>

          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const action = task.actions?.[0];
              const isLoading = actionLoadingId === task.id;
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-cyan-400">{task.agent_name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Target: {task.related_entity_type} ({task.related_entity_id})</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {action?.action_type || 'Defensive Containment Action'}
                    </h4>
                    <p className="text-xs text-slate-300">{action?.description || task.output_payload?.recommended_action}</p>
                    <p className="text-[11px] text-amber-400 mt-1">
                      Justification: {task.output_payload?.risk_impact || task.output_payload?.riskJustification || 'Prevents potential exploit execution.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(task.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold border border-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Action</span>
                    </button>
                    <button
                      onClick={() => handleApprove(task.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isLoading ? 'Executing & Verifying...' : 'Authorize & Execute'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'agents', label: '10-Agent Pipeline & Tasks' },
          { id: 'forecast', label: '30-Day Risk Trajectory Forecast' },
          { id: 'compliance', label: 'Compliance Posture & Gaps' },
          { id: 'anomalies', label: 'Statistical Anomaly Signals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: 10 AGENT PIPELINE & TIMELINE */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* 10 Agent Architecture Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              { name: 'Risk Detection', role: 'Emerging risk correlation', icon: ShieldAlert },
              { name: 'Risk Prioritization', role: 'Impact×Likelihood matrix', icon: Sliders },
              { name: 'Threat Investigation', role: 'Timeline & IOC mapping', icon: Eye },
              { name: 'Vuln Remediation', role: 'Patch playbooks', icon: Zap },
              { name: 'Threat Response', role: 'Human-gated containment', icon: AlertTriangle },
              { name: 'Risk Forecasting', role: '30-day projection', icon: TrendingDown },
              { name: 'Anomaly Detection', role: 'Statistical telemetry spikes', icon: BrainCircuit },
              { name: 'Compliance Agent', role: 'CIS / NIST / PCI audits', icon: ShieldCheck },
              { name: 'Security Report', role: 'Briefing drafts', icon: Cpu },
              { name: 'Verification Agent', role: 'Post-action score delta', icon: CheckCircle2 },
            ].map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div key={i} className="p-3 rounded-xl bg-[#111827]/90 border border-slate-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{agent.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{agent.role}</p>
                </div>
              );
            })}
          </div>

          {/* Agent Tasks Execution History Table */}
          <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Agent Tasks & Verification Log</span>
              <span className="text-xs text-slate-400 font-normal">Total Executions: {tasks.length}</span>
            </h3>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400">{task.agent_name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">[{task.id}]</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-400">{new Date(task.created_at).toLocaleString()}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : task.status === 'pending_approval'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    {task.output_payload?.summary || task.output_payload?.message || task.output_payload?.title || JSON.stringify(task.output_payload)}
                  </p>

                  {task.actions && task.actions.length > 0 && (
                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300">
                      <span className="text-slate-400">Action:</span> {task.actions[0].action_type} — {task.actions[0].description} ({task.actions[0].status})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 30-DAY FORECAST */}
      {activeTab === 'forecast' && forecast && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Risk Forecasting Agent Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{forecast.confidenceNote}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Current: {forecast.currentScore} / 100
              </span>
            </div>

            {/* Forecast Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="projectedDate" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[10, 100]} stroke="#64748B" fontSize={11} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-[#0F172A] border border-slate-700 p-3 rounded-xl shadow-xl text-xs font-mono">
                            <p className="text-slate-400">{pt.projectedDate} (Day {pt.day})</p>
                            <p className="font-bold text-emerald-400 text-sm">
                              Predicted Score: {pt.projectedScore}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Confidence Bounds: [{pt.lowerConfidenceBound} - {pt.upperConfidenceBound}]
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projectedScore"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forecastGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              {forecast.summary}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLIANCE POSTURE */}
      {activeTab === 'compliance' && compliance && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Regulatory Compliance & Controls Posture
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{compliance.summary}</p>
              </div>
              <span className="text-base font-extrabold px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {compliance.complianceScore}% Compliant
              </span>
            </div>

            <div className="space-y-3">
              {compliance.gaps.map((gap: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{gap.framework} — {gap.controlId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                      {gap.severity} Severity Gap
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200">{gap.title}</h4>
                  <p className="text-slate-400 text-[11px]">{gap.gapDescription}</p>
                  <p className="text-cyan-300 text-[11px] pt-1">
                    <span className="text-slate-500">Remediation:</span> {gap.remediationRecommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATISTICAL ANOMALIES */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Telemetry Anomaly Detection Stream
            </h3>
            <div className="space-y-3">
              {anomalies.map((ano: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">{ano.anomalyType}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      Confidence: {(ano.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-slate-200">{ano.observedPattern}</p>
                  <p className="text-[11px] text-slate-400">{ano.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
