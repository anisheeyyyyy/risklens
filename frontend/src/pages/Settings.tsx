import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Shield,
  Sliders,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.settings.get();
      setSettings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.settings.update(settings);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update settings', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (window.confirm('Reseed database with fresh synthetic demonstration dataset?')) {
      try {
        setReseeding(true);
        await api.settings.reseed();
        alert('Database successfully re-seeded with synthetic demonstration data!');
        window.location.reload();
      } catch (e) {
        console.error('Failed to reseed database', e);
      } finally {
        setReseeding(false);
      }
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6 animate-pulse font-mono">
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
        <div className="h-96 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            <span>ENTERPRISE RISK CONFIGURATION & PREFERENCES</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure risk scoring boundaries, autonomous defense automation interlocks, and demonstration datasets.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            Preferences Saved
          </span>
        )}
      </div>

      {/* Synthetic Demo Mode Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-400 uppercase">Synthetic Demonstration Mode Active</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              All inventory assets, CVE mappings, and adversary telemetry in this environment are synthetic simulations. Reset to baseline anytime.
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Database Engine: <span className="text-cyan-400 font-semibold">{settings.engine_mode || 'PostgreSQL'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleReseed}
          disabled={reseeding}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-colors shrink-0 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${reseeding ? 'animate-spin' : ''}`} />
          <span>{reseeding ? 'Resetting DB...' : 'Reseed Demo Data'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Organization Information */}
        <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white uppercase">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Organization Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Organization Legal Entity</label>
              <input
                type="text"
                value={settings.org_name}
                onChange={(e) => setSettings({ ...settings, org_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">CISO / SecOps Lead Email</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Risk Scoring Thresholds */}
        <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white uppercase">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Cyber Risk Score Severity Bands (0–100)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="block text-red-400 font-bold">Critical Risk Threshold</label>
              <input
                type="number"
                min="60"
                max="95"
                value={settings.risk_threshold_critical}
                onChange={(e) => setSettings({ ...settings, risk_threshold_critical: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 block">Scores ≥ {settings.risk_threshold_critical} flagged Critical</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="block text-orange-400 font-bold">High Risk Threshold</label>
              <input
                type="number"
                min="40"
                max="80"
                value={settings.risk_threshold_high}
                onChange={(e) => setSettings({ ...settings, risk_threshold_high: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 block">Scores ≥ {settings.risk_threshold_high} flagged High</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="block text-amber-400 font-bold">Medium Risk Threshold</label>
              <input
                type="number"
                min="20"
                max="60"
                value={settings.risk_threshold_medium}
                onChange={(e) => setSettings({ ...settings, risk_threshold_medium: parseInt(e.target.value, 10) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold"
              />
              <span className="text-[10px] text-slate-500 block">Scores ≥ {settings.risk_threshold_medium} flagged Moderate</span>
            </div>
          </div>
        </div>

        {/* Section 3: Autonomous Defense & Agent Interlocks */}
        <div className="p-6 rounded-2xl bg-[#111827]/90 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white uppercase">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Agentic Defense & Automation Policy</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                key: 'enable_threat_intel_stream',
                title: 'Realtime Threat Intelligence Streaming',
                desc: 'Allow ThreatInvestigationAgent to ingest real-time external IOC feeds.',
              },
              {
                key: 'enable_realtime_anomalies',
                title: 'Continuous Statistical Anomaly Detection',
                desc: 'Allow AnomalyDetectionAgent to evaluate event streams every 60 seconds.',
              },
              {
                key: 'enable_scheduled_verification',
                title: 'Post-Execution Verification Agent Health Checks',
                desc: 'Automatically recompute enterprise risk score after approved action execution.',
              },
              {
                key: 'auto_approval_low_risk',
                title: 'Auto-Authorize Low-Risk Analytical Recommendations',
                desc: 'Execute non-destructive virtual patch headers without manual click.',
              },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex items-start justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer"
              >
                <div className="pr-4">
                  <span className="font-bold text-white block">{opt.title}</span>
                  <span className="text-slate-400 text-[11px] mt-0.5 block">{opt.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(settings[opt.key])}
                  onChange={(e) => setSettings({ ...settings, [opt.key]: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-cyan-500 rounded bg-slate-800 border-slate-700"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
