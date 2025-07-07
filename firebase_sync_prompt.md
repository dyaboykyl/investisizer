# Firebase Account & Sync Implementation Prompt

## Overview
Implement basic user authentication and cross-device portfolio synchronization for the Investisizer React app using Firebase Authentication and Firestore. This is a minimal viable implementation focusing on core sync functionality.

## Current Project Context
- **Framework**: React 19.1.0 with TypeScript and MobX state management
- **Architecture**: Feature-based structure with reactive computed properties
- **Storage**: Currently uses localStorage for persistence
- **State**: RootStore pattern with PortfolioStore managing investments/properties

## Firebase Project Configuration

### Environment Setup
- **Development**: Create new project `investisizer-dev`
- **Production**: Use existing project `investisizer` 

### Environment Variables Structure
```bash
# .env.development
VITE_FIREBASE_DEV_API_KEY=your_dev_api_key
VITE_FIREBASE_DEV_AUTH_DOMAIN=investisizer-dev.firebaseapp.com
VITE_FIREBASE_DEV_PROJECT_ID=investisizer-dev
VITE_FIREBASE_DEV_STORAGE_BUCKET=investisizer-dev.appspot.com
VITE_FIREBASE_DEV_MESSAGING_SENDER_ID=dev_sender_id
VITE_FIREBASE_DEV_APP_ID=dev_app_id

# .env.production  
VITE_FIREBASE_PROD_API_KEY=your_prod_api_key
VITE_FIREBASE_PROD_AUTH_DOMAIN=investisizer.firebaseapp.com
VITE_FIREBASE_PROD_PROJECT_ID=investisizer
VITE_FIREBASE_PROD_STORAGE_BUCKET=investisizer.appspot.com
VITE_FIREBASE_PROD_MESSAGING_SENDER_ID=prod_sender_id
VITE_FIREBASE_PROD_APP_ID=prod_app_id
```

## Required Implementation

### 1. Firebase Configuration
Create `src/services/firebase.config.ts`:
```typescript
const firebaseConfig = {
  development: {
    apiKey: import.meta.env.VITE_FIREBASE_DEV_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_DEV_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_DEV_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_DEV_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_DEV_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_DEV_APP_ID
  },
  production: {
    apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID
  }
};

const config = firebaseConfig[import.meta.env.MODE as keyof typeof firebaseConfig] || firebaseConfig.development;
export default config;
```

### 2. Firebase Service Setup
Create `src/services/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import config from './firebase.config';

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence');
  }
});
```

### 3. Firestore Data Structure
```
users/{userId}/
├── profile/
│   ├── email: string
│   ├── displayName: string
│   ├── createdAt: timestamp
│   └── preferences: { theme: string }
└── portfolio/
    ├── investments/ (subcollection)
    │   └── {investmentId}: Investment object
    ├── properties/ (subcollection)
    │   └── {propertyId}: Property object
    └── settings/
        └── global: { inflationRate: string, displayOptions: object }
```

### 4. AuthStore Implementation
Create `src/features/core/stores/AuthStore.ts`:
```typescript
import { makeAutoObservable, runInAction } from 'mobx';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/services/firebase';

export class AuthStore {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initAuthListener();
  }

  get isSignedIn(): boolean {
    return this.user !== null;
  }

  private initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      runInAction(() => {
        this.user = user;
        this.isLoading = false;
      });
    });
  }

  signInWithGoogle = async () => {
    try {
      this.isLoading = true;
      this.error = null;
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  signInWithEmail = async (email: string, password: string) => {
    try {
      this.isLoading = true;
      this.error = null;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  signUpWithEmail = async (email: string, password: string) => {
    try {
      this.isLoading = true;
      this.error = null;
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  };
}
```

