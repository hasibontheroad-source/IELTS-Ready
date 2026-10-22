import React from 'react';
import {
  BookOpen,
  BarChart3,
  Mic,
  PenTool,
  Globe,
  LogIn,
  LogOut,
  Bookmark,
  Sparkles,
  Award
} from 'lucide-react';
import type { FirebaseUser } from '../lib/firebase';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  targetBand: number;
  onOpenSavedMaterials?: () => void;
  savedMaterialsCount?: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogin,
  onLogout,
  targetBand,
  onOpenSavedMaterials,
  savedMaterialsCount = 0,
}: NavbarProps) {
  const navItems = [
    { id: 'cambridge', label: 'Cambridge Mocks', icon: BookOpen },
    { id: 'writing', label: 'Writing Lab', icon: PenTool },
    { id: 'speaking', label: 'Speaking Studio', icon: Mic },
    { id: 'dashboard', label: 'Band Analytics', icon: BarChart3 },
    { id: 'intel', label: 'Exam Intel', icon: Globe },
    { id: '3d-hall', label: '3D Hall', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#040a17]/95 backdrop-blur-md border-b border-amber-500/20 text-slate-100 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Single Clean Brand Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('cambridge')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-sm tracking-wider group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">
                IELTS<span className="text-amber-400">Ready</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-amber-300/80 uppercase">
                Cambridge
              </span>
            </div>
          </div>

          {/* Zone 2: 5 Concise Single-Line Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Cluster & User Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Saved Offline Materials */}
            {onOpenSavedMaterials && (
              <button
                onClick={onOpenSavedMaterials}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0a1428] hover:bg-[#101e3b] border border-amber-500/20 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
                title="View Saved Offline Test Materials"
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedMaterialsCount > 0 ? 'text-amber-400 fill-amber-500/20' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Offline</span>
                {savedMaterialsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[10px] font-black text-slate-950 font-mono">
                    {savedMaterialsCount}
                  </span>
                )}
              </button>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Target Band Metric */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0a1428] border border-amber-500/25 text-xs">
              <span className="text-slate-400">Target:</span>
              <span className="font-mono font-bold text-amber-400">Band {targetBand.toFixed(1)}</span>
            </div>

            {/* User Profile / Authentication */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[#0a1428] pl-2 pr-3 py-1 rounded-lg border border-amber-500/20">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-500/40"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg bg-[#0a1428] border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-[#101e3b] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row (Horizontal Scroll) */}
        <div className="flex lg:hidden items-center gap-1 py-2 overflow-x-auto scrollbar-none border-t border-slate-850">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
