import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Server,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Brain,
  RefreshCw,
  ShieldAlert,
  Activity,
  ArrowRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getDashboard, recalculateRiskScore } from "../services/api";

/* ----------------------------------------------------------------
   Types matching the actual backend API response shape
   GET /api/dashboard →  { success: true, data: { riskScore, riskHistory, stats, ... } }
---------------------------------------------------------------- */
type RiskScore = {
  overall_score: number;
  risk_level: string;
  vuln_severity_score?: number;
  asset_criticality_score?: number;
  threat_exposure_score?: number;
  security_event_score?: number;
  controls_gap_score?: number;
  factor_breakdown?: Record<string, number>;
};

type RiskHistoryItem = {
  id?: string;
  overall_score?: number;
  score?: number;
  risk_level?: string;
  recorded_at?: string;
  date?: string;
};

type Stats = {
  protectedAssets: number;
  criticalAssets?: number;
  openVulnerabilities: number;
  criticalVulnerabilities?: number;
  activeThreats: number;
  criticalThreats?: number;
  openAlerts?: number;
  securityHealthScore: number;
};

type TopRecommendation = {
  title: string;
  description: string;
  agent?: string;
  estimatedReduction?: string;
  targetAsset?: string;
};

type RecentEvent = {
  id?: string;
  event_type?: string;
  description?: string;
  severity?: string;
  asset_name?: string;
  occurred_at?: string;
  created_at?: string;
  // from alerts shape
  title?: string;
  source_type?: string;
};