### 5. Firestore Service
Create `src/services/firestore.ts`:
```typescript
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Investment } from '@/features/investment/stores/Investment';
import type { Property } from '@/features/property/stores/Property';

export class FirestoreService {
  // Save entire portfolio to cloud
  static async savePortfolio(userId: string, investments: Investment[], properties: Property[], globalSettings: any) {
    const batch = writeBatch(db);

    // Save global settings
    const settingsRef = doc(db, `users/${userId}/portfolio/settings/global`);
    batch.set(settingsRef, globalSettings);

    // Save investments
    for (const investment of investments) {
      const investmentRef = doc(db, `users/${userId}/portfolio/investments/${investment.id}`);
      batch.set(investmentRef, investment.toJSON());
    }

    // Save properties
    for (const property of properties) {
      const propertyRef = doc(db, `users/${userId}/portfolio/properties/${property.id}`);
      batch.set(propertyRef, property.toJSON());
    }

    await batch.commit();
  }

  // Load entire portfolio from cloud
  static async loadPortfolio(userId: string) {
    const [settingsSnap, investmentsSnap, propertiesSnap] = await Promise.all([
      getDoc(doc(db, `users/${userId}/portfolio/settings/global`)),
      getDocs(collection(db, `users/${userId}/portfolio/investments`)),
      getDocs(collection(db, `users/${userId}/portfolio/properties`))
    ]);

    return {
      settings: settingsSnap.exists() ? settingsSnap.data() : null,
      investments: investmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      properties: propertiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }

  // Save user profile
  static async saveUserProfile(userId: string, profile: any) {
    const profileRef = doc(db, `users/${userId}/profile`);
    await setDoc(profileRef, profile, { merge: true });
  }
}
```

### 6. Enhanced PortfolioStore
Update `src/features/portfolio/stores/PortfolioStore.ts` to add cloud sync:
```typescript
// Add these properties and methods to existing PortfolioStore

isSaving = false;
lastSyncTime: Date | null = null;
syncError: string | null = null;

get shouldAutoSave(): boolean {
  return this.rootStore.authStore.isSignedIn && !this.isSaving;
}

// Auto-save reaction
private setupAutoSave() {
  reaction(
    () => this.serializedData,
    () => {
      if (this.shouldAutoSave) {
        this.saveToCloud();
      }
    },
    { delay: 2000 } // Debounce saves by 2 seconds
  );
}

// Save current portfolio to cloud
saveToCloud = async () => {
  if (!this.rootStore.authStore.user || this.isSaving) return;

  try {
    runInAction(() => {
      this.isSaving = true;
      this.syncError = null;
    });

    const globalSettings = {
      inflationRate: this.inflationRate,
      displayOptions: this.displayOptions
    };

    await FirestoreService.savePortfolio(
      this.rootStore.authStore.user.uid,
      this.investments,
      this.properties,
      globalSettings
    );

    runInAction(() => {
      this.lastSyncTime = new Date();
    });
  } catch (error: any) {
    runInAction(() => {
      this.syncError = error.message;
    });
  } finally {
    runInAction(() => {
      this.isSaving = false;
    });
  }
};

// Load portfolio from cloud
loadFromCloud = async () => {
  if (!this.rootStore.authStore.user) return;

  try {
    const data = await FirestoreService.loadPortfolio(this.rootStore.authStore.user.uid);
    
    if (data.settings) {
      runInAction(() => {
        this.inflationRate = data.settings.inflationRate || this.inflationRate;
        this.displayOptions = data.settings.displayOptions || this.displayOptions;
      });
    }

    // Reconstruct investments and properties from cloud data
    runInAction(() => {
      this.investments = data.investments.map(investmentData => 
        Investment.fromJSON(investmentData, this)
      );
      this.properties = data.properties.map(propertyData =>
        Property.fromJSON(propertyData, this)
      );
      this.lastSyncTime = new Date();
    });
  } catch (error: any) {
    runInAction(() => {
      this.syncError = error.message;
    });
  }
};

// Migrate local data to cloud on first sign-in
migrateLocalDataToCloud = async () => {
  const hasLocalData = this.investments.length > 0 || this.properties.length > 0;
  if (hasLocalData && this.rootStore.authStore.user) {
    await this.saveToCloud();
    // Clear localStorage after successful migration
    localStorage.removeItem('investisizer_portfolio');
  }
};
```

