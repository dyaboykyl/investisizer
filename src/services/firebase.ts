import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import config from './firebase.config';

// Check if Firebase should be disabled
const isFirebaseDisabled = () => {
  // Disable Firebase in production
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'production') {
    return true;
  }
  
  // Check for explicit disable flag
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DISABLE_FIREBASE === 'true') {
    return true;
  }
  
  return false;
};

let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseDisabled()) {
  console.log('Firebase disabled in production mode');
  
  // Create mock objects for disabled Firebase
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      // Call callback immediately with null user
      callback(null);
      return () => {}; // Return unsubscribe function
    }
  };
  
  db = null;
} else {
  console.log('Initializing Firebase with config:', {
    projectId: config.projectId,
    authDomain: config.authDomain
  });

  app = initializeApp(config);
  auth = getAuth(app);

  // Use initializeFirestore with cache settings to avoid WebChannel issues
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    // Disable long polling to prevent WebChannel issues
    experimentalForceLongPolling: false,
  });

  console.log('Firestore initialized successfully');
}

export { auth, db };

// Debug: Make reset function available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugFirestore = {
    config: {
      projectId: config.projectId,
      authDomain: config.authDomain
    },
    resetPortfolioSyncState: () => {
      // This will be set up after stores are initialized
      console.log('Reset function not yet available. Try after app loads.');
    }
  };
}