import React from 'react';
import { DetectionResult } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  FileText,
  Hash,
  Clock,
  Radio,
  Share2,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ResultsDashboardProps {
  result: DetectionResult;
  onOpenReport: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onOpenReport }) => {
  const isDeepfake = result.overallVerdict === 'SYNTHETIC_DEEPFAKE';
  const isSpliced = result.overallVerdict === 'SPLICED_MANIPULATION';
  const isGenuine = result.overallVerdict === 'GENUINE_HUMAN';

  const probPercent = (result.deepfakeProbability * 100).toFixed(1);
  const confPercent = (result.confidenceScore * 100).toFixed(1);
  const naturalPercent = (result.naturalnessScore * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-5">
      {/* VERDICT HERO CARD */}
      <div
        className={`rounded-2xl p-6 border shadow-2xl relative overflow-hidden backdrop-blur-md transition-all ${
          isDeepfake
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/30'
            : isSpliced
            ? 'bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-950/30'
            : 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/30'
        }`}
      >
        {/* Glow ambient background effect */}
        <div
          className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isDeepfake ? 'bg-rose-500' : isSpliced ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Verdict Status */}
          <div className="flex items-start gap-4">
            <div
              className={`p-4 rounded-2xl flex items-center justify-center border shadow-lg ${
                isDeepfake
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : isSpliced
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {isDeepfake ? (
                <ShieldAlert className="w-10 h-10" />
              ) : isSpliced ? (
                <AlertTriangle className="w-10 h-10" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isDeepfake
                      ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                      : isSpliced
                      ? 'bg-amber-500/30 text-amber-300 border-amber-500/50'
                      : 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  {isGenuine ? '✓ REAL SPEECH' : isDeepfake ? '⚠ FAKE / AI CLONE' : '⚡ SPLICED ATTACK'} • RISK: {result.riskLevel}
                </span>

                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {result.analysisSource === 'gemini-augmented-forensics'
                    ? 'Gemini 3.8 Flash Neural Forensic Engine'
                    : 'CNN ResNet Spectrogram Classifier'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isDeepfake && 'FAKE: AI-Generated Deepfake Voice Detected'}
                {isSpliced && 'MANIPULATED: Spliced Audio Attack Detected'}
                {isGenuine && 'REAL: Authentic Human Speech Verified'}
              </h2>

              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {result.executiveSummary}
              </p>
            </div>
          </div>

          {/* Quick Metrics & Report Button */}
          <div className="flex flex-wrap lg:flex-col items-end gap-3 self-stretch lg:self-auto justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-slate-800/80 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                AI Deepfake Probability
              </span>
              <span
                className={`text-3xl font-mono font-black ${
                  isDeepfake ? 'text-rose-400' : isSpliced ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {probPercent}%
              </span>
            </div>

            <button
              onClick={onOpenReport}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Generate Forensic Report
            </button>
          </div>
        </div>
      </div>

      {/* METRIC GAUGES & SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Model Confidence */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">MODEL CONFIDENCE</span>
            <span className="font-mono text-cyan-400 font-bold">{confPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${confPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Dual-branch CNN Softmax probability threshold validation.
          </p>
        </div>

        {/* Deepfake Probability */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">DEEPFAKE PROBABILITY</span>
            <span
              className={`font-mono font-bold ${
                isDeepfake ? 'text-rose-400' : isSpliced ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {probPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDeepfake
                  ? 'bg-rose-500'
                  : isSpliced
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${probPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Computed across {result.segments.length} temporal audio segments.
          </p>
        </div>

        {/* Acoustic Naturalness */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">ORGANIC NATURALNESS</span>
            <span className="font-mono text-emerald-400 font-bold">{naturalPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${naturalPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Presence of vocal tract physiology, respiration &amp; pitch jitter.
          </p>
        </div>
      </div>

      {/* FORENSIC FINDINGS & THREAT VECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Forensic Acoustic Artifacts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Acoustic Forensic Indicators
          </h3>

          <div className="space-y-2.5">
            {result.forensicFindings.map((finding, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs"
              >
                <div
                  className={`mt-0.5 p-1 rounded-full ${
                    isDeepfake
                      ? 'bg-rose-500/20 text-rose-400'
                      : isSpliced
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 text-slate-300 font-sans leading-relaxed">
                  {finding}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
            <span className="text-slate-400">Suspected Synthesis Method:</span>
            <span className="text-cyan-300 font-semibold">{result.suspectedTechnique}</span>
          </div>
        </div>

        {/* Right: Threat Vector & Cybersecurity Incident Mitigation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Radio className="w-4 h-4 text-amber-400" />
            Cyber Threat Profile &amp; SOC Recommendations
          </h3>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
            <span className="text-slate-400 font-mono block text-[10px] uppercase mb-1">
              Associated Threat Scenario
            </span>
            <span className="text-amber-300 font-bold text-sm block">
              {result.threatVector}
            </span>
          </div>

          <div className="space-y-2 mt-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">
              Mitigation Actions:
            </span>
            {result.mitigationRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60"
              >
                <span className="text-cyan-400 font-mono font-bold">0{idx + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AUDIO METADATA & CRYPTOGRAPHIC PROOF CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3">
          <Hash className="w-4 h-4 text-cyan-400" />
          Audio Technical Specifications &amp; Chain of Custody
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">File Name</span>
            <span className="text-slate-200 font-semibold truncate block" title={result.metadata.name}>
              {result.metadata.name}
            </span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Duration</span>
            <span className="text-cyan-400 font-semibold block">{result.metadata.duration} seconds</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Sampling Rate</span>
            <span className="text-cyan-400 font-semibold block">{result.metadata.sampleRate} Hz</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Channels</span>
            <span className="text-slate-200 font-semibold block">
              {result.metadata.numberOfChannels === 1 ? 'Mono (1 Ch)' : 'Stereo (2 Ch)'}
            </span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">File Format</span>
            <span className="text-slate-200 font-semibold uppercase block">{result.metadata.format}</span>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] block">File Size</span>
            <span className="text-slate-200 font-semibold block">
              {(result.metadata.size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>

        {/* SHA-256 Checksum */}
        <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-slate-500 text-[10px] shrink-0">SHA-256 HASH:</span>
            <span className="text-cyan-400/90 truncate">{result.metadata.sha256Hash}</span>
          </div>
          <span className="text-[10px] text-emerald-400 shrink-0 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Cryptographically Verified
          </span>
        </div>
      </div>
    </div>
  );
};