### 7. Auth UI Components
Create `src/features/core/components/AuthModal.tsx`:
```typescript
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/features/core/stores/hooks/useRootStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = observer(({ isOpen, onClose }) => {
  const { authStore } = useRootStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await authStore.signUpWithEmail(email, password);
    } else {
      await authStore.signInWithEmail(email, password);
    }
    if (authStore.isSignedIn) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    await authStore.signInWithGoogle();
    if (authStore.isSignedIn) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sign in to sync your portfolios across devices
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={authStore.isLoading}
          className="w-full bg-blue-500 text-white p-3 rounded-lg mb-4 hover:bg-blue-600 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <div className="text-center text-gray-500 mb-4">or</div>

        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            required
          />
          <button
            type="submit"
            disabled={authStore.isLoading}
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-blue-500 mt-3 hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>

        {authStore.error && (
          <p className="text-red-500 text-sm mt-3">{authStore.error}</p>
        )}
      </div>
    </div>
  );
});
```

### 8. Sync Status Component
Create `src/features/core/components/SyncStatus.tsx`:
```typescript
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/features/core/stores/hooks/useRootStore';

export const SyncStatus: React.FC = observer(() => {
  const { authStore, portfolioStore } = useRootStore();

  if (!authStore.isSignedIn) return null;

  if (portfolioStore.isSaving) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
        Saving...
      </div>
    );
  }

  if (portfolioStore.syncError) {
    return (
      <div className="text-sm text-red-500">
        Sync error
      </div>
    );
  }

  return (
    <div className="text-sm text-green-500">
      Saved to cloud
    </div>
  );
});
```

### 9. Header Integration
Update `src/features/core/components/Header.tsx` to include auth and sync:
```typescript
// Add to existing Header component
import { AuthModal } from './AuthModal';
import { SyncStatus } from './SyncStatus';

// Add state for auth modal
const [showAuthModal, setShowAuthModal] = useState(false);

// Add to header JSX
<div className="flex items-center space-x-4">
  <SyncStatus />
  {authStore.isSignedIn ? (
    <div className="flex items-center space-x-2">
      <span className="text-sm">{authStore.user?.displayName || authStore.user?.email}</span>
      <button
        onClick={() => authStore.signOut()}
        className="text-sm text-blue-500 hover:underline"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <button
      onClick={() => setShowAuthModal(true)}
      className="text-sm text-blue-500 hover:underline"
    >
      Sign In
    </button>
  )}
</div>

<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
```

### 10. RootStore Integration
Update `src/features/core/stores/RootStore.ts`:
```typescript
import { AuthStore } from './AuthStore';

export class RootStore {
  portfolioStore: PortfolioStore;
  themeStore: ThemeStore;
  authStore: AuthStore; // Add this

  constructor() {
    this.authStore = new AuthStore();
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore(this);

    // Set up cloud sync reactions
    this.setupCloudSync();
  }

  private setupCloudSync() {
    // Load from cloud when user signs in
    when(
      () => this.authStore.isSignedIn,
      () => this.portfolioStore.loadFromCloud()
    );

    // Migrate local data to cloud on first sign-in
    when(
      () => this.authStore.isSignedIn,
      () => this.portfolioStore.migrateLocalDataToCloud()
    );
  }
}
```

## Package Dependencies
Add these to package.json:
```json
{
  "dependencies": {
    "firebase": "^10.7.1"
  }
}
```

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Implementation Notes
1. **Error Handling**: Basic error states in UI, console logging for debugging
2. **Offline Support**: Firestore offline persistence enabled automatically
3. **Data Migration**: Existing localStorage data migrated to cloud on first sign-in
4. **Auto-Save**: 2-second debounced saving when signed in
5. **Simple Conflict Resolution**: Last-write-wins (no complex merge logic)
6. **Environment Separation**: Dev and prod Firebase projects for safe development

## Testing Checklist
- [ ] Sign in with Google works
- [ ] Sign in with email/password works
- [ ] Portfolio saves to cloud automatically
- [ ] Portfolio loads from cloud on sign-in
- [ ] Cross-device sync works (test in different browsers)
- [ ] Offline functionality maintained
- [ ] Local data migrates to cloud on first sign-in
- [ ] Sign out clears local state
- [ ] Environment switching works (dev vs prod)

This implementation provides essential cross-device synchronization while maintaining the existing reactive architecture and keeping complexity minimal.