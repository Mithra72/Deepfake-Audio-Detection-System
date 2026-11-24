/**
 * Audio Sample Generator for Cybersecurity Testing & Benchmarking
 * Generates realistic audio buffers with synthetic vocoder artifacts,
 * natural vocal tract acoustics, or spliced attack profiles.
 */

export interface PreloadedSample {
  id: string;
  name: string;
  category: 'GENUINE' | 'AI_CLONE' | 'SPLICED_ATTACK' | 'VOICE_CONVERSION';
  description: string;
  expectedVerdict: 'GENUINE_HUMAN' | 'SYNTHETIC_DEEPFAKE' | 'SPLICED_MANIPULATION';
  durationSeconds: number;
  syntheticTechnique?: string;
  threatScenario?: string;
}

export const PRELOADED_SAMPLES: PreloadedSample[] = [
  {
    id: 'sample-authentic-human',
    name: 'Authentic Human Speech: Dr. Elena Vance (Q3 Security Briefing)',
    category: 'GENUINE',
    description: 'Original studio-grade microphone recording of cybersecurity director delivering incident response protocol updates with natural breath and glottal micro-prosody.',
    expectedVerdict: 'GENUINE_HUMAN',
    durationSeconds: 5.0,
    threatScenario: 'Baseline Authentic Communication (Real Human)',
  },
  {
    id: 'sample-elevenlabs-ceo',
    name: 'AI Voice Clone: Executive Wire Transfer (ElevenLabs v2)',
    category: 'AI_CLONE',
    description: 'High-fidelity synthetic clone impersonating Chief Financial Officer authorizing an emergency offshore wire payment of $1,450,000.',
    expectedVerdict: 'SYNTHETIC_DEEPFAKE',
    durationSeconds: 5.5,
    syntheticTechnique: 'ElevenLabs Multilingual v2 / HiFi-GAN Vocoder',
    threatScenario: 'Business Email Compromise (BEC) & Voice Phishing (AI Deepfake)',
  },
  {
    id: 'sample-spliced-attack',
    name: 'Spliced Manipulation Attack: Account PIN Injection',
    category: 'SPLICED_ATTACK',
    description: 'Real customer support phone call where seconds 1.8s - 3.4s were maliciously spliced and replaced with an AI-generated PIN and override phrase.',
    expectedVerdict: 'SPLICED_MANIPULATION',
    durationSeconds: 6.0,
    syntheticTechnique: 'Acoustic Splice + Neural Voice Insertion (Segment 2-3 Manipulated)',
    threatScenario: 'Interactive Voice Response (IVR) & Support Desk Social Engineering',
  },
  {
    id: 'sample-rvc-conversion',
    name: 'RVC Voice Conversion: VIP Identity Spoof',
    category: 'VOICE_CONVERSION',
    description: 'Retrieval-based Voice Conversion (RVC v2) applied over an attacker voice to match target company board member.',
    expectedVerdict: 'SYNTHETIC_DEEPFAKE',
    durationSeconds: 4.8,
    syntheticTechnique: 'RVC v2 (Pitch-Guided Resynthesis)',
    threatScenario: 'Executive Impersonation / Fake News Disinformation',
  },
  {
    id: 'sample-authentic-telephony',
    name: 'Authentic Telephony: Dispatch Operations Check-In',
    category: 'GENUINE',
    description: 'Bandlimited 8kHz/16kHz telephone channel audio exhibiting natural vocal micro-tremors and ambient acoustic room reflections.',
    expectedVerdict: 'GENUINE_HUMAN',
    durationSeconds: 4.5,
    threatScenario: 'Legitimate Field Personnel Check-in (Real Human)',
  },
];

/**
 * Synthesizes an AudioBuffer with realistic acoustic characteristics
 * based on the sample profile.
 */
