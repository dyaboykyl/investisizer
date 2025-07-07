import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import config from './firebase.config';

console.log('Initializing Firebase with config:', {
  projectId: config.projectId,
  authDomain: config.authDomain
});

const app = initializeApp(config);
export const auth = getAuth(app);

// Use initializeFirestore with cache settings to avoid WebChannel issues
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  // Disable long polling to prevent WebChannel issues
  experimentalForceLongPolling: false,
});

console.log('Firestore initialized successfully');

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