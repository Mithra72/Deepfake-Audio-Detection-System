import React from 'react';
import { ShieldCheck, Activity, BarChart2, Mic, History, FileText, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenLiveMic: () => void;
  onOpenModelEvaluation: () => void;
  onOpenHistory: () => void;
  onOpenReport: () => void;
  hasResult: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLiveMic,
  onOpenModelEvaluation,
  onOpenHistory,
  onOpenReport,
  hasResult,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-cyan-200" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                VOICECRYPT <span className="text-cyan-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">SOC v3.2</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              AI Deepfake Audio &amp; Spliced Voice Detection Engine
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Mic Button */}
          <button
            onClick={onOpenLiveMic}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Live Intercept</span>
          </button>

          {/* Model Evaluation Button */}
          <button
            onClick={onOpenModelEvaluation}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Model Evaluation</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-400 font-mono border border-slate-700">
                {historyCount}
              </span>
            )}
          </button>

          {/* Report Button */}
          {hasResult && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