type DashboardResponse = {
  riskScore: RiskScore;
  riskHistory: RiskHistoryItem[];
  stats: Stats;
  topRecommendation?: TopRecommendation;
  recentEvents?: RecentEvent[];
  activeAlerts?: RecentEvent[];
};

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState(false);

  async function loadDashboard() {
    try {
      setError("");
      // getDashboard returns result.data from the API wrapper
      const raw = await getDashboard() as unknown as DashboardResponse;
      setDashboard(raw);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleRecalculate() {
    try {
      setRecalculating(true);
      await recalculateRiskScore();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Risk recalculation failed"
      );
    } finally {
      setRecalculating(false);
    }
  }

  /* ---- loading state ---- */
  if (loading) {
    return (
      <section className="content">
        <div className="loading-screen">
          <div className="flex flex-col items-center gap-3">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
            <span>Loading live RiskLens data...</span>
          </div>
        </div>
      </section>
    );
  }

  /* ---- error state ---- */
  if (error) {
    return (
      <section className="content">
        <div className="error-screen">
          <AlertTriangle size={24} />
          <div>
            <strong>Unable to load dashboard</strong>
            <p>{error}</p>
          </div>
          <button className="scan-button" onClick={loadDashboard}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="content">
        <div className="loading-screen">No dashboard data available.</div>
      </section>
    );
  }

  /* ---- derived values from real API fields ---- */
  const score = Number(dashboard.riskScore?.overall_score ?? 0);
  const riskLevel = dashboard.riskScore?.risk_level ?? "Unknown";
  const stats = dashboard.stats ?? {} as Stats;

  const history = (dashboard.riskHistory ?? []).map((item) => ({
    date: item.recorded_at
      ? new Date(item.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : item.date ?? "",
    score: Number(item.overall_score ?? item.score ?? 0),
  }));

  const recommendation = dashboard.topRecommendation;

  // Merge recentEvents + activeAlerts for the activity feed
  const recentActivity = [
    ...(dashboard.recentEvents ?? []),
    ...(dashboard.activeAlerts ?? []),
  ].slice(0, 10);

  // Risk factors from the riskScore breakdown
  const rs = dashboard.riskScore;
  const factors = [
    { title: "Vulnerability Severity", value: Number(rs?.vuln_severity_score ?? 0).toFixed(1) },
    { title: "Asset Criticality", value: Number(rs?.asset_criticality_score ?? 0).toFixed(1) },
    { title: "Threat Exposure", value: Number(rs?.threat_exposure_score ?? 0).toFixed(1) },
    { title: "Security Event Velocity", value: Number(rs?.security_event_score ?? 0).toFixed(1) },
    { title: "Controls Hygiene", value: Number(rs?.controls_gap_score ?? 0).toFixed(1) },
  ];

  return (
    <section className="content">
      {/* ── HEADER ── */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">LIVE SECURITY POSTURE</p>
          <h1>Executive Security Dashboard</h1>
          <p>Real-time risk intelligence from Supabase PostgreSQL database.</p>
        </div>
        <button
          className="scan-button"
          onClick={handleRecalculate}
          disabled={recalculating}
        >
          <RefreshCw size={15} className={recalculating ? "spin" : ""} />
          {recalculating ? "Recalculating..." : "Recalculate Risk"}
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="stats-grid">
        <StatCard
          icon={<Server size={20} />}
          title="Protected Assets"
          value={stats.protectedAssets ?? 0}
          type="blue"
          onClick={() => navigate('/assets')}
        />
        <StatCard
          icon={<Bug size={20} />}
          title="Open Vulnerabilities"
          value={stats.openVulnerabilities ?? 0}
          type="purple"
          onClick={() => navigate('/vulnerabilities')}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          title="Active Threats"
          value={stats.activeThreats ?? 0}
          type="orange"
          onClick={() => navigate('/threats')}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Security Health"
          value={`${stats.securityHealthScore ?? 0}%`}
          type="green"
          onClick={() => navigate('/ai-insights')}
        />
      </div>

      {/* ── RISK SCORE + RISK FACTORS ── */}
      <div className="dashboard-grid">
        {/* Risk Score Card */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="card-label">LIVE CYBER RISK SCORE</span>
              <div className="risk-score">
                {score.toFixed(1)}<span>/100</span>
              </div>
            </div>
            <span
              className="risk-pill"
              style={
                riskLevel === "Low"
                  ? { background: "rgba(16,185,129,0.12)", color: "#34d399", borderColor: "rgba(16,185,129,0.3)" }
                  : riskLevel === "Medium"
                  ? { background: "rgba(245,158,11,0.12)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.3)" }
                  : riskLevel === "High"
                  ? { background: "rgba(249,115,22,0.12)", color: "#fb923c", borderColor: "rgba(249,115,22,0.3)" }
                  : {}
              }
            >
              {riskLevel}
            </span>
          </div>
          <div className="risk-progress">
            <div
              className="risk-progress-fill"
              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
            />
          </div>
          <div className="score-footer">
            <span className="positive-text">Live calculation</span>
            <span>From Supabase PostgreSQL</span>
          </div>
        </div>

        {/* Risk Factors Card */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="card-label">RISK FACTOR BREAKDOWN</span>
              <h4>5-Factor Risk Model</h4>
            </div>
            <Brain size={20} />
          </div>
          <div className="factor-list">
            {factors.map((f) => (
              <Factor key={f.title} title={f.title} value={f.value} />
            ))}
          </div>
        </div>
      </div>

      {/* ── RISK HISTORY + AI INSIGHT ── */}
      <div className="dashboard-grid">
        {/* Risk History Chart */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="card-label">RISK HISTORY</span>
              <h4>Historical cyber risk score</h4>
            </div>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            {history.length === 0 ? (
              <div className="loading-screen">No risk history available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c5cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={{ stroke: "#334155" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#e2e8f0",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7c5cff"
                    strokeWidth={2.5}
                    fill="url(#riskGrad)"
                    dot={{ fill: "#7c5cff", r: 3 }}
                    activeDot={{ r: 5, fill: "#a78bfa" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Insight / Top Recommendation */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="card-label">AI SECURITY INTELLIGENCE</span>
              <h4>Autonomous recommendation</h4>
            </div>
            <Brain size={20} />
          </div>

          {recommendation ? (
            <>
              <div className="recommendation" style={{ marginBottom: "0.75rem" }}>
                <div className="recommendation-dot critical" />
                <div>
                  <strong>{recommendation.title}</strong>
                  <p>{recommendation.description}</p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                  marginTop: "0.5rem",
                }}
              >
                {recommendation.agent && (
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "0.4rem",
                      background: "rgba(6,182,212,0.1)",
                      border: "1px solid rgba(6,182,212,0.25)",
                      color: "#22d3ee",
                      fontSize: "0.62rem",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    {recommendation.agent}
                  </span>
                )}
                {recommendation.estimatedReduction && (
                  <span
                    style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "0.4rem",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      color: "#34d399",
                      fontSize: "0.62rem",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    Est. -{recommendation.estimatedReduction} risk reduction
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="recommendation">
              <div className="recommendation-dot success" />
              <div>
                <strong>System Baseline Normal</strong>
                <p>No critical recommendations at this time. Continuous monitoring is active.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <span className="card-label">LIVE DATABASE ACTIVITY</span>
            <h4>Recent Security Events &amp; Alerts</h4>
          </div>
          <ShieldAlert size={18} style={{ color: "#475569" }} />
        </div>

        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <div className="loading-screen">No recent security activity</div>
          ) : (
            recentActivity.map((item, idx) => {
              const sev = (item.severity ?? "").toLowerCase();
              const iconClass =
                sev === "critical" ? "critical" : sev === "high" ? "warning" : "success";
              const label = item.title || item.description || item.event_type || "Security Event";
              const time = item.occurred_at || item.created_at || "";

              return (
                <div
                  className="activity-item cursor-pointer hover:bg-slate-800/60 transition-colors"
                  key={item.id || idx}
                  onClick={() => navigate('/alerts')}
                  title="Click to view Alert details"
                >
                  <div className={`activity-icon ${iconClass}`}>
                    {sev === "critical" || sev === "high" ? (
                      <AlertTriangle size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong className="block truncate">{label}</strong>
                    <span>
                      {item.source_type || item.asset_name || "RiskLens"}
                      {time ? ` • ${new Date(time).toLocaleString()}` : ""}
                    </span>
                  </div>
                  {item.severity && (
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "0.3rem",
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background:
                          sev === "critical"
                            ? "rgba(239,68,68,0.12)"
                            : sev === "high"
                            ? "rgba(249,115,22,0.12)"
                            : "rgba(16,185,129,0.12)",
                        color:
                          sev === "critical"
                            ? "#f87171"
                            : sev === "high"
                            ? "#fb923c"
                            : "#34d399",
                        border: "1px solid",
                        borderColor:
                          sev === "critical"
                            ? "rgba(239,68,68,0.25)"
                            : sev === "high"
                            ? "rgba(249,115,22,0.25)"
                            : "rgba(16,185,129,0.25)",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.severity}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ── */

function Factor({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="factor">
      <div>
        <span>{title}</span>
        <small>From live database</small>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  type,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  type: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`stat-card ${onClick ? "cursor-pointer hover:border-cyan-500/50 hover:scale-[1.02] transition-all" : ""}`}
      onClick={onClick}
      title={onClick ? `View ${title}` : undefined}
    >
      <div className={`stat-icon ${type}`}>{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}