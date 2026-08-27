import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  RefreshCw,
  Cpu,
  Database,
  User,
  LogOut,
  ChevronDown,
  Shield,
  KeyRound,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  onTriggerPipeline?: () => void;
  isPipelineRunning?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onTriggerPipeline, isPipelineRunning = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchLiveAlerts = async () => {
      try {
        const data = await api.alerts.getAll({ status: 'Open' });
        setLiveAlerts(data);
      } catch (e) {
        // silent fallback
      }
    };
    fetchLiveAlerts();
  }, []);

  const handleRecalculate = async () => {
    try {
      setRecalcLoading(true);
      await api.risk.recalculate();
      window.location.reload();
    } catch (e) {
      console.error('Recalculate failed', e);
    } finally {
      setRecalcLoading(false);
    }
  };

  const criticalAlerts = liveAlerts.filter((a) => a.severity === 'Critical');

  return (
    <header className="h-16 px-6 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-80 lg:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CVEs, asset hostnames, IOCs, threat tactics..."
            className="w-full bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Right Action Widgets */}
      <div className="flex items-center gap-3">
        {/* Synthetic Demo Data Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-400">
          <Database className="w-3 h-3 text-amber-400" />
          <span className="font-semibold">SYNTHETIC DEMO DATA</span>
        </div>

        {/* Database Health Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Supabase PostgreSQL</span>
        </div>

        {/* Run Agent Pipeline Button */}
        {onTriggerPipeline && (
          <button
            onClick={onTriggerPipeline}
            disabled={isPipelineRunning}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Cpu className={`w-3.5 h-3.5 ${isPipelineRunning ? 'animate-spin' : ''}`} />
            <span>{isPipelineRunning ? 'Running Orchestrator...' : 'Run Agent Pipeline'}</span>
          </button>
        )}

        {/* Recalculate Risk Score Button */}
        <button
          onClick={handleRecalculate}
          disabled={recalcLoading}
          title="Recalculate 5-Factor Cyber Risk Score"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${recalcLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {liveAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900"></span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Active Telemetry Alerts</span>
                <span className="text-[10px] font-mono bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">
                  {criticalAlerts.length} CRITICAL
                </span>
              </div>
              <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                {liveAlerts.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-2">No active alerts</p>
                ) : (
                  liveAlerts.slice(0, 5).map((al) => (
                    <div key={al.id} className="p-2 rounded bg-slate-950/60 border border-slate-800 text-slate-200">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white text-[11px] truncate">{al.title}</p>
                        <span className={`text-[9px] font-mono px-1 rounded uppercase font-bold ${
                          al.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                        }`}>{al.severity}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{al.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile / Auth Button */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
            >
              <img
                src={
                  user.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user.fullName}
                className="w-6 h-6 rounded-full object-cover border border-cyan-500/50"
              />
              <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                {user.fullName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* User Dropdown Menu */}
          {userMenuOpen && user && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800 mb-2">
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/50"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
                  <p className="text-[11px] text-cyan-400 font-mono truncate">{user.role}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/login?tab=switch');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Switch / Register Account</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
