import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { api } from '../services/api';
import { AlertCircle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineToast, setPipelineToast] = useState<{
    type: 'success' | 'approval_required' | 'error';
    message: string;
    taskId?: string;
  } | null>(null);

  const handleTriggerPipeline = async () => {
    try {
      setIsPipelineRunning(true);
      const res = await api.ai.runPipeline({ autoTargetCritical: true });
      if (res.pipelineStatus === 'awaiting_human_approval') {
        setPipelineToast({
          type: 'approval_required',
          message: 'Agent Pipeline proposed sensitive containment action: Awaiting your authorization in AI Insights.',
          taskId: res.pendingApprovalTask?.id,
        });
      } else {
        setPipelineToast({
          type: 'success',
          message: 'Autonomous Defense Pipeline completed analytical sweep successfully.',
        });
      }
    } catch (e: any) {
      setPipelineToast({
        type: 'error',
        message: `Pipeline run failed: ${e.message}`,
      });
    } finally {
      setIsPipelineRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onTriggerPipeline={handleTriggerPipeline}
          isPipelineRunning={isPipelineRunning}
        />

        {/* Global Toast Notification */}
        {pipelineToast && (
          <div className="mx-8 mt-4 p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-center justify-between z-40 animate-in fade-in slide-in-from-top-3 duration-200 bg-slate-900/95 border-cyan-500/40">
            <div className="flex items-center gap-3">
              {pipelineToast.type === 'approval_required' ? (
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              ) : pipelineToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-white tracking-wide">{pipelineToast.message}</p>
                {pipelineToast.taskId && (
                  <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                    Task ID: {pipelineToast.taskId}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pipelineToast.type === 'approval_required' && (
                <button
                  onClick={() => {
                    navigate('/ai-insights');
                    setPipelineToast(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-colors"
                >
                  Review Action Gate
                </button>
              )}
              <button
                onClick={() => setPipelineToast(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page View Outlet */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
