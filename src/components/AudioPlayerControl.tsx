import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Repeat } from 'lucide-react';

interface AudioPlayerControlProps {
  audioBlob: Blob | null;
  audioUrl: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({
  audioBlob,
  audioUrl,
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
  onRestart,
}) => {
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = (secs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${parseFloat(remainingSecs) < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleRateChange = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Play/Pause & Transport Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            title="Restart from beginning"
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={!audioUrl}
            className={`p-3 rounded-xl flex items-center justify-center font-medium transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            title={isLooping ? 'Disable Loop' : 'Enable Loop'}
            className={`p-2 rounded-lg transition-colors ${
              isLooping ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={handleRateChange}
            title="Change Playback Speed"
            className="px-2.5 py-1 text-xs font-mono text-cyan-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Progress Timeline Scrubber */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 w-14 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              disabled={!audioUrl}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-lg pointer-events-none"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <span className="text-xs font-mono text-slate-400 w-14">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume & Audio Format Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium rounded uppercase bg-slate-800 text-slate-300 border border-slate-700">
            PCM 16-bit
          </span>
        </div>
      </div>
    </div>
  );
};
