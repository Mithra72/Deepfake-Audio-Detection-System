# Deepfake Audio Detection System

A cybersecurity audio forensics platform for detecting AI-generated voices, neural voice cloning, and spliced audio manipulation. It combines browser-based Digital Signal Processing (DSP) with server-side forensic reasoning to inspect audio recordings and live microphone input.

---

## Key Features

- **Multi-Format Audio Upload**: Supports `WAV`, `MP3`, `FLAC`, `OGG`, `WebM`, and `M4A` files with drag-and-drop upload and SHA-256 file integrity hashing.
- **Built-in Benchmark Sample Library**: Includes synthetic and organic test profiles (`Authentic Human Speech`, `ElevenLabs v2 AI Clone`, `Spliced Account PIN Injection`, `RVC Voice Conversion`, and `Authentic Telephony`) for instant side-by-side comparison.
- **Browser-Based DSP Feature Extraction**:
  - In-place Radix-2 Cooley-Tukey **Fast Fourier Transform (FFT)**
  - **40-band Mel Spectrogram** & **13-coefficient MFCC** computation
  - Autocorrelation **F0 pitch tracking** & micro-jitter prosody analysis
  - **Vocoder Cutoff / Nyquist Shelf** and digital silence void detection
- **Segment-Level Timeline**: Splits audio into short time segments to pinpoint localized voice splicing or neural insertions, with click-to-play segment inspection.
- **Interactive Audio Visualizations**: Real-time HTML5 Canvas waveform oscilloscope and Mel Spectrogram heatmap synced with an interactive audio player (play/pause, seek, loop, playback speed).
- **Live Microphone Interception**: Real-time microphone waveform, dBFS level meter, and instant capture-to-forensic-analysis workflow.
- **AI Threat Intelligence**: Express backend integrates `@google/genai` (`gemini-3.8-flash`) with a local DSP heuristic fallback to classify verdicts (`GENUINE_HUMAN`, `SYNTHETIC_DEEPFAKE`, `SPLICED_MANIPULATION`), assess threat vectors, and recommend mitigations.
- **Model Evaluation & Reporting**: Displays ASVspoof 2021 benchmark metrics (Accuracy, Precision, Recall, F1-Score, EER, ROC curve, Confusion Matrix), preserves analysis history in `localStorage`, and exports downloadable PDF/printable HTML/JSON forensic reports.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Node.js, Express 4, `tsx`, `@google/genai`
- **Browser APIs**: Web Audio API, HTML5 Canvas 2D, Web Cryptography API (`crypto.subtle`)

---

## Project Structure

├── server.ts                        # Express server, Vite middleware, & forensic API routes
├── index.html                       # HTML entry point
├── package.json                     # Scripts & dependencies
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite & Tailwind CSS v4 config
├── .env.example                     # Environment variable template
└── src/
    ├── main.tsx                     # React DOM entry point
    ├── App.tsx                      # Application state, audio engine, & analysis pipeline
    ├── types.ts                     # Shared TypeScript interfaces
    ├── index.css                    # Tailwind CSS entry
    ├── utils/
    │   ├── audioDsp.ts              # FFT, Mel Filterbank, MFCC, pitch & deepfake scoring
    │   └── sampleAudios.ts          # Web Audio API sample generators & WAV encoder
    └── components/
        ├── Navbar.tsx               # Top navigation & modal triggers
        ├── UploadSection.tsx        # File dropzone, quick comparison, & sensitivity selector
        ├── AudioPlayerControl.tsx   # Playback controls & scrubber
        ├── AudioVisualizer.tsx      # Waveform & Mel Spectrogram canvas renderer
        ├── SegmentTimeline.tsx      # Segment-by-segment manipulation timeline
        ├── ResultsDashboard.tsx     # Verdict banner, confidence metrics, & forensic findings
        ├── LiveMicModal.tsx         # Live microphone capture & real-time monitor
        ├── ModelEvaluationModal.tsx # Model performance metrics & confusion matrix
        ├── ReportModal.tsx          # Downloadable/printable audit report generator
        └── HistoryDrawer.tsx        # Local case history drawer

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** (or compatible package manager)

### 1. Install Dependencies

npm install

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Gemini API key (optional—if omitted, the server automatically falls back to the local DSP forensic heuristic engine):

GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"

### 3. Run in Development

Starts the Express server with Vite middleware on port `3000`:

npm run dev

Open `http://localhost:3000` in your browser.

### 4. Build & Run for Production

npm run build
npm start

### 5. Type-Check / Lint

npm run lint

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server status and Gemini configuration state |
| `GET` | `/api/model-benchmark` | Returns ASVspoof 2021 evaluation metrics, confusion matrix, and ROC curve data |
| `POST` | `/api/analyze-forensics` | Evaluates extracted DSP features and returns structured forensic verdict, findings, and mitigations |

# Project Contributors

Mithra B
Preethi Sri S

# Project Domain

Artificial Intelligence | Machine Learning | Deep Learning | Audio Processing | Cybersecurity

# Future Enhancements

- Improved detection accuracy
- Support for more audio formats
- Integration with real-time VoIP platforms
- Advanced audio forensic analysis
- Enhanced security and investigation features
