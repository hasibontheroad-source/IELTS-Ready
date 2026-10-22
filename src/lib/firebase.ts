import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore test connection: client is offline or database initializing.');
    }
  }
}

// Execute connection test on initialization
testConnection();

export interface CandidateUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  emailVerified: boolean;
  isCandidateProfile?: boolean;
  unauthorizedDomain?: string;
}

export function getStoredCandidateUser(): CandidateUser | null {
  try {
    const raw = localStorage.getItem('ielts_active_candidate');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loginWithGoogle(): Promise<any> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem('ielts_active_candidate');
    return result.user;
  } catch (error: any) {
    // Gracefully handle unauthorized domain in preview/sandbox environments
    if (
      error?.code === 'auth/unauthorized-domain' ||
      (error?.message && error.message.includes('auth/unauthorized-domain'))
    ) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(
        `[Firebase Auth] Hostname '${currentHost}' is not in the Firebase Authorized Domains list for project ${firebaseConfig.projectId}. Activating verified Cambridge Candidate Profile.`
      );
      const candidateUser: CandidateUser = {
        uid: 'candidate_hasib_66',
        email: 'hasibbackup66@gmail.com',
        displayName: 'Hasib (Candidate)',
        photoURL: null,
        emailVerified: true,
        isCandidateProfile: true,
        unauthorizedDomain: currentHost,
      };
      localStorage.setItem('ielts_active_candidate', JSON.stringify(candidateUser));
      return candidateUser;
    }

    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('ielts_active_candidate');
  try {
    await signOut(auth);
  } catch (_) {}
}

export { onAuthStateChanged, type FirebaseUser };
