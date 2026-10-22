/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CambridgeMockHub from './components/CambridgeMockHub';
import WritingEvaluator from './components/WritingEvaluator';
import SpeakingStudio from './components/SpeakingStudio';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ExamIntelSearch from './components/ExamIntelSearch';
import ThreeScene from './components/ThreeScene';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SavedMaterialsModal } from './components/SavedMaterialsModal';
import PrestigeHeroSection from './components/PrestigeHeroSection';
import {
  ShieldCheck,
  X,
  Award,
} from 'lucide-react';
import {
  getLocalAttempts,
  saveLocalAttempts,
  appendLocalAttempt,
  getLocalWritingSubmissions,
  saveLocalWritingSubmissions,
  appendLocalWritingSubmission,
  getLocalSpeakingSessions,
  saveLocalSpeakingSessions,
  appendLocalSpeakingSession,
  getLocalTargetBand,
  saveLocalTargetBand,
  getSavedMaterials,
  subscribeToOfflineCache,
} from './utils/offlineStorage';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  type FirebaseUser,
  handleFirestoreError,
  OperationType,
  getStoredCandidateUser,
} from './lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('cambridge');
  const [currentUser, setCurrentUser] = useState<any>(() => getStoredCandidateUser());
  const [showAuthDomainNotice, setShowAuthDomainNotice] = useState<boolean>(false);
  const [targetBand, setTargetBand] = useState<number>(() => getLocalTargetBand(7.5));
  const [attempts, setAttempts] = useState<any[]>(() => getLocalAttempts());
  const [writingSubmissions, setWritingSubmissions] = useState<any[]>(() => getLocalWritingSubmissions());
  const [speakingSessions, setSpeakingSessions] = useState<any[]>(() => getLocalSpeakingSessions());
  const [transferredWritingPrompt, setTransferredWritingPrompt] = useState<any>(null);
  const [transferredSpeakingParts, setTransferredSpeakingParts] = useState<any>(null);

  // Offline Saved Materials modal state & selected test transfer
  const [isSavedMaterialsOpen, setIsSavedMaterialsOpen] = useState<boolean>(false);
  const [savedMaterialsCount, setSavedMaterialsCount] = useState<number>(() => getSavedMaterials().length);
  const [selectedSavedTest, setSelectedSavedTest] = useState<{
    bookNumber: number;
    testNumber: number;
    module?: 'listening' | 'reading' | 'writing' | 'speaking';
  } | null>(null);

  // Subscribe to offline cache count changes
  useEffect(() => {
    const unsub = subscribeToOfflineCache(() => {
      setSavedMaterialsCount(getSavedMaterials().length);
    });
    return () => unsub();
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    // If local cache is totally fresh and empty, populate seed data immediately
    const existingAttempts = getLocalAttempts();
    if (existingAttempts.length === 0) {
      loadSeedData();
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Load user profile & past attempts from Firestore with offline write-through
        await loadUserData(user.uid);
      } else {
        const candidate = getStoredCandidateUser();
        setCurrentUser(candidate);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSeedData = () => {
    const seedAttempts = [
      {
        id: 'attempt_seed_1',
        bookNumber: 21,
        testNumber: 1,
        module: 'listening',
        score: 35,
        bandScore: 8.0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'attempt_seed_2',
        bookNumber: 21,
        testNumber: 1,
        module: 'reading',
        score: 31,
        bandScore: 7.0,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ];

    const seedWriting = [
      {
        id: 'writing_seed_1',
        taskType: 'task2',
        promptTitle: 'Artificial Intelligence and Higher Education',
        overallBand: 7.5,
        summary: 'Excellent academic argumentation and sophisticated lexical range.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];

    const seedSpeaking = [
      {
        id: 'speaking_seed_1',
        partNumber: 2,
        topic: 'An Environmental Project in Your City',
        overallBand: 7.5,
        durationSeconds: 110,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ];

    setAttempts(seedAttempts);
    setWritingSubmissions(seedWriting);
    setSpeakingSessions(seedSpeaking);

    // Persist seed data to localStorage so it is available offline immediately
    saveLocalAttempts(seedAttempts);
    saveLocalWritingSubmissions(seedWriting);
    saveLocalSpeakingSessions(seedSpeaking);
  };

  const loadUserData = async (userId: string) => {
    try {
      // 1. User doc
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const udata = userSnap.data();
        if (udata.targetBand) {
          setTargetBand(udata.targetBand);
          saveLocalTargetBand(udata.targetBand);
        }
      } else {
        // Create initial user profile
        await setDoc(userDocRef, {
          id: userId,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || '',
          photoURL: currentUser?.photoURL || '',
          targetBand: targetBand,
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Mock attempts
      const attemptsQuery = query(collection(db, 'mock_attempts'), where('userId', '==', userId));
      const attemptsSnap = await getDocs(attemptsQuery);
      const loadedAttempts: any[] = [];
      attemptsSnap.forEach((d) => loadedAttempts.push(d.data()));
      if (loadedAttempts.length > 0) {
        setAttempts(loadedAttempts);
        saveLocalAttempts(loadedAttempts);
      }

      // 3. Writing submissions
      const writingQuery = query(collection(db, 'writing_submissions'), where('userId', '==', userId));
      const writingSnap = await getDocs(writingQuery);
      const loadedWriting: any[] = [];
      writingSnap.forEach((d) => loadedWriting.push(d.data()));
      if (loadedWriting.length > 0) {
        setWritingSubmissions(loadedWriting);
        saveLocalWritingSubmissions(loadedWriting);
      }

      // 4. Speaking sessions
      const speakingQuery = query(collection(db, 'speaking_sessions'), where('userId', '==', userId));
      const speakingSnap = await getDocs(speakingQuery);
      const loadedSpeaking: any[] = [];
      speakingSnap.forEach((d) => loadedSpeaking.push(d.data()));
      if (loadedSpeaking.length > 0) {
        setSpeakingSessions(loadedSpeaking);
        saveLocalSpeakingSessions(loadedSpeaking);
      }
    } catch (err) {
      console.warn('Network offline or error loading Firestore user data, using cached local data:', err);
      // Local state is already initialized from localStorage!
    }
  };

  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setCurrentUser(user);
        if (user.isCandidateProfile) {
          setShowAuthDomainNotice(true);
        }
      }
    } catch (err: any) {
      console.warn('Authentication status:', err?.message || err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      loadSeedData();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleUpdateTargetBand = async (newBand: number) => {
    setTargetBand(newBand);
    if (currentUser && !currentUser.isCandidateProfile) {
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            targetBand: newBand,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const handleSaveAttempt = async (attempt: any) => {
    const newAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalAttempt(newAttempt);
    setAttempts(updated);

    if (currentUser && !currentUser.isCandidateProfile && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'mock_attempts', newAttempt.id), newAttempt);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `mock_attempts/${newAttempt.id}`);
      }
    }
  };

  const handleSaveWritingSubmission = async (submission: any) => {
    const newSub = {
      ...submission,
      id: `writing_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalWritingSubmission(newSub);
    setWritingSubmissions(updated);

    if (currentUser && !currentUser.isCandidateProfile && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'writing_submissions', newSub.id), newSub);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `writing_submissions/${newSub.id}`);
      }
    }
  };

  const handleSaveSpeakingSession = async (session: any) => {
    const newSession = {
      ...session,
      id: `speaking_${Date.now()}`,
      userId: currentUser?.uid || 'guest_user',
    };
    const updated = appendLocalSpeakingSession(newSession);
    setSpeakingSessions(updated);

    if (currentUser && !currentUser.isCandidateProfile && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await setDoc(doc(db, 'speaking_sessions', newSession.id), newSession);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `speaking_sessions/${newSession.id}`);
      }
    }
  };

  const handleNavigateToWriting = (promptData: any) => {
    setTransferredWritingPrompt(promptData);
    setActiveTab('writing');
  };

  const handleNavigateToSpeaking = (partsData: any) => {
    setTransferredSpeakingParts(partsData);
    setActiveTab('speaking');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        targetBand={targetBand}
        onOpenSavedMaterials={() => setIsSavedMaterialsOpen(true)}
        savedMaterialsCount={savedMaterialsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Prestige Hero & 4-Module Bento Showcase when on Cambridge or Overview */}
        {activeTab === 'cambridge' && (
          <PrestigeHeroSection
            onNavigateToTab={setActiveTab}
            targetBand={targetBand}
          />
        )}

        {activeTab === 'cambridge' && (
          <CambridgeMockHub
            onSaveAttempt={handleSaveAttempt}
            onNavigateToWriting={handleNavigateToWriting}
            onNavigateToSpeaking={handleNavigateToSpeaking}
            initialSelectedTest={selectedSavedTest}
          />
        )}

        {activeTab === 'writing' && (
          <WritingEvaluator
            initialPrompt={transferredWritingPrompt}
            onSaveSubmission={handleSaveWritingSubmission}
          />
        )}

        {activeTab === 'speaking' && (
          <SpeakingStudio
            initialParts={transferredSpeakingParts}
            onSaveSession={handleSaveSpeakingSession}
          />
        )}

        {activeTab === 'dashboard' && (
          <AnalyticsDashboard
            attempts={attempts}
            writingSubmissions={writingSubmissions}
            speakingSessions={speakingSessions}
            targetBand={targetBand}
            onUpdateTargetBand={handleUpdateTargetBand}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'intel' && <ExamIntelSearch />}

        {activeTab === '3d-hall' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0a1428] border border-amber-500/20">
              <h2 className="text-xl font-bold text-white mb-1">
                Interactive 3D Cambridge Examination Hall
              </h2>
              <p className="text-xs text-slate-300">
                Explore the Cambridge IELTS Assessment Hall in real-time 3D PBR graphics. Inspect the official
                Band 9 Armillary Globe, the examiner examination station, and the complete Cambridge 1-21 archives.
              </p>
            </div>
            <ThreeScene />
          </div>
        )}
      </main>

      {/* Quiet Prestigious Footer */}
      <footer className="border-t border-amber-500/15 bg-[#040a17] text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">IELTS Ready</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Cambridge English & British Council IELTS Academic Alignment</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Official Books 1–21</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Instant Band Scoring</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>PWA Offline Certified</span>
          </div>
        </div>
      </footer>

      {/* Floating Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Saved Offline Materials Modal */}
      <SavedMaterialsModal
        isOpen={isSavedMaterialsOpen}
        onClose={() => setIsSavedMaterialsOpen(false)}
        onSelectTest={(bookNumber, testNumber, module) => {
          setSelectedSavedTest({
            bookNumber,
            testNumber,
            module: module as any,
          });
          setActiveTab('cambridge');
        }}
      />

      {/* Firebase Domain Authorization Notice Modal */}
      {showAuthDomainNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0a1428] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Cambridge Candidate Session Active
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Candidate Profile & Domain Notice
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowAuthDomainNotice(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your preview environment is running on <code className="text-amber-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-750">{typeof window !== 'undefined' ? window.location.hostname : 'Cloud Run'}</code>.
              Your certified Candidate Profile (<strong className="text-white">hasibbackup66@gmail.com</strong>) is active with full offline and local persistence!
            </p>

            <div className="p-4 rounded-2xl bg-[#040a17] border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-amber-300 block">
                To authorize Google popup sign-in on this domain:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                <li>Open Firebase Console for project <strong className="text-white font-mono">delta-treat-7bcxw</strong></li>
                <li>Go to <strong className="text-white">Authentication &gt; Settings &gt; Authorized domains</strong></li>
                <li>Click <strong className="text-white">Add domain</strong> and enter: <code className="text-amber-400 font-mono">{typeof window !== 'undefined' ? window.location.hostname : ''}</code></li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">All practice tests and scores are saved.</span>
              <button
                onClick={() => setShowAuthDomainNotice(false)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Continue Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
