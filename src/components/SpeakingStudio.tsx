import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Square,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Radio,
  FileText,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Activity,
  Zap,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import SpeakingPartScoreModal, { SpeakingResultData } from './SpeakingPartScoreModal';

interface SpeakingStudioProps {
  initialParts?: any[];
  onSaveSession: (session: any) => void;
}

export default function SpeakingStudio({
  initialParts,
  onSaveSession,
}: SpeakingStudioProps) {
  const [activePart, setActivePart] = useState<1 | 2 | 3>(2);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isLiveWsActive, setIsLiveWsActive] = useState<boolean>(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState<number>(60);
  const [isPrepTimerRunning, setIsPrepTimerRunning] = useState<boolean>(false);
  const [speakingSeconds, setSpeakingSeconds] = useState<number>(0);

  // Real-time speech transcription state
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [speakingResult, setSpeakingResult] = useState<SpeakingResultData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState<boolean>(false);

  // TTS audio playback
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);

  // Active voice activity indicator
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // Audio recording & Web Speech API refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prepTimerRef = useRef<any>(null);
  const speakTimerRef = useRef<any>(null);
  const liveWsRef = useRef<WebSocket | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  // Audio Visualizer refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Determine current part content from initialParts if passed from mockHub
  const part1Custom = initialParts?.find((p) => p.partNumber === 1);
  const part2Custom = initialParts?.find((p) => p.partNumber === 2);
  const part3Custom = initialParts?.find((p) => p.partNumber === 3);

  // Cue card content
  const cueCardTopic =
    part2Custom?.topic ||
    'Describe an environmental project or initiative that you learned about or participated in.';
  const cueCardPoints = part2Custom?.points || [
    'What the project was and where it took place',
    'How you first heard about or got involved with it',
    'What specific activities were carried out by the team',
    'And explain why you think this initiative was successful or important for the community',
  ];

  // Part 1 Questions
  const part1Questions = part1Custom?.questions || [
    'Do you prefer spending your leisure time indoors or outdoors?',
    'How has your neighborhood changed over the past five years?',
    'What kind of activities do people in your country enjoy on weekends?',
  ];

  // Part 3 Questions
  const part3Questions = part3Custom?.questions || [
    'To what extent do you believe individual actions can solve environmental issues compared to government policy?',
    'How should educational institutions motivate younger generations towards sustainable habits?',
    'Should multinational corporations bear full liability for ecological reclamation?',
  ];

  const currentTopic =
    activePart === 1
      ? 'Part 1: Introduction, Hometown & Daily Routine'
      : activePart === 2
      ? cueCardTopic
      : 'Part 3: Environmental Policy, Social Habits & Collective Responsibility';

  // Real-time metrics
  const combinedTranscriptText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
  const currentWordCount = combinedTranscriptText
    ? combinedTranscriptText.split(/\s+/).filter(Boolean).length
    : 0;
  const currentWpm = speakingSeconds > 2 ? Math.round((currentWordCount / speakingSeconds) * 60) : 0;

  // 1-Minute Prep Countdown Timer (Part 2)
  useEffect(() => {
    if (isPrepTimerRunning && prepSecondsLeft > 0) {
      prepTimerRef.current = setTimeout(() => {
        setPrepSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0 && isPrepTimerRunning) {
      setIsPrepTimerRunning(false);
      // Auto-start recording after prep timer finishes if user is ready
    }
    return () => clearTimeout(prepTimerRef.current);
  }, [isPrepTimerRunning, prepSecondsLeft]);

  // Speaking duration timer
  useEffect(() => {
    if (isRecording) {
      speakTimerRef.current = setInterval(() => {
        setSpeakingSeconds((prev) => {
          const next = prev + 1;
          // In official IELTS Part 2, standard long turn is 2 minutes (120s)
          if (activePart === 2 && next >= 120) {
            // Auto stop when 2-minute mark is reached
            setTimeout(() => {
              stopRecordingAndScore();
            }, 500);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(speakTimerRef.current);
    }
    return () => clearInterval(speakTimerRef.current);
  }, [isRecording, activePart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      if (liveWsRef.current) {
        liveWsRef.current.close();
      }
    };
  }, []);

  const startPrepTimer = () => {
    setPrepSecondsLeft(60);
    setIsPrepTimerRunning(true);
  };

  const resetPrepTimer = () => {
    setIsPrepTimerRunning(false);
    setPrepSecondsLeft(60);
  };

  // Draw Audio Frequency Waveform onto Canvas
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Calculate overall energy to detect active speech
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avgEnergy = sum / bufferLength;
    setIsVoiceActive(avgEnergy > 15);

    // Draw balanced frequency bars
    const barCount = 36;
    const barWidth = (width / barCount) - 3;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step] || 0;
      const percent = value / 255;
      const minHeight = 4;
      const barHeight = Math.max(minHeight, percent * height * 0.9);
      const x = i * (barWidth + 3);
      const y = (height - barHeight) / 2;

      // Dynamic color gradient: Rose-500 through Violet-500 to Sky-400
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (avgEnergy > 15) {
        gradient.addColorStop(0, '#f43f5e'); // rose-500
        gradient.addColorStop(0.5, '#a855f7'); // purple-500
        gradient.addColorStop(1, '#38bdf8'); // sky-400
      } else {
        // Idle ambient subtle wave
        gradient.addColorStop(0, '#334155');
        gradient.addColorStop(1, '#1e293b');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      // Round pill bars
      const radius = barWidth / 2;
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
    }

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // Start Real-Time Microphone Recording + Real-Time Speech Recognition
  const startRecording = async () => {
    try {
      // Clear prior attempts
      finalTranscriptRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      setSpeakingSeconds(0);
      setAudioUrl(null);
      setSpeakingResult(null);

      // 1. Acquire Microphone MediaStream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup Web Audio API Analyzer for Dynamic Waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Kick off live canvas rendering
      animationFrameRef.current = requestAnimationFrame(drawWaveform);

      // 3. Setup MediaRecorder for high-fidelity audio capture
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);
      };

      mediaRecorder.start(250); // Emit chunks every 250ms

      // 4. Setup Instant Real-Time Speech Recognition (Web Speech API)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalAccumulated = finalTranscriptRef.current;

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            const textChunk = res[0].transcript;
            if (res.isFinal) {
              finalAccumulated = (finalAccumulated ? finalAccumulated + ' ' : '') + textChunk.trim();
              finalTranscriptRef.current = finalAccumulated;
            } else {
              interim += textChunk;
            }
          }

          setTranscript(finalAccumulated);
          setInterimTranscript(interim);
        };

        recognition.onerror = (e: any) => {
          // 'no-speech' happens naturally on pauses; keep continuous session alive
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition status:', e.error);
          }
        };

        recognition.onend = () => {
          // If candidate is still speaking, seamlessly restart recognition
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (_) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn('Web Speech API not supported on this browser. Voice recorded via MediaRecorder.');
      }

      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Please allow microphone access to practice speaking and view real-time word generation.');
    }
  };

  // Stop Recording and Automatically Evaluate & Display Score Modal
  const stopRecordingAndScore = async () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    // Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    // Stop Media Recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop Audio Tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Cancel Animation Frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Assemble final complete transcript
    const completeTranscript = (
      finalTranscriptRef.current + (interimTranscript ? ' ' + interimTranscript : '')
    ).trim();

    setTranscript(completeTranscript);
    setInterimTranscript('');

    // Open Instant Score Modal in loading state
    setIsScoreModalOpen(true);

    if (completeTranscript.length >= 10) {
      await evaluateSpeech(completeTranscript);
    } else {
      // If candidate spoke virtually nothing, provide fallback feedback
      const minimalResult: SpeakingResultData = {
        fluencyCoherence: 4.0,
        lexicalResource: 4.0,
        grammaticalRangeAccuracy: 4.0,
        pronunciation: 5.0,
        overallBand: 4.5,
        feedback:
          'Your spoken response was under 10 words. An authentic IELTS speaking response requires continuous elaboration with structured compound sentences.',
        keyStrengths: ['Microphone was connected and audio was captured.'],
        corrections: [],
        modelBand9Answer:
          'In my personal view, this topic holds vital significance. A balanced approach combining strategic regulation and individual initiative produces the most sustainable outcome.',
      };
      setSpeakingResult(minimalResult);
      setIsEvaluating(false);
    }
  };

  // Call Server-Side Certified IELTS Examiner Engine
  const evaluateSpeech = async (speechText: string) => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/gemini/score-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic,
          partNumber: activePart,
          transcript: speechText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.overallBand !== undefined) {
        setSpeakingResult(data);
        onSaveSession({
          partNumber: activePart,
          topic: currentTopic,
          transcript: speechText,
          overallBand: data.overallBand,
          feedback: data.feedback || '',
          durationSeconds: speakingSeconds,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Speech evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Examiner Text-to-Speech (gemini-3.8-flash-tts)
  const handlePlayExaminerQuestion = async (text: string) => {
    setIsGeneratingTts(true);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: 'Puck',
          style: 'British Council IELTS Speaking Examiner, formal, encouraging, professional',
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        setTtsAudioUrl(`data:audio/wav;base64,${data.audioBase64}`);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Toggle Live API Voice Conversation (gemini-3.8-live)
  const toggleLiveExaminer = () => {
    if (isLiveWsActive) {
      if (liveWsRef.current) {
        liveWsRef.current.close();
      }
      setIsLiveWsActive(false);
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = () => {
        setIsLiveWsActive(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioCtx({ sampleRate: 24000 });
            const binary = atob(msg.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
            const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
          }
        } catch (_) {}
      };

      ws.onclose = () => {
        setIsLiveWsActive(false);
      };

      ws.onerror = () => {
        setIsLiveWsActive(false);
      };
    }
  };

  const handleProceedNextPart = () => {
    if (activePart === 1) setActivePart(2);
    else if (activePart === 2) setActivePart(3);
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setSpeakingResult(null);
    setSpeakingSeconds(0);
  };

  const handleRetryCurrentPart = () => {
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setSpeakingResult(null);
    setSpeakingSeconds(0);
  };

  const loadSampleTranscript = () => {
    const sample =
      activePart === 1
        ? 'Well, I currently reside in a vibrant residential district on the outskirts of the capital. What I appreciate most about my area is the abundance of green public spaces and recreational facilities, which allow residents to unwind after work.'
        : activePart === 2
        ? `I would like to talk about an inspiring community wetlands restoration project called the Greenfield Eco-Park initiative, situated on the outskirts of our metropolitan region. I initially stumbled across this project around eight months ago through a university environmental society newsletter.\n\nHistorically, the location had functioned as an active limestone quarry which left the soil degraded and vulnerable to seasonal erosion. The municipal council partnered with local ecologists and community volunteers to remediate the area. Our team participated in planting over two thousand native willow saplings and reedbeds, which act as natural bio-filtration systems for urban stormwater runoff. In addition, we constructed modular nesting boxes to encourage the return of indigenous waterfowl.\n\nI firmly consider this initiative an undeniable success because within merely six months, biodiversity surveys recorded fourteen species of migratory birds nesting in the marshlands, alongside providing local residents with an educational open-air corridor that fosters environmental stewardship.`
        : 'From my perspective, international regulations are indispensable because multinational corporations operate across borders that individual jurisdictions cannot easily police. While grass-roots initiatives raise critical public awareness, binding statutory penalties are required to enforce genuine accountability.';

    setTranscript(sample);
    setInterimTranscript('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 border border-slate-750 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Instant Live Speech Recognition · Soundwave Telemetry · AI Band Scoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cambridge IELTS Speaking Studio
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Speak into the microphone to watch your words materialize on screen in real time. Features
              dynamic soundwave frequency analytics, speaking pace meter, and instant official 4-criteria band scoring.
            </p>
          </div>

          {/* Part 1, 2, 3 Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (isRecording) {
                    stopRecordingAndScore();
                  }
                  setActivePart(p as any);
                  setTranscript('');
                  setInterimTranscript('');
                  setSpeakingResult(null);
                  setAudioUrl(null);
                  setSpeakingSeconds(0);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activePart === p
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Part {p} {p === 1 ? '· Intro' : p === 2 ? '· Cue Card' : '· Discussion'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Part 2: Cue Card & Prep Timer Banner */}
      {activePart === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Part 2: Candidate Long Turn (2 Minutes)
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">Official Cambridge Cue Card</h3>
            </div>

            {/* 1-Minute Preparation Countdown Bar */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold font-mono ${
                  prepSecondsLeft <= 10 && isPrepTimerRunning
                    ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                    : 'bg-slate-950 border-slate-750 text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Prep Time: 00:{prepSecondsLeft < 10 ? `0${prepSecondsLeft}` : prepSecondsLeft}</span>
              </div>

              {!isPrepTimerRunning ? (
                <button
                  onClick={startPrepTimer}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Start 1-Min Prep
                </button>
              ) : (
                <button
                  onClick={resetPrepTimer}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Reset Prep Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cue Card Frame */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-inner space-y-4">
            <h4 className="text-base font-extrabold text-white">{cueCardTopic}</h4>
            <p className="text-xs text-slate-400 font-medium">You should say:</p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {cueCardPoints.map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Part 1 & 3: Examiner Spoken Questions & TTS */}
      {(activePart === 1 || activePart === 3) && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <h3 className="font-extrabold text-sm text-white">
                {activePart === 1
                  ? 'Part 1: Everyday & Personal Questions'
                  : 'Part 3: In-Depth Abstract Discussion Questions'}
              </h3>
            </div>
            <button
              onClick={() =>
                handlePlayExaminerQuestion(
                  activePart === 1
                    ? 'Good morning. Could you tell me a little bit about your hometown, and what you enjoy most about living there?'
                    : 'To what extent do you believe individual consumer actions can solve global climate change compared to international regulations?'
                )
              }
              disabled={isGeneratingTts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isGeneratingTts ? 'Examiner Speaking...' : 'Audio Prompt'}</span>
            </button>
          </div>

          {ttsAudioUrl && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <audio controls autoPlay src={ttsAudioUrl} className="w-full h-8" />
            </div>
          )}

          <div className="space-y-2.5">
            {(activePart === 1 ? part1Questions : part3Questions).map((q: string, i: number) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-rose-400 font-bold">Q{i + 1}:</span>
                  <span>{q}</span>
                </div>
                <button
                  onClick={() => handlePlayExaminerQuestion(q)}
                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer shrink-0"
                  title="Listen to this question"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Speaking Console & Live Word Generation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-extrabold text-white">Live Microphone Console & Transcription</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Press Start and speak naturally. Words generate in real time as you speak.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live API WebSocket Toggle (gemini-3.8-live) */}
            <button
              onClick={toggleLiveExaminer}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isLiveWsActive
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isLiveWsActive ? 'Live Examiner Active' : 'Live Voice Interview'}</span>
            </button>

            {/* Start / Stop Recording Button */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-lg shadow-rose-600/30 cursor-pointer hover:scale-[1.02]"
              >
                <Mic className="w-4 h-4" />
                <span>Start Microphone Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecordingAndScore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black animate-pulse cursor-pointer shadow-lg shadow-red-600/40"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & View Instant Score ({speakingSeconds}s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Visualizer & Real-Time Telemetry Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Recording State Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRecording
                    ? isVoiceActive
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-rose-500 animate-pulse'
                    : 'bg-slate-600'
                }`}
              />
              <span className="font-bold text-slate-200">
                {isRecording
                  ? isVoiceActive
                    ? 'Voice Detected · Streaming Words Live'
                    : 'Microphone Active · Listening...'
                  : 'Microphone Standby'}
              </span>
            </div>

            {/* Real-Time Live Counters */}
            <div className="flex items-center gap-4 font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-white font-bold tabular-nums">
                  {Math.floor(speakingSeconds / 60)}:
                  {speakingSeconds % 60 < 10 ? `0${speakingSeconds % 60}` : speakingSeconds % 60}
                </span>
                {activePart === 2 && <span className="text-[11px] text-slate-500">/ 02:00</span>}
              </div>

              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-white font-bold tabular-nums">{currentWordCount} words</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                <span
                  className={`font-bold tabular-nums ${
                    currentWpm >= 120 && currentWpm <= 155
                      ? 'text-emerald-400'
                      : currentWpm > 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {currentWpm} WPM
                </span>
              </div>
            </div>
          </div>

          {/* Canvas Waveform */}
          <div className="w-full h-16 bg-slate-900/80 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-850">
            <canvas ref={canvasRef} width={640} height={60} className="w-full h-full" />
          </div>
        </div>

        {/* Real-Time Transcript Display Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Real-Time Speech Stream (Words appear as you speak):</span>
            </label>
            <button
              onClick={loadSampleTranscript}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Insert Band 9 Sample Speech
            </button>
          </div>

          {/* Live Streaming Box */}
          <div className="relative min-h-[140px] p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-serif leading-relaxed text-slate-200">
            {transcript || interimTranscript ? (
              <p className="whitespace-pre-wrap">
                <span>{transcript}</span>
                {interimTranscript && (
                  <span className="text-rose-400 italic bg-rose-950/40 px-1 py-0.5 rounded border border-rose-900/60 ml-1">
                    {interimTranscript}
                  </span>
                )}
                {isRecording && (
                  <span className="inline-block w-2 h-4 bg-rose-500 animate-pulse ml-1 align-middle" />
                )}
              </p>
            ) : (
              <p className="text-slate-500 italic select-none">
                {isRecording
                  ? 'Start speaking into your microphone... your words will appear here immediately in real time.'
                  : 'Click "Start Microphone Recording" above to begin speaking. Your words will stream into this box instant-by-instant.'}
              </p>
            )}
          </div>

          {/* Audio Playback of Recorded Response */}
          {audioUrl && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 shrink-0">Recorded Audio:</span>
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          )}
        </div>

        {/* Footer Score Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-400">
            Stopping the recording automatically opens your instant IELTS Examiner Score Card.
          </span>

          <button
            onClick={() => {
              if (isRecording) {
                stopRecordingAndScore();
              } else {
                if (combinedTranscriptText.length >= 10) {
                  setIsScoreModalOpen(true);
                  evaluateSpeech(combinedTranscriptText);
                } else {
                  alert('Please record speech or enter a transcript to score.');
                }
              }
            }}
            disabled={isEvaluating || (!isRecording && combinedTranscriptText.length < 10)}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Speaking Performance...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>
                  {isRecording ? 'Stop & Score Spoken Response' : 'Score Spoken Transcript'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instant IELTS 4-Criteria Speaking Part Score Modal */}
      <SpeakingPartScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onProceedNextPart={activePart < 3 ? handleProceedNextPart : undefined}
        onRetryPart={handleRetryCurrentPart}
        activePart={activePart}
        topic={currentTopic}
        transcript={combinedTranscriptText}
        audioUrl={audioUrl}
        speakingSeconds={speakingSeconds}
        result={speakingResult}
        isEvaluating={isEvaluating}
        hasNextPart={activePart < 3}
        nextPartLabel={
          activePart === 1
            ? 'Proceed to Part 2 (Cue Card)'
            : 'Proceed to Part 3 (Discussion)'
        }
      />
    </div>
  );
}
