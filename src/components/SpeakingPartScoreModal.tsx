import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  RotateCcw,
  Sparkles,
  TrendingUp,
  FileText,
  Volume2,
  Mic,
  ArrowRight,
  Loader2,
  Play,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import { getBandDescriptor, getCEFRLevel } from '../utils/scoring';

export interface SpeakingResultData {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  pronunciation: number;
  overallBand: number;
  feedback: string;
  keyStrengths?: string[];
  corrections?: Array<{
    said: string;
    suggested: string;
    explanation: string;
  }>;
  modelBand9Answer?: string;
}

interface SpeakingPartScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedNextPart?: () => void;
  onRetryPart?: () => void;
  activePart: 1 | 2 | 3;
  topic: string;
  transcript: string;
  audioUrl: string | null;
  speakingSeconds: number;
  result: SpeakingResultData | null;
  isEvaluating: boolean;
  hasNextPart: boolean;
  nextPartLabel?: string;
}

export default function SpeakingPartScoreModal({
  isOpen,
  onClose,
  onProceedNextPart,
  onRetryPart,
  activePart,
  topic,
  transcript,
  audioUrl,
  speakingSeconds,
  result,
  isEvaluating,
  hasNextPart,
  nextPartLabel = 'Next Part',
}: SpeakingPartScoreModalProps) {
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);
  const [copiedModelAnswer, setCopiedModelAnswer] = useState<boolean>(false);

  if (!isOpen) return null;

  const partNames: Record<1 | 2 | 3, string> = {
    1: 'Part 1: Introduction & Familiar Topics',
    2: 'Part 2: Individual Long Turn (Cue Card)',
    3: 'Part 3: Two-Way Abstract Discussion',
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = speakingSeconds > 0 ? Math.round((wordCount / speakingSeconds) * 60) : 0;
  const overallBand = result?.overallBand ?? 0.0;
  const cefr = getCEFRLevel(overallBand);
  const bandDescriptor = getBandDescriptor(overallBand);

  const handleCopyModelAnswer = () => {
    if (result?.modelBand9Answer) {
      navigator.clipboard.writeText(result.modelBand9Answer);
      setCopiedModelAnswer(true);
      setTimeout(() => setCopiedModelAnswer(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600/25 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Award className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 font-mono">
                Certified IELTS Speaking Examiner Evaluation
              </span>
              <h3 className="text-lg font-black text-white">
                {partNames[activePart]}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {/* Topic Subtitle */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-slate-400 font-semibold block">Speaking Prompt:</span>
              <p className="text-slate-200 font-medium mt-0.5">{topic}</p>
            </div>
          </div>

          {/* Loading State while Examiner is Evaluating */}
          {isEvaluating && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                <Mic className="w-6 h-6 text-rose-400 absolute" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Examiner Assessing Candidate Response...</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Analyzing speech rhythm, grammatical sentence structures, lexical academic collocations, and pronunciation.
                </p>
              </div>
            </div>
          )}

          {/* Result Content */}
          {!isEvaluating && result && (
            <>
              {/* Primary Score & Speech Analytics Hero */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Overall Projected Band */}
                <div className="sm:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-950 to-indigo-950/40 border border-rose-900/50 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-300 block mb-1 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Official Projected Band Score:</span>
                      </span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-4xl font-black text-rose-400 font-mono tabular-nums">
                          {overallBand.toFixed(1)}
                        </span>
                        <span className="text-xs text-rose-200 font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800">
                          {cefr}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      Part {activePart}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-900/40 text-xs text-slate-300">
                    <p className="line-clamp-2">{bandDescriptor}</p>
                  </div>
                </div>

                {/* Speech Cadence Telemetry */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">
                      Speech Diagnostics:
                    </span>
                    <div className="space-y-1.5 font-mono text-xs text-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Word Count:</span>
                        <span className="font-bold text-white tabular-nums">{wordCount} words</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-bold text-white tabular-nums">{speakingSeconds}s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Pace:</span>
                        <span className={`font-bold tabular-nums ${wordsPerMinute >= 115 && wordsPerMinute <= 155 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {wordsPerMinute} WPM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-850 pt-2">
                    {wordsPerMinute >= 115 && wordsPerMinute <= 155 ? (
                      <span className="text-emerald-400 font-medium">Optimal IELTS speaking pace</span>
                    ) : wordsPerMinute < 115 ? (
                      <span className="text-amber-400 font-medium">Slightly deliberate, aim for ~130 WPM</span>
                    ) : (
                      <span className="text-amber-400 font-medium">Fast tempo, ensure clear articulation</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Official IELTS Criteria Score Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Official 4 Criteria Breakdown (0.0 - 9.0)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Fluency & Coherence */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Fluency (FC)</span>
                      <span className="font-mono font-black text-rose-400 text-sm">
                        {result.fluencyCoherence.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${(result.fluencyCoherence / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Flow & linking</span>
                  </div>

                  {/* Lexical Resource */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Lexical (LR)</span>
                      <span className="font-mono font-black text-blue-400 text-sm">
                        {result.lexicalResource.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(result.lexicalResource / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Vocabulary range</span>
                  </div>

                  {/* Grammatical Range & Accuracy */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Grammar (GRA)</span>
                      <span className="font-mono font-black text-indigo-400 text-sm">
                        {result.grammaticalRangeAccuracy.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${(result.grammaticalRangeAccuracy / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Syntax & complexity</span>
                  </div>

                  {/* Pronunciation */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Pronunciation (PR)</span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {result.pronunciation.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(result.pronunciation / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">Clarity & intonation</span>
                  </div>
                </div>
              </div>

              {/* Examiner Qualitative Feedback */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Examiner Comprehensive Feedback:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif">
                  {result.feedback}
                </p>

                {result.keyStrengths && result.keyStrengths.length > 0 && (
                  <div className="pt-2 border-t border-slate-850 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 block uppercase tracking-wider">
                      Key Spoken Strengths Observed:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {result.keyStrengths.map((st, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Speech Corrections / Upgrade Recommendations */}
              {result.corrections && result.corrections.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Examiner Lexical & Grammatical Upgrades:</span>
                  </span>
                  <div className="space-y-2">
                    {result.corrections.map((corr, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-rose-400 line-through">"{corr.said}"</span>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400 font-bold">"{corr.suggested}"</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cambridge Band 9 Model Answer */}
              {result.modelBand9Answer && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-indigo-950/40 border border-blue-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Cambridge Examiner Band 9 Model Spoken Answer:</span>
                    </span>
                    <button
                      onClick={handleCopyModelAnswer}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedModelAnswer ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedModelAnswer ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic border-l-2 border-blue-500 pl-3">
                    "{result.modelBand9Answer}"
                  </p>
                </div>
              )}

              {/* Audio Playback & Transcript Inspection Toggle */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recorded Speech & Real-Time Transcript
                  </span>
                  <button
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    {showFullTranscript ? 'Hide Transcript' : 'Inspect Full Transcript'}
                  </button>
                </div>

                {audioUrl && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-rose-400 shrink-0" />
                    <audio controls src={audioUrl} className="w-full h-8" />
                  </div>
                )}

                {showFullTranscript && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto font-serif text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {transcript || '(No transcript available)'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onRetryPart && (
              <button
                onClick={() => {
                  onClose();
                  onRetryPart();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Part {activePart}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          {hasNextPart && onProceedNextPart ? (
            <button
              onClick={() => {
                onClose();
                onProceedNextPart();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <span>{nextPartLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Complete Speaking Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
