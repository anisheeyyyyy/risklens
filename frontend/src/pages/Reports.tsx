import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<'executive' | 'vulnerability' | 'threat' | 'compliance'>('executive');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api.reports.getAll() as any[];
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const report = await api.reports.generate(selectedType);
      setSelectedReport(report);
      fetchReports();
    } catch (e) {
      console.error('Report generation failed', e);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !selectedReport) {
    return (
      <div className="space-y-6 animate-pulse font-mono">
        <div className="h-8 bg-slate-800 rounded w-1/3"></div>
        <div className="h-96 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>SECURITY AUDIT & EXECUTIVE REPORTS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous reporting drafts compiled by SecurityReportAgent for C-Suite, SecOps, and compliance officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="executive">Executive Posture Briefing</option>
            <option value="vulnerability">Vulnerability Exposure Audit</option>
            <option value="threat">Threat Intelligence Briefing</option>
            <option value="compliance">Compliance & Controls Audit</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-colors disabled:opacity-50"
          >
            <Cpu className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Drafting Report...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Container */}
      {selectedReport && (
        <div className="p-8 lg:p-10 rounded-2xl bg-[#111827]/95 border border-slate-800 shadow-2xl space-y-8 print:p-0 print:border-none print:bg-white print:text-black">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mb-1 print:text-blue-700">
                <span>CLASSIFICATION: CONFIDENTIAL // SECOPS DIRECTIVE</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight print:text-black">
                {selectedReport.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                Organization: <span className="text-white font-bold print:text-black">{selectedReport.organization}</span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end text-xs text-slate-400 space-y-1 print:text-slate-600">
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Generated: {new Date(selectedReport.generatedAt).toLocaleDateString()}</span>
              </span>
              <span className="text-[11px] text-cyan-400 print:text-blue-700 font-semibold">
                {selectedReport.generatedBy}
              </span>

              <div className="pt-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print / Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary Narrative */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed print:bg-slate-50 print:border-slate-200 print:text-black">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 print:text-blue-700">
              Executive Briefing Narrative
            </h3>
            <p>{selectedReport.executiveSummary}</p>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Risk Score', val: `${selectedReport.riskScore?.overall_score || 82.4} / 100`, highlight: 'text-cyan-400' },
              { label: 'Risk Band', val: selectedReport.riskScore?.risk_level || 'High', highlight: 'text-red-400' },
              { label: 'Managed Assets', val: selectedReport.metrics?.totalAssets || 20, highlight: 'text-white' },
              { label: 'Open CVEs', val: selectedReport.metrics?.openVulnerabilities || 38, highlight: 'text-amber-400' },
              { label: 'Critical CVEs', val: selectedReport.metrics?.criticalVulnerabilities || 5, highlight: 'text-red-400' },
              { label: 'Active Threats', val: selectedReport.metrics?.activeThreats || 4, highlight: 'text-orange-400' },
            ].map((m, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between print:bg-slate-100 print:border-slate-300">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider print:text-slate-600">{m.label}</span>
                <span className={`text-base font-extrabold mt-1 font-mono ${m.highlight} print:text-black`}>
                  {m.val}
                </span>
              </div>
            ))}
          </div>

          {/* Key Findings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Key Security Observations & Exposure Vectors
            </h3>
            <div className="space-y-2 text-xs">
              {selectedReport.keyFindings?.map((kf: string, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 flex items-start gap-2.5 print:bg-white print:border-slate-200 print:text-black">
                  <span className="text-cyan-400 font-bold shrink-0">•</span>
                  <span>{kf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Roadmap Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Prioritized Remediation Roadmap
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] print:bg-slate-200 print:text-black">
                  <tr>
                    <th className="px-4 py-2.5">Priority</th>
                    <th className="px-4 py-2.5">Target Asset</th>
                    <th className="px-4 py-2.5">Recommended Defense Action</th>
                    <th className="px-4 py-2.5">Estimated Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-[11px]">
                  {selectedReport.remediationRoadmap?.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-900/50 print:hover:bg-transparent">
                      <td className="px-4 py-2.5 font-bold text-amber-400 print:text-amber-800">{r.priority}</td>
                      <td className="px-4 py-2.5 font-mono text-cyan-400 print:text-blue-700">{r.targetAsset}</td>
                      <td className="px-4 py-2.5 text-slate-200 print:text-black">{r.action}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-400 print:text-emerald-700 font-bold">
                        {r.estimatedRiskImpact}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Posture Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Regulatory Framework Compliance Posture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedReport.compliancePosture?.map((cp: any, i: number) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 print:bg-slate-50 print:border-slate-200">
                  <span className="text-xs font-bold text-white print:text-black">{cp.framework}</span>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{cp.scorePercent}%</span>
                    <span className="text-slate-400 print:text-slate-600">
                      {cp.passedControls}/{cp.totalControls} Controls
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
