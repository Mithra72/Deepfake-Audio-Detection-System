export interface AudioMetadata {
  name: string;
  size: number;
  format: string;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  bitDepth: number;
  sha256Hash: string;
}

export interface SegmentAnalysis {
  index: number;
  startTime: number;
  endTime: number;
  deepfakeProbability: number; // 0 to 1
  confidence: number;          // 0 to 1
  verdict: 'GENUINE' | 'SUSPICIOUS' | 'DEEPFAKE';
  spectralCentroid: number;
  zcr: number;
  energy: number;
  pitchStability: number;
  phaseDiscontinuity: number;
  anomalyReasons: string[];
}

export interface AcousticFeatures {
  mfccMatrix: number[][]; // [frames][coefficients e.g. 13]
  melSpectrogramMatrix: number[][]; // [frames][melBands e.g. 40]
  timeFrames: number;
  melBands: number;
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlatness: number;
  zcr: number;
  rmsEnergy: number;
  dynamicRangeDb: number;
  estimatedSnrDb: number;
  pitchJitter: number;
  shimmer: number;
  phaseDiscontinuity: number;
}

export interface VocoderFootprint {
  name: string;
  likelihood: number; // 0 to 100%
  description: string;
}

export interface DetectionResult {
  id: string;
  overallVerdict: 'GENUINE_HUMAN' | 'SYNTHETIC_DEEPFAKE' | 'SPLICED_MANIPULATION';
  deepfakeProbability: number; // 0 to 1
  confidenceScore: number;     // 0 to 1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  naturalnessScore: number;    // 0 to 1
  executiveSummary: string;
  forensicFindings: string[];
  suspectedTechnique: string;
  threatVector: string;
  mitigationRecommendations: string[];
  segments: SegmentAnalysis[];
  acousticFeatures: AcousticFeatures;
  metadata: AudioMetadata;
  vocoderFootprints: VocoderFootprint[];
  analyzedAt: string;
  analysisSource: 'gemini-augmented-forensics' | 'dsp-classifier-engine';
}

export interface DetectionHistoryItem {
  id: string;
  fileName: string;
  duration: number;
  analyzedAt: string;
  overallVerdict: 'GENUINE_HUMAN' | 'SYNTHETIC_DEEPFAKE' | 'SPLICED_MANIPULATION';
  deepfakeProbability: number;
  confidenceScore: number;
  suspiciousSegmentsCount: number;
  totalSegmentsCount: number;
  result: DetectionResult;
}

export interface BenchmarkMetrics {
  datasetName: string;
  architecture: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    eer: number;
    aucRoc: number;
  };
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  vocoderBreakdown: {
    name: string;
    detectionRate: number;
    sampleCount: number;
  }[];
  rocCurve: {
    fpr: number;
    tpr: number;
  }[];
}
