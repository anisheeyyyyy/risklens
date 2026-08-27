import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AlertCard, AlertData } from '../components/AlertCard';
import { BellRing, CheckCircle2, ShieldAlert, Filter, Radio } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Open' | 'Acknowledged' | 'Resolved'>('Open');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.alerts.list();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.alerts.update(id, { status: 'Acknowledged' });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.alerts.update(id, { status: 'Resolved' });
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  const counts = {
    critical: alerts.filter((a) => a.severity === 'Critical' && a.status === 'Open').length,
    high: alerts.filter((a) => a.severity === 'High' && a.status === 'Open').length,
    medium: alerts.filter((a) => a.severity === 'Medium' && a.status === 'Open').length,
    resolved: alerts.filter((a) => a.status === 'Resolved').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-cyan-400" />
            <span>INCIDENT ALERT FEEDS & TRIAGE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security alerts correlated across vulnerabilities, adversary activity, and abnormal telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
            {counts.critical} Critical Open
          </span>
          <span className="px-2.5 py-1 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold">
            {counts.high} High Open
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#111827]/90 border border-slate-800">
        <div className="flex items-center gap-1.5">
          {(['Open', 'Acknowledged', 'Resolved', 'ALL'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-800/80 rounded-xl"></div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#111827]/60 border border-slate-800 text-center text-slate-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No matching alerts</h3>
          <p className="text-xs text-slate-500">All alerts in this category have been acknowledged or resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
};
