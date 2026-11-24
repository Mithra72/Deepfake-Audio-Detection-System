import React from 'react';
import { SegmentAnalysis } from '../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Play, Volume2, ShieldAlert, Zap } from 'lucide-react';

interface SegmentTimelineProps {
  segments: SegmentAnalysis[] | null;
  duration: number;
  currentTime: number;
  selectedSegmentIndex: number | null;
  onSelectSegment: (index: number) => void;
  onPlaySegment: (startTime: number) => void;
}

export const SegmentTimeline: React.FC<SegmentTimelineProps> = ({
  segments,
  duration,
  currentTime,
  selectedSegmentIndex,
  onSelectSegment,
  onPlaySegment,
}) => {
  if (!segments || segments.length === 0) {
    return null;
  }

  const suspiciousCount = segments.filter((s) => s.verdict !== 'GENUINE').length;
  const deepfakeCount = segments.filter((s) => s.verdict === 'DEEPFAKE').length;
  const selectedSegment = selectedSegmentIndex !== null ? segments[selectedSegmentIndex] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header with Anomaly Summary Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Segment-Level Forensic Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal subdivision ({segments.length} segments) mapping localized acoustic anomalies and synthetic insertions.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {deepfakeCount > 0 ? (
            <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              {deepfakeCount} Manipulated {deepfakeCount === 1 ? 'Segment' : 'Segments'}
            </span>
          ) : suspiciousCount > 0 ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {suspiciousCount} Suspicious {suspiciousCount === 1 ? 'Segment' : 'Segments'}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Segments Genuine
            </span>
          )}
        </div>
      </div>

      {/* Visual Segment Timeline Strip */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>0.00s</span>
          <span>Timeline Position (Click segment to jump)</span>
          <span>{duration.toFixed(2)}s</span>
        </div>

        {/* Continuous Segment Bar */}
        <div className="relative h-10 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex">
          {segments.map((seg) => {
            const isSelected = selectedSegmentIndex === seg.index;
            const isCurrentlyPlaying = currentTime >= seg.startTime && currentTime <= seg.endTime;
            const widthPercent = ((seg.endTime - seg.startTime) / (duration || 1)) * 100;

            let bgColor = 'bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 border-r border-emerald-500/20';
            if (seg.verdict === 'DEEPFAKE') {
              bgColor = 'bg-rose-600/60 hover:bg-rose-600/80 text-rose-100 border-r border-rose-500/40';
            } else if (seg.verdict === 'SUSPICIOUS') {
              bgColor = 'bg-amber-500/40 hover:bg-amber-500/60 text-amber-100 border-r border-amber-500/30';
            }

            return (
              <button
                key={seg.index}
                onClick={() => {
                  onSelectSegment(seg.index);
                  onPlaySegment(seg.startTime);
                }}
                title={`Segment #${seg.index + 1}: ${seg.startTime}s - ${seg.endTime}s | Deepfake Prob: ${(seg.deepfakeProbability * 100).toFixed(1)}%`}
                style={{ width: `${widthPercent}%` }}
                className={`relative h-full transition-all flex flex-col items-center justify-center text-[10px] font-mono cursor-pointer ${bgColor} ${
                  isSelected ? 'ring-2 ring-cyan-400 ring-inset z-10 brightness-125' : ''
                }`}
              >
                {/* Playing indicator bar */}
                {isCurrentlyPlaying && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white animate-pulse shadow-sm" />
                )}
                <span className="font-semibold truncate px-1">
                  {(seg.deepfakeProbability * 100).toFixed(0)}%
                </span>
                <span className="text-[8px] opacity-75 truncate">
                  #{seg.index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Card for the Selected Segment */}
      {selectedSegment && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Segment #{selectedSegment.index + 1}
              </span>
              <span className="text-xs font-mono text-cyan-400">
                {selectedSegment.startTime.toFixed(2)}s — {selectedSegment.endTime.toFixed(2)}s
              </span>

              {selectedSegment.verdict === 'DEEPFAKE' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/50">
                  AI Deepfake ({(selectedSegment.deepfakeProbability * 100).toFixed(1)}%)
                </span>
              )}
              {selectedSegment.verdict === 'SUSPICIOUS' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                  Suspicious ({(selectedSegment.deepfakeProbability * 100).toFixed(1)}%)
                </span>
              )}
              {selectedSegment.verdict === 'GENUINE' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                  Organic Human ({(selectedSegment.deepfakeProbability * 100).toFixed(1)}% AI Prob)
                </span>
              )}
            </div>

            {/* Anomaly list */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedSegment.anomalyReasons.map((reason, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                    selectedSegment.verdict === 'DEEPFAKE'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                      : selectedSegment.verdict === 'SUSPICIOUS'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  • {reason}
                </span>
              ))}
            </div>
          </div>

          {/* Jump & Play button */}
          <button
            onClick={() => onPlaySegment(selectedSegment.startTime)}
            className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all self-stretch md:self-auto justify-center"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Play This Segment
          </button>
        </div>
      )}
    </div>
  );
};
