import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  PenTool,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PrestigeHeroSectionProps {
  onNavigateToTab: (tab: string) => void;
  targetBand: number;
}

export default function PrestigeHeroSection({
  onNavigateToTab,
  targetBand,
}: PrestigeHeroSectionProps) {
  const [heroImgLoaded, setHeroImgLoaded] = useState<boolean>(true);

  return (
    <div className="space-y-8 mb-10">
      {/* Grand Cambridge Architectural Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/25 shadow-2xl bg-[#040a17]">
        {/* Photographic Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/cambridge_campus_hero_1792695325914.jpg"
            alt="Cambridge University King's College Chapel and Historic Collegiate Architecture"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgLoaded(false)}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              heroImgLoaded ? 'opacity-40' : 'opacity-0'
            }`}
          />
          {/* Deep Royal Navy & Midnight Linear Gradient Overlay for Perfect Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040a17] via-[#040a17]/90 to-[#040a17]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040a17] via-transparent to-transparent" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl space-y-6">
          {/* Unboxed Metadata Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300">
            <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase font-mono text-[11px] text-amber-400">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              Official Cambridge Standards
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">Books 1–21 Complete Archives</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300">84 Authentic Full Tests</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-amber-300/90 font-mono">Target: Band {targetBand.toFixed(1)}</span>
          </div>

          {/* Majestic Display Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] text-balance">
            Official Cambridge Academic Mock Tests & AI Band Analytics
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Prepare with authenticated Cambridge IELTS test materials. Features instant real-time live speech word generation in the Speaking Studio, Thinking-Mode AI evaluations for Writing Tasks 1 & 2, and full-length Listening & Reading simulation engines.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('cambridge')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>Start Cambridge Mock (Book 21)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onNavigateToTab('speaking')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0a1428] hover:bg-[#122244] border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm transition-all cursor-pointer hover:border-rose-400"
            >
              <Mic className="w-4 h-4 text-rose-400" />
              <span>Real-Time Speaking Studio</span>
            </button>

            <button
              onClick={() => onNavigateToTab('writing')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0a1428] hover:bg-[#122244] border border-amber-500/30 text-amber-300 font-bold text-xs sm:text-sm transition-all cursor-pointer hover:border-amber-400"
            >
              <PenTool className="w-4 h-4 text-amber-400" />
              <span>AI Writing Evaluator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asymmetric 4-Skill Bento Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              The 4 Official IELTS Academic Modules
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Certified Cambridge Conversion Standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Listening Module (Sapphire Blue) */}
          <div className="group relative rounded-2xl overflow-hidden border border-blue-500/30 bg-[#07132c] hover:border-blue-400 transition-all duration-300 flex flex-col justify-between shadow-lg">
            <div className="h-32 relative overflow-hidden">
              <img
                src="/src/assets/images/cambridge_exam_hall_1792695326034.jpg"
                alt="Cambridge IELTS Examination Hall with Candidates"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07132c] via-[#07132c]/60 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-500/40 text-[11px] font-bold text-blue-300">
                <Headphones className="w-3.5 h-3.5 text-blue-400" />
                <span>Listening Module</span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-blue-300 transition-colors">
                  Sections 1–4 Audio Practice
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Practice monologue & dialogue questions with raw-score conversion and section diagnostics.
                </p>
              </div>

              <div className="pt-2 border-t border-blue-900/40 flex items-center justify-between">
                <span className="text-[11px] font-mono text-blue-300/80">40 Questions · 30 Mins</span>
                <button
                  onClick={() => onNavigateToTab('cambridge')}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Reading Module (Emerald Jade) */}
          <div className="group relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#051c18] hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between shadow-lg">
            <div className="h-32 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-[#051c18] to-slate-950 flex items-center justify-center p-4">
              <div className="text-center space-y-1">
                <BookOpen className="w-8 h-8 text-emerald-400 mx-auto" />
                <span className="text-[11px] font-mono text-emerald-300 font-bold block">
                  3 Academic Passages
                </span>
              </div>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reading Module</span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Academic Passages 1–3
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Split-view reading layout with authentic scientific texts, true/false/not given, and matching headings.
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-300/80">40 Questions · 60 Mins</span>
                <button
                  onClick={() => onNavigateToTab('cambridge')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Writing Lab (Warm Amber Gold) */}
          <div className="group relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#1a1405] hover:border-amber-400 transition-all duration-300 flex flex-col justify-between shadow-lg">
            <div className="h-32 relative overflow-hidden">
              <img
                src="/src/assets/images/candidate_writing_desk_1792695327351.jpg"
                alt="Academic Study Desk with Cambridge Test Booklet and Charts"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1405] via-[#1a1405]/60 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-500/40 text-[11px] font-bold text-amber-300">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                <span>Writing Lab</span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                  Task 1 & Task 2 Evaluator
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Interactive charts, live word counter, TR/CC/LR/GRA breakdown, and Band 9 model rewrite.
                </p>
              </div>

              <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-300/80">1:2 Official Weighting</span>
                <button
                  onClick={() => onNavigateToTab('writing')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Evaluate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: Speaking Studio (Rose Crimson) */}
          <div className="group relative rounded-2xl overflow-hidden border border-rose-500/30 bg-[#1f0910] hover:border-rose-400 transition-all duration-300 flex flex-col justify-between shadow-lg">
            <div className="h-32 relative overflow-hidden">
              <img
                src="/src/assets/images/candidate_speaking_lab_1792695326761.jpg"
                alt="Candidate in Language Speaking Testing Studio with Microphone"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f0910] via-[#1f0910]/60 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 border border-rose-500/40 text-[11px] font-bold text-rose-300">
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Speaking Studio</span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-rose-300 transition-colors">
                  Real-Time Spoken Word Stream
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Words appear on screen right as you speak, with live soundwave canvas and instant FC/LR/GRA/PR scores.
                </p>
              </div>

              <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between">
                <span className="text-[11px] font-mono text-rose-300/80">Parts 1, 2, 3 Active</span>
                <button
                  onClick={() => onNavigateToTab('speaking')}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