export function generateSampleAudioBuffer(
  audioCtx: AudioContext,
  sampleId: string
): AudioBuffer {
  const sample = PRELOADED_SAMPLES.find(s => s.id === sampleId) || PRELOADED_SAMPLES[0];
  const sampleRate = audioCtx.sampleRate;
  const duration = sample.durationSeconds;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Formant frequencies for speech vowel resonances (e.g. F1, F2, F3)
  const formants = [
    { freq: 650, bw: 80, amp: 1.0 },   // F1
    { freq: 1100, bw: 90, amp: 0.7 },  // F2
    { freq: 2800, bw: 120, amp: 0.3 }, // F3
    { freq: 3500, bw: 150, amp: 0.15 },// F4
  ];

  if (sample.category === 'AI_CLONE') {
    // AI VOICE CLONE (ElevenLabs style):
    // Characteristics: Highly stable F0 pitch (monotone / step-like), high-frequency vocoder phase smearing,
    // mechanical lack of glottal pulse jitter, sharp high-frequency cutoff at 12kHz/22.05kHz.
    const f0Base = 145; // Hz
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech syllable envelope (gating on/off words)
      const syllable = Math.sin(2 * Math.PI * 2.8 * t) * 0.5 + 0.5;
      const env = Math.pow(syllable, 1.8) * (t < 0.2 ? t * 5 : t > duration - 0.3 ? (duration - t) * 3.3 : 1);

      // Quantized F0 without natural organic jitter (AI artifact)
      const f0Step = f0Base + Math.floor(Math.sin(2 * Math.PI * 0.8 * t) * 2) * 5;

      // Harmonic series with phase smearing
      let sampleVal = 0;
      for (let h = 1; h <= 28; h++) {
        const hFreq = f0Step * h;
        if (hFreq > 9500) break; // Vocoder cutoff artifact
        // Formant filtering approximation
        let formantGain = 0.1;
        for (const f of formants) {
          const dist = Math.abs(hFreq - f.freq);
          if (dist < f.bw * 2) formantGain += f.amp * Math.exp(-dist / f.bw);
        }
        // Vocoder phase smearing: constant phase offset
        sampleVal += Math.sin(2 * Math.PI * hFreq * t + (h * 0.85)) * (1 / Math.sqrt(h)) * formantGain;
      }

      // Add high frequency neural vocoder buzz / hiss
      const vocoderHiss = (Math.random() * 2 - 1) * 0.03 * (sampleVal !== 0 ? 1 : 0);
      data[i] = (sampleVal * 0.28 + vocoderHiss) * env;
    }
  } else if (sample.category === 'GENUINE' && sampleId === 'sample-authentic-human') {
    // AUTHENTIC HUMAN SPEECH:
    // Natural pitch micro-tremor (jitter ~0.6%), breath inhalations, warm room acoustics, wide bandwidth
    const f0Base = 185; // Female voice (Dr. Vance)
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Syllable prosody cadence with breath pauses
      const cadence = Math.sin(2 * Math.PI * 2.2 * t) * 0.5 + 0.5;
      const pause = t > 2.2 && t < 2.7 ? 0.02 : 1; // Natural breath pause
      const env = Math.pow(cadence, 1.5) * pause * (t < 0.2 ? t * 5 : t > duration - 0.2 ? (duration - t) * 5 : 1);

      // Organic physiological jitter (~0.8% micro-variance)
      const jitter = (Math.sin(2 * Math.PI * 6.5 * t) + (Math.random() - 0.5) * 0.4) * 1.8;
      const currentF0 = f0Base + Math.sin(2 * Math.PI * 1.2 * t) * 12 + jitter;

      phase += (2 * Math.PI * currentF0) / sampleRate;

      let sampleVal = 0;
      for (let h = 1; h <= 42; h++) {
        const hFreq = currentF0 * h;
        if (hFreq > 14000) break;
        let formantGain = 0.08;
        for (const f of formants) {
          const dist = Math.abs(hFreq - f.freq);
          if (dist < f.bw * 2) formantGain += f.amp * Math.exp(-dist / f.bw);
        }
        sampleVal += Math.sin(phase * h) * (1 / h) * formantGain;
      }

      // Natural aspiration / breath noise during vocalization
      const aspiration = (Math.random() * 2 - 1) * 0.012;
      // Ambient physical room acoustic reflection / noise floor
      const roomAcoustics = (Math.random() * 2 - 1) * 0.003;
      data[i] = (sampleVal * 0.32 + aspiration) * env + roomAcoustics;
    }
  } else if (sample.category === 'SPLICED_ATTACK') {
    // SPLICED MANIPULATION ATTACK:
    // 0.0s to 1.8s: Natural speech (Authentic)
    // 1.8s to 3.8s: Cloned speech inserted ("PIN 4-9-2-0 authorize") (Deepfake segment)
    // 3.8s to 6.0s: Natural speech (Authentic)
    let naturalPhase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const isSplicedSegment = t >= 1.8 && t <= 3.8;

      if (!isSplicedSegment) {
        // Natural speech segment
        const cadence = Math.sin(2 * Math.PI * 2.5 * t) * 0.5 + 0.5;
        const env = Math.pow(cadence, 1.4);
        const jitter = (Math.random() - 0.5) * 1.5;
        const f0 = 135 + Math.sin(2 * Math.PI * 1.1 * t) * 8 + jitter;
        naturalPhase += (2 * Math.PI * f0) / sampleRate;

        let val = 0;
        for (let h = 1; h <= 30; h++) {
          val += Math.sin(naturalPhase * h) * (1 / h) * 0.2;
        }
        data[i] = val * env * 0.3;
      } else {
        // Spliced neural insertion: Flat F0, distinct phase discontinuity at boundary, vocoder hiss
        const spliceT = t - 1.8;
        const cadence = Math.sin(2 * Math.PI * 3.5 * spliceT) * 0.5 + 0.5;
        const env = Math.pow(cadence, 2.0);
        const f0Flat = 160; // robotic fixed pitch jump!

        let val = 0;
        for (let h = 1; h <= 20; h++) {
          // Sharp harmonic cutoff
          val += Math.sin(2 * Math.PI * f0Flat * h * spliceT + h * 1.2) * (1 / Math.sqrt(h)) * 0.18;
        }
        const vocoderArtifact = (Math.random() * 2 - 1) * 0.04;
        data[i] = (val + vocoderArtifact) * env * 0.32;
      }
    }
  } else if (sample.category === 'VOICE_CONVERSION') {
    // RVC VOICE CONVERSION:
    // Spectral mismatch between formant filter and pitch envelope, high-frequency phase cancellation
    const f0Base = 120;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cadence = Math.sin(2 * Math.PI * 2.6 * t) * 0.5 + 0.5;
      const env = Math.pow(cadence, 1.6);
      const f0 = f0Base + Math.sin(2 * Math.PI * 2.0 * t) * 10;

      let val = 0;
      for (let h = 1; h <= 25; h++) {
        // High harmonic phase cancellation (RVC artifact)
        const phaseShift = Math.sin(h * 3.14 + t * 50) * 0.8;
        val += Math.sin(2 * Math.PI * f0 * h * t + phaseShift) * (1 / Math.sqrt(h)) * 0.22;
      }
      data[i] = val * env * 0.3;
    }
  } else {
    // AUTHENTIC TELEPHONY (8kHz bandlimited)
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const cadence = Math.sin(2 * Math.PI * 2.3 * t) * 0.5 + 0.5;
      const env = Math.pow(cadence, 1.4);
      const f0 = 150 + Math.sin(2 * Math.PI * 1.5 * t) * 14 + (Math.random() - 0.5) * 1.4;
      phase += (2 * Math.PI * f0) / sampleRate;

      let val = 0;
      for (let h = 1; h <= 18; h++) {
        const hFreq = f0 * h;
        // Bandlimited to 3400 Hz (telephony PSTN bandwidth)
        if (hFreq < 300 || hFreq > 3400) continue;
        val += Math.sin(phase * h) * (1 / h) * 0.35;
      }
      data[i] = val * env * 0.28;
    }
  }

  return buffer;
}

/**
 * Converts an AudioBuffer to a standard WAV Blob for download or playback
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const dataLength = buffer.length * numChannels * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM audio data
  let offset = 44;
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
