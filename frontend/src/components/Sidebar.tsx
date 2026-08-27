import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  Flame,
  BrainCircuit,
  BellRing,
  FileText,
  Settings,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = React.useState<{ alerts: number; threats: number; vulns: number }>({
    alerts: 0,
    threats: 0,
    vulns: 0,
  });

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [alerts, threats, vulns] = await Promise.all([
          api.alerts.getAll({ status: 'Open' }),
          api.threats.getAll({ status: 'Active' }),
          api.vulnerabilities.getAll({ status: 'Open' }),
        ]);
        setCounts({
          alerts: alerts.length,
          threats: threats.length,
          vulns: vulns.length,
        });
      } catch (e) {
        // silent fallback
      }
    };
    fetchCounts();
  }, []);

  const navigationItems = [
    { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Asset Inventory', path: '/assets', icon: Server },
    { name: 'Vulnerabilities', path: '/vulnerabilities', icon: ShieldAlert, badge: counts.vulns > 0 ? `${counts.vulns}` : undefined, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { name: 'Threat Intelligence', path: '/threats', icon: Flame, badge: counts.threats > 0 ? `${counts.threats} Active` : undefined, badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { name: 'AI Insights & Agents', path: '/ai-insights', icon: BrainCircuit, badge: 'Live', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { name: 'Alert Feeds', path: '/alerts', icon: BellRing, badge: counts.alerts > 0 ? `${counts.alerts}` : undefined, badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { name: 'Security Reports', path: '/reports', icon: FileText },
    { name: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5 shadow-glow-cyan flex items-center justify-center">
          <div className="w-full h-full bg-[#0F172A] rounded-[7px] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold tracking-wider text-base text-white flex items-center gap-1.5">
            RISK <span className="text-cyan-400">LENS</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold">
            Defense Operations
          </span>
        </div>
      </div>

      {/* Live System Status Widget */}
      <div className="px-4 py-3 m-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span className="font-medium text-[11px] uppercase tracking-wider">Supabase Live DB</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            ACTIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>AI Agents: 10 Online</span>
          <span className="text-cyan-400">0.94 Conf</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-l"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Analyst Profile / Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <div
          onClick={() => navigate('/settings')}
          title="Click to view Analyst Profile & System Settings"
          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:bg-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <img
            src={
              user?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user?.fullName || 'SecOps Analyst'}
            className="w-8 h-8 rounded-full border border-cyan-500/40 object-cover group-hover:scale-105 transition-transform"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {user?.fullName || 'Authenticate'}
            </p>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              {user?.role || 'Click to Sign In'}
            </p>
          </div>
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );
};
