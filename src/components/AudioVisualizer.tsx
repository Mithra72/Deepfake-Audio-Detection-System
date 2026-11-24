import React, { useEffect, useRef, useState, useMemo } from 'react';
import { AcousticFeatures, SegmentAnalysis } from '../types';
import { Activity, Flame, Layers, Eye, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AudioVisualizerProps {
  audioBuffer: AudioBuffer | null;
  features: AcousticFeatures | null;
  segments: SegmentAnalysis[] | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectedSegmentIndex: number | null;
  onSelectSegment: (index: number) => void;
}

type PaletteType = 'turbo' | 'inferno' | 'viridis' | 'cyber';

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioBuffer,
  features,
  segments,
  currentTime,
  duration,
  onSeek,
  selectedSegmentIndex,
  onSelectSegment,
}) => {
  const [activeTab, setActiveTab] = useState<'waveform' | 'spectrogram' | 'mfcc'>('waveform');
  const [palette, setPalette] = useState<PaletteType>('turbo');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mfccCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Color mapping helper
  const getColor = (val: number, type: PaletteType): [number, number, number] => {
    const clamped = Math.max(0, Math.min(1, val));
    if (type === 'turbo') {
      // Turbo color scale approximation
      const r = Math.sin(clamped * Math.PI - 0.2) * 255;
      const g = Math.sin(clamped * Math.PI * 0.9) * 255;
      const b = Math.cos(clamped * Math.PI * 0.8) * 255;
      return [
        Math.max(10, Math.min(255, Math.floor(clamped > 0.5 ? 255 * clamped : 40 + r))),
        Math.max(10, Math.min(255, Math.floor(g * 1.2))),
        Math.max(20, Math.min(255, Math.floor(clamped < 0.4 ? 240 * (1 - clamped) : b * 0.7))),
      ];
    } else if (type === 'inferno') {
      // Dark purple -> Red -> Yellow -> White
      const r = Math.floor(Math.min(255, clamped * 300));
      const g = Math.floor(Math.max(0, (clamped - 0.3) * 350));
      const b = Math.floor(Math.max(0, (clamped - 0.7) * 800));
      return [r, g, b];
    } else if (type === 'viridis') {
      // Deep purple -> Blue -> Teal -> Green -> Yellow
      const r = Math.floor(clamped * 220);
      const g = Math.floor(clamped < 0.5 ? clamped * 300 : 150 + (clamped - 0.5) * 210);
      const b = Math.floor((1 - clamped) * 220);
      return [r, g, b];
    } else {
      // Cyber neon (Electric cyan to magenta)
      const r = Math.floor(clamped * 255);
      const g = Math.floor((1 - Math.abs(clamped - 0.5) * 2) * 255);
      const b = Math.floor((1 - clamped) * 255);
      return [r, g, b];
    }
  };

  // --- DRAW WAVEFORM ---
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Draw segment background overlays (Suspicious and Deepfake zones)
    if (segments && duration > 0) {
      segments.forEach((seg) => {
        const segStartX = (seg.startTime / duration) * width;
        const segEndX = (seg.endTime / duration) * width;
        const segWidth = segEndX - segStartX;

        if (seg.verdict === 'DEEPFAKE') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.22)'; // Glowing Red
          ctx.fillRect(segStartX, 0, segWidth, height);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(segStartX, 0, segWidth, height);
        } else if (seg.verdict === 'SUSPICIOUS') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.18)'; // Amber
          ctx.fillRect(segStartX, 0, segWidth, height);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(segStartX, 0, segWidth, height);
        } else {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.05)'; // Subtle Green
          ctx.fillRect(segStartX, 0, segWidth, height);
        }

        // Draw selection ring if this segment is selected
        if (selectedSegmentIndex === seg.index) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(segStartX + 1, 1, segWidth - 2, height - 2);
        }
      });
    }

    // Extract peaks
    const pcm = audioBuffer.getChannelData(0);
    const step = Math.ceil(pcm.length / width);
    const amp = centerY * 0.85;

    // Draw waveform bars
    for (let x = 0; x < width; x++) {
      let min = 1.0;
      let max = -1.0;
      const start = x * step;
      const end = Math.min(pcm.length, start + step);

      for (let i = start; i < end; i++) {
        const v = pcm[i];
        if (v < min) min = v;
        if (v > max) max = v;
      }

      if (max < min) {
        min = 0;
        max = 0;
      }

      const timeAtX = (x / width) * duration;
      const matchingSeg = segments?.find((s) => timeAtX >= s.startTime && timeAtX <= s.endTime);

      if (matchingSeg?.verdict === 'DEEPFAKE') {
        ctx.fillStyle = '#ef4444'; // Red
      } else if (matchingSeg?.verdict === 'SUSPICIOUS') {
        ctx.fillStyle = '#f59e0b'; // Amber
      } else {
        ctx.fillStyle = '#06b6d4'; // Cyan
      }

      const yTop = centerY - max * amp;
      const yBottom = centerY - min * amp;
      const barHeight = Math.max(1.5, yBottom - yTop);

      ctx.fillRect(x, yTop, 1, barHeight);
    }

    // Draw Playhead
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Small cursor handle at top
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(playheadX, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [audioBuffer, segments, currentTime, duration, selectedSegmentIndex]);

  // --- DRAW MEL SPECTROGRAM ---
  useEffect(() => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas || !features || !features.melSpectrogramMatrix.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const matrix = features.melSpectrogramMatrix;
    const numFrames = matrix.length;
    const numBands = features.melBands;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Find min and max for normalization
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let f = 0; f < numFrames; f++) {
      for (let b = 0; b < numBands; b++) {
        const v = matrix[f][b];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
    const range = maxVal - minVal || 1;

    for (let x = 0; x < width; x++) {
      const frameIdx = Math.min(numFrames - 1, Math.floor((x / width) * numFrames));
      const frame = matrix[frameIdx];

      for (let y = 0; y < height; y++) {
        // Mel bands are arranged low frequency at bottom, high at top
        const bandIdx = Math.min(numBands - 1, Math.floor(((height - 1 - y) / height) * numBands));
        const normalized = (frame[bandIdx] - minVal) / range;
        const [r, g, b] = getColor(normalized, palette);

        const pixelIdx = (y * width + x) * 4;
        data[pixelIdx] = r;
        data[pixelIdx + 1] = g;
        data[pixelIdx + 2] = b;
        data[pixelIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Playhead overlay on spectrogram
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [features, palette, currentTime, duration]);

  // --- DRAW MFCC HEATMAP ---
  useEffect(() => {
    const canvas = mfccCanvasRef.current;
    if (!canvas || !features || !features.mfccMatrix.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const matrix = features.mfccMatrix;
    const numFrames = matrix.length;
    const numCoeffs = 13;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let f = 0; f < numFrames; f++) {
      for (let c = 1; c < numCoeffs; c++) {
        // ignore 0th energy coeff for better contrast of spectral shape
        const v = matrix[f][c];
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
    const range = maxVal - minVal || 1;

    for (let x = 0; x < width; x++) {
      const frameIdx = Math.min(numFrames - 1, Math.floor((x / width) * numFrames));
      const frame = matrix[frameIdx];

      for (let y = 0; y < height; y++) {
        const coeffIdx = Math.min(numCoeffs - 1, Math.floor(((height - 1 - y) / height) * numCoeffs));
        const val = frame[coeffIdx];
        const normalized = (val - minVal) / range;
        const [r, g, b] = getColor(normalized, 'cyber');

        const pixelIdx = (y * width + x) * 4;
        data[pixelIdx] = r;
        data[pixelIdx + 1] = g;
        data[pixelIdx + 2] = b;
        data[pixelIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }
  }, [features, currentTime, duration]);

  // Handle canvas click to seek and select segment
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = clickRatio * duration;
    onSeek(targetTime);

    if (segments) {
      const clickedSeg = segments.find((s) => targetTime >= s.startTime && targetTime <= s.endTime);
      if (clickedSeg) {
        onSelectSegment(clickedSeg.index);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    setHoveredTime(ratio * duration);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Visualizer Header with View Selector & Palettes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('waveform')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'waveform'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Waveform &amp; Splicing Anomaly Overlay
          </button>

          <button
            onClick={() => setActiveTab('spectrogram')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'spectrogram'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            2D Mel Spectrogram (40 Bands)
          </button>

          <button
            onClick={() => setActiveTab('mfcc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'mfcc'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            MFCC Cepstrum Coefficients
          </button>
        </div>

        {/* Color Palette Switcher (for Spectrogram) */}
        {activeTab === 'spectrogram' && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 px-2 font-mono">Palette:</span>
            {(['turbo', 'inferno', 'viridis', 'cyber'] as PaletteType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPalette(p)}
                className={`px-2 py-0.5 rounded capitalize text-[11px] font-mono transition-colors ${
                  palette === p ? 'bg-slate-800 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Canvas View Area */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 group">
        {/* WAVEFORM VIEW */}
        <div className={activeTab === 'waveform' ? 'block' : 'hidden'}>
          <canvas
            ref={waveformCanvasRef}
            width={1000}
            height={200}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredTime(null)}
            className="w-full h-48 sm:h-52 cursor-crosshair block"
          />
          {/* Overlay Legend */}
          <div className="absolute top-2.5 right-3 flex items-center gap-3 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              <span>Organic Speech</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Suspicious</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>AI Deepfake</span>
            </div>
          </div>
        </div>

        {/* SPECTROGRAM VIEW */}
        <div className={activeTab === 'spectrogram' ? 'block' : 'hidden'}>
          <div className="relative flex">
            {/* Frequency Axis Labels */}
            <div className="w-12 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between py-2 text-[9px] font-mono text-slate-400 text-right pr-1.5 select-none">
              <span>8 kHz</span>
              <span>4 kHz</span>
              <span>2 kHz</span>
              <span>1 kHz</span>
              <span>300 Hz</span>
              <span>0 Hz</span>
            </div>
            <div className="flex-1 relative">
              <canvas
                ref={spectrogramCanvasRef}
                width={1000}
                height={200}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoveredTime(null)}
                className="w-full h-48 sm:h-52 cursor-crosshair block"
              />
            </div>
          </div>
        </div>

        {/* MFCC VIEW */}
        <div className={activeTab === 'mfcc' ? 'block' : 'hidden'}>
          <div className="relative flex">
            <div className="w-12 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between py-2 text-[9px] font-mono text-slate-400 text-right pr-1.5 select-none">
              <span>c12</span>
              <span>c09</span>
              <span>c06</span>
              <span>c03</span>
              <span>c01</span>
            </div>
            <div className="flex-1 relative">
              <canvas
                ref={mfccCanvasRef}
                width={1000}
                height={200}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={() => setHoveredTime(null)}
                className="w-full h-48 sm:h-52 cursor-crosshair block"
              />
            </div>
          </div>
        </div>

        {/* Hover Time Tooltip */}
        {hoveredTime !== null && (
          <div className="absolute bottom-2 left-3 bg-slate-900/90 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono pointer-events-none shadow-md">
            Timestamp: {hoveredTime.toFixed(2)}s (Click to inspect)
          </div>
        )}
      </div>

      {/* Acoustic Spectral Parameters Quick Readout */}
      {features && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Spectral Centroid</span>
            <span className="text-cyan-400 font-semibold text-sm">{features.spectralCentroid} Hz</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Spectral Rolloff (85%)</span>
            <span className="text-cyan-400 font-semibold text-sm">{features.spectralRolloff} Hz</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Zero Crossing Rate</span>
            <span className="text-cyan-400 font-semibold text-sm">{features.zcr}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Phase Discontinuity</span>
            <span className={`font-semibold text-sm ${features.phaseDiscontinuity > 1.4 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {features.phaseDiscontinuity}
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Pitch Jitter (F0)</span>
            <span className={`font-semibold text-sm ${features.pitchJitter < 0.003 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {(features.pitchJitter * 100).toFixed(2)}%
            </span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block">Estimated SNR</span>
            <span className="text-cyan-400 font-semibold text-sm">{features.estimatedSnrDb} dB</span>
          </div>
        </div>
      )}
    </div>
  );
};
