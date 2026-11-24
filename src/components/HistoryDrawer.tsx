import React, { useState } from 'react';
import { X, History, Trash2, Search, ArrowRight, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DetectionHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DetectionHistoryItem[];
  onSelectHistoryItem: (item: DetectionHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DEEPFAKE' | 'SPLICED' | 'GENUINE'>('ALL');

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const matchesSearch = item.fileName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'DEEPFAKE') return item.overallVerdict === 'SYNTHETIC_DEEPFAKE';
    if (filter === 'SPLICED') return item.overallVerdict === 'SPLICED_MANIPULATION';
    if (filter === 'GENUINE') return item.overallVerdict === 'GENUINE_HUMAN';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">Detection Audit History</h2>
              <span className="text-xs text-slate-400">{history.length} cases logged</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                title="Clear all history"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-2 my-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            {(['ALL', 'DEEPFAKE', 'SPLICED', 'GENUINE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No analysis records match criteria.
            </div>
          ) : (
            filtered.map((item) => {
              const isDeepfake = item.overallVerdict === 'SYNTHETIC_DEEPFAKE';
              const isSpliced = item.overallVerdict === 'SPLICED_MANIPULATION';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-3.5 flex flex-col gap-2 cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                      {item.fileName}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDeepfake
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isSpliced
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isDeepfake ? 'FAKE (AI CLONE)' : isSpliced ? 'SPLICED ATTACK' : 'REAL (GENUINE)'}
                    </span>

                    <span className="text-slate-400">
                      AI Prob: <strong className="text-slate-200">{(item.deepfakeProbability * 100).toFixed(1)}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2">
                    <span>{item.duration.toFixed(1)}s audio</span>
                    <span>{new Date(item.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
