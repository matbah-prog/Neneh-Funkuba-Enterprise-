import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfigJson as any).firestoreDatabaseId || undefined);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('email');
googleProvider.addScope('profile');

/**
 * Perform Google Sign-In via Popup with Firebase Auth and Google Drive OAuth scope.
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    return {
      user: result.user,
      accessToken: accessToken,
    };
  } catch (error: any) {
    console.error('Firebase Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign out current user from Firebase Auth.
 */
export const logoutFirebase = async () => {
  return firebaseSignOut(auth);
};

export { onAuthStateChanged };
export type { User };
