import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Sparkles, Check, AlertCircle, PlayCircle, Shield, Sliders } from 'lucide-react';
import { PRELOADED_SAMPLES, PreloadedSample } from '../utils/sampleAudios';

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  onSelectSample: (sample: PreloadedSample) => void;
  isAnalyzing: boolean;
  selectedSampleId: string | null;
  currentFileName: string | null;
  onTriggerAnalysis: () => void;
  hasAudioReady: boolean;
  sensitivity: 'standard' | 'high' | 'strict';
  onChangeSensitivity: (level: 'standard' | 'high' | 'strict') => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileSelected,
  onSelectSample,
  isAnalyzing,
  selectedSampleId,
  currentFileName,
  onTriggerAnalysis,
  hasAudioReady,
  sensitivity,
  onChangeSensitivity,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('audio') || /\.(wav|mp3|flac|ogg|m4a|webm)$/i.test(file.name)) {
        onFileSelected(file);
      } else {
        alert('Please upload a valid audio file (WAV, MP3, FLAC, OGG, WebM, M4A).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Active Audio Status & Quick Test Switcher */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400">Active Audio:</span>
          <span className="text-cyan-300 font-semibold truncate max-w-sm sm:max-w-md">
            {currentFileName || 'No audio loaded'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 text-[11px]">Compare:</span>
          <button
            onClick={() => onSelectSample(PRELOADED_SAMPLES[0])}
            title="Load authentic human recording"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              selectedSampleId === PRELOADED_SAMPLES[0].id
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-300 hover:border-slate-700'
            }`}
          >
            🟢 Real Human Voice
          </button>
          <button
            onClick={() => onSelectSample(PRELOADED_SAMPLES[1])}
            title="Load ElevenLabs neural voice clone"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
              selectedSampleId === PRELOADED_SAMPLES[1].id
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-rose-300 hover:border-slate-700'
            }`}
          >
            🔴 AI Deepfake Clone
          </button>
        </div>
      </div>

      {/* Upload Zone & Preloaded Suite Tabs */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* DRAG AND DROP ZONE */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/30'
              : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-slate-950/90'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.wav,.mp3,.flac,.ogg,.m4a,.webm"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-sm font-bold text-slate-100 mb-1">
            Drop Audio Recording Here or Click to Browse
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mb-2">
            Supports <strong className="text-slate-200">WAV, MP3, FLAC, OGG, WebM, M4A</strong>. Analyzes acoustic Nyquist shelves, vocoder phase dispersion, and pitch prosody.
          </p>

          {currentFileName && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[220px]">{currentFileName}</span>
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            </div>
          )}
        </div>

        {/* PRELOADED BENCHMARK ATTACK SAMPLES */}
        <div className="lg:w-96 flex flex-col justify-between bg-slate-950/70 border border-slate-800 rounded-xl p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4" />
                Benchmark Test Audio Library
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Test Samples</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Click a sample to test deepfake, spliced manipulation, or genuine human voice:
            </p>

            <div className="space-y-1.5">
              {PRELOADED_SAMPLES.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between border cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block truncate text-[11px] text-slate-200">
                        {sample.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate">
                        {sample.expectedVerdict.replace('_', ' ')} • {sample.durationSeconds}s
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 tracking-wider font-mono ${
                        sample.category === 'AI_CLONE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : sample.category === 'SPLICED_ATTACK'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : sample.category === 'VOICE_CONVERSION'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {sample.expectedVerdict === 'GENUINE_HUMAN'
                        ? 'REAL HUMAN'
                        : sample.expectedVerdict === 'SYNTHETIC_DEEPFAKE'
                        ? 'AI FAKE'
                        : 'SPLICED'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SENSITIVITY CONTROLS & ACTION ANALYZE BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Forensic Sensitivity:</span>
          </div>

          <div className="inline-flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => onChangeSensitivity('standard')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sensitivity === 'standard'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Standard (50%)
            </button>
            <button
              onClick={() => onChangeSensitivity('high')}
              title="Recommended for subtle ElevenLabs / modern neural voice clones"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sensitivity === 'high'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Sensitivity (Recommended)
            </button>
            <button
              onClick={() => onChangeSensitivity('strict')}
              title="Zero-trust strict forensic scrutiny"
              className={`px-2.5 py-1 rounded-md transition-colors ${
                sensitivity === 'strict'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strict / Zero-Trust
            </button>
          </div>
        </div>

        <button
          onClick={onTriggerAnalysis}
          disabled={!hasAudioReady || isAnalyzing}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            isAnalyzing
              ? 'bg-amber-500 text-slate-950 animate-pulse'
              : hasAudioReady
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Running Neural Forensics...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Deepfake &amp; Splicing Forensics
            </>
          )}
        </button>
      </div>
    </div>
  );
};
