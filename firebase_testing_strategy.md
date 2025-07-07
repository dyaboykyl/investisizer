# Firebase Testing Strategy for Jest

## Overview
Create comprehensive Jest testing strategy using Firebase mocks and in-memory implementations that provide realistic behavior without actual Firebase dependencies. Focus on clean, maintainable test code that validates business logic.

## Testing Architecture

### 1. Firebase Mocks Structure
```typescript
// src/__mocks__/firebase/
├── auth.ts          // Mock Firebase Auth
├── firestore.ts     // Mock Firestore
├── app.ts           // Mock Firebase App
└── index.ts         // Export all mocks
```

### 2. Mock Implementation Strategy
- **Realistic Behavior**: Mocks simulate actual Firebase behavior patterns
- **State Management**: In-memory state that persists across test operations
- **Async Patterns**: Proper async/await simulation
- **Error Simulation**: Ability to trigger various error scenarios
- **Clean Interfaces**: Same API as real Firebase for seamless testing

## Mock Implementations

### Firebase Auth Mock
Create `src/__mocks__/firebase/auth.ts`:
```typescript
export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class MockFirebaseAuth {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];
  
  // Simulate auth state persistence
  private static instance: MockFirebaseAuth;
  
  static getInstance(): MockFirebaseAuth {
    if (!MockFirebaseAuth.instance) {
      MockFirebaseAuth.instance = new MockFirebaseAuth();
    }
    return MockFirebaseAuth.instance;
  }

  get user() {
    return this.currentUser;
  }

  // Mock sign in methods
  async signInWithPopup(provider: any): Promise<{ user: MockUser }> {
    const mockUser: MockUser = {
      uid: `mock-user-${Date.now()}`,
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    this.setCurrentUser(mockUser);
    return { user: mockUser };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: MockUser }> {
    // Simulate auth validation
    if (email === 'invalid@test.com') {
      throw new Error('auth/user-not-found');
    }
    
    const mockUser: MockUser = {
      uid: `mock-user-${email.replace('@', '-').replace('.', '-')}`,
      email,
      displayName: null
    };
    
    this.setCurrentUser(mockUser);
    return { user: mockUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: MockUser }> {
    if (email === 'existing@test.com') {
      throw new Error('auth/email-already-in-use');
    }
    
    return this.signInWithEmailAndPassword(email, password);
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null);
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setCurrentUser(user: MockUser | null) {
    this.currentUser = user;
    this.listeners.forEach(listener => listener(user));
  }

  // Test utilities
  mockSignIn(user: Partial<MockUser> = {}) {
    const mockUser: MockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      ...user
    };
    this.setCurrentUser(mockUser);
  }

  mockSignOut() {
    this.setCurrentUser(null);
  }

  reset() {
    this.currentUser = null;
    this.listeners = [];
  }
}

export const mockAuth = MockFirebaseAuth.getInstance();
export const GoogleAuthProvider = jest.fn();
export const signInWithPopup = jest.fn().mockImplementation((auth, provider) => 
  mockAuth.signInWithPopup(provider)
);
export const signInWithEmailAndPassword = jest.fn().mockImplementation((auth, email, password) =>
  mockAuth.signInWithEmailAndPassword(email, password)
);
export const createUserWithEmailAndPassword = jest.fn().mockImplementation((auth, email, password) =>
  mockAuth.createUserWithEmailAndPassword(email, password)
);
export const signOut = jest.fn().mockImplementation(() => mockAuth.signOut());
export const onAuthStateChanged = jest.fn().mockImplementation((auth, callback) =>
  mockAuth.onAuthStateChanged(callback)
);
```

### Firestore Mock
Create `src/__mocks__/firebase/firestore.ts`:
```typescript
interface MockDocument {
  id: string;
  data: any;
  exists: boolean;
}

interface MockCollection {
  [docId: string]: MockDocument;
}

class MockFirestore {
  private collections: { [path: string]: MockCollection } = {};
  private static instance: MockFirestore;

  static getInstance(): MockFirestore {
    if (!MockFirestore.instance) {
      MockFirestore.instance = new MockFirestore();
    }
    return MockFirestore.instance;
  }

  // Document operations
  async getDoc(docRef: any): Promise<MockDocument> {
    const doc = this.collections[docRef.path]?.[docRef.id];
    return doc || { id: docRef.id, data: null, exists: false };
  }

  async setDoc(docRef: any, data: any, options?: any): Promise<void> {
    if (!this.collections[docRef.collectionPath]) {
      this.collections[docRef.collectionPath] = {};
    }
    
    const existingData = this.collections[docRef.collectionPath][docRef.id]?.data || {};
    const newData = options?.merge ? { ...existingData, ...data } : data;
    
    this.collections[docRef.collectionPath][docRef.id] = {
      id: docRef.id,
      data: newData,
      exists: true
    };
  }

  async deleteDoc(docRef: any): Promise<void> {
    if (this.collections[docRef.collectionPath]) {
      delete this.collections[docRef.collectionPath][docRef.id];
    }
  }

  // Collection operations
  async getDocs(collectionRef: any): Promise<{ docs: MockDocument[] }> {
    const collection = this.collections[collectionRef.path] || {};
    return {
      docs: Object.values(collection).filter(doc => doc.exists)
    };
  }

  // Batch operations
  createBatch(): MockBatch {
    return new MockBatch(this);
  }

  // Test utilities
  setMockData(path: string, docId: string, data: any) {
    if (!this.collections[path]) {
      this.collections[path] = {};
    }
    this.collections[path][docId] = {
      id: docId,
      data,
      exists: true
    };
  }

  getMockData(path: string, docId: string) {
    return this.collections[path]?.[docId]?.data;
  }

  reset() {
    this.collections = {};
  }

  getAllMockData() {
    return { ...this.collections };
  }
}

class MockBatch {
  private operations: Array<{ type: string; docRef: any; data?: any }> = [];

  constructor(private firestore: MockFirestore) {}

  set(docRef: any, data: any): MockBatch {
    this.operations.push({ type: 'set', docRef, data });
    return this;
  }

  delete(docRef: any): MockBatch {
    this.operations.push({ type: 'delete', docRef });
    return this;
  }

  async commit(): Promise<void> {
    for (const op of this.operations) {
      if (op.type === 'set') {
        await this.firestore.setDoc(op.docRef, op.data);
      } else if (op.type === 'delete') {
        await this.firestore.deleteDoc(op.docRef);
      }
    }
  }
}

export const mockFirestore = MockFirestore.getInstance();

// Mock functions
export const doc = jest.fn((db, path) => {
  const parts = path.split('/');
  const id = parts[parts.length - 1];
  const collectionPath = parts.slice(0, -1).join('/');
  return { id, path, collectionPath };
});

export const collection = jest.fn((db, path) => ({ path }));

export const getDoc = jest.fn().mockImplementation((docRef) => mockFirestore.getDoc(docRef));
export const setDoc = jest.fn().mockImplementation((docRef, data, options) => 
  mockFirestore.setDoc(docRef, data, options)
);
export const deleteDoc = jest.fn().mockImplementation((docRef) => mockFirestore.deleteDoc(docRef));
export const getDocs = jest.fn().mockImplementation((collectionRef) => 
  mockFirestore.getDocs(collectionRef)
);
export const writeBatch = jest.fn().mockImplementation(() => mockFirestore.createBatch());
export const enableIndexedDbPersistence = jest.fn().mockResolvedValue(undefined);
```

### Firebase App Mock
Create `src/__mocks__/firebase/app.ts`:
```typescript
export const initializeApp = jest.fn().mockReturnValue({
  name: 'mock-app',
  options: {}
});

export const getAuth = jest.fn().mockReturnValue('mock-auth');
export const getFirestore = jest.fn().mockReturnValue('mock-firestore');
```

## Test Utilities

### Firebase Test Helper
Create `src/test-utils/firebaseTestUtils.ts`:
```typescript
import { mockAuth } from '@/__mocks__/firebase/auth';
import { mockFirestore } from '@/__mocks__/firebase/firestore';

export class FirebaseTestHelper {
  static reset() {
    mockAuth.reset();
    mockFirestore.reset();
    jest.clearAllMocks();
  }

  static mockSignedInUser(userData: Partial<any> = {}) {
    mockAuth.mockSignIn({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      ...userData
    });
  }

  static mockSignedOutUser() {
    mockAuth.mockSignOut();
  }

  static setMockPortfolioData(userId: string, data: {
    investments?: any[];
    properties?: any[];
    settings?: any;
  }) {
    // Mock settings
    if (data.settings) {
      mockFirestore.setMockData(
        `users/${userId}/portfolio/settings`,
        'global',
        data.settings
      );
    }

    // Mock investments
    if (data.investments) {
      data.investments.forEach(investment => {
        mockFirestore.setMockData(
          `users/${userId}/portfolio/investments`,
          investment.id,
          investment
        );
      });
    }

    // Mock properties
    if (data.properties) {
      data.properties.forEach(property => {
        mockFirestore.setMockData(
          `users/${userId}/portfolio/properties`,
          property.id,
          property
        );
      });
    }
  }

  static getMockPortfolioData(userId: string) {
    return {
      settings: mockFirestore.getMockData(`users/${userId}/portfolio/settings`, 'global'),
      investments: Object.values(
        mockFirestore.getAllMockData()[`users/${userId}/portfolio/investments`] || {}
      ).map((doc: any) => doc.data),
      properties: Object.values(
        mockFirestore.getAllMockData()[`users/${userId}/portfolio/properties`] || {}
      ).map((doc: any) => doc.data)
    };
  }

  static simulateNetworkError() {
    jest.spyOn(mockFirestore, 'setDoc').mockRejectedValueOnce(
      new Error('Firebase: Network request failed')
    );
  }

  static simulateAuthError(errorCode: string) {
    const error = new Error(`Firebase Auth Error: ${errorCode}`);
    error.name = errorCode;
    jest.spyOn(mockAuth, 'signInWithEmailAndPassword').mockRejectedValueOnce(error);
  }
}
```

### Enhanced Test Setup
Create `src/test-utils/testSetup.ts`:
```typescript
import '@testing-library/jest-dom';
import { FirebaseTestHelper } from './firebaseTestUtils';

// Mock Firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Global test setup
beforeEach(() => {
  FirebaseTestHelper.reset();
});

// Mock environment variables
process.env.VITE_FIREBASE_DEV_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_DEV_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_DEV_PROJECT_ID = 'test-project';
```

## Test Examples

### AuthStore Tests
Create `src/features/core/stores/AuthStore.test.ts`:
```typescript
import { AuthStore } from './AuthStore';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';

describe('AuthStore', () => {
  let authStore: AuthStore;

  beforeEach(() => {
    authStore = new AuthStore();
  });

  describe('sign in with Google', () => {
    it('should sign in successfully', async () => {
      await authStore.signInWithGoogle();

      expect(authStore.isSignedIn).toBe(true);
      expect(authStore.user?.email).toBe('test@example.com');
      expect(authStore.error).toBeNull();
    });

    it('should handle authentication errors', async () => {
      FirebaseTestHelper.simulateAuthError('auth/popup-closed-by-user');

      await authStore.signInWithGoogle();

      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.error).toBeTruthy();
    });
  });

  describe('email authentication', () => {
    it('should sign in with valid credentials', async () => {
      await authStore.signInWithEmail('test@example.com', 'password123');

      expect(authStore.isSignedIn).toBe(true);
      expect(authStore.user?.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      await authStore.signInWithEmail('invalid@test.com', 'wrongpassword');

      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.error).toContain('user-not-found');
    });
  });

  describe('sign out', () => {
    it('should sign out successfully', async () => {
      // First sign in
      await authStore.signInWithGoogle();
      expect(authStore.isSignedIn).toBe(true);

      // Then sign out
      await authStore.signOut();
      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.user).toBeNull();
    });
  });
});
```

### PortfolioStore Cloud Sync Tests
Create `src/features/portfolio/stores/PortfolioStore.cloudSync.test.ts`:
```typescript
import { PortfolioStore } from './PortfolioStore';
import { RootStore } from '@/features/core/stores/RootStore';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';
import { Investment } from '@/features/investment/stores/Investment';

describe('PortfolioStore Cloud Sync', () => {
  let rootStore: RootStore;
  let portfolioStore: PortfolioStore;

  beforeEach(() => {
    rootStore = new RootStore();
    portfolioStore = rootStore.portfolioStore;
  });

  describe('saveToCloud', () => {
    it('should save portfolio data when signed in', async () => {
      FirebaseTestHelper.mockSignedInUser({ uid: 'test-user-123' });
      
      // Add test data
      portfolioStore.addInvestment();
      const investment = portfolioStore.investments[0];
      investment.updateInput('name', 'Test Investment');
      investment.updateInput('initialAmount', '10000');

      await portfolioStore.saveToCloud();

      const savedData = FirebaseTestHelper.getMockPortfolioData('test-user-123');
      expect(savedData.investments).toHaveLength(1);
      expect(savedData.investments[0].inputs.name).toBe('Test Investment');
      expect(savedData.investments[0].inputs.initialAmount).toBe('10000');
    });

    it('should not save when not signed in', async () => {
      FirebaseTestHelper.mockSignedOutUser();

      portfolioStore.addInvestment();
      await portfolioStore.saveToCloud();

      expect(portfolioStore.isSaving).toBe(false);
      expect(portfolioStore.syncError).toBeNull();
    });

    it('should handle save errors gracefully', async () => {
      FirebaseTestHelper.mockSignedInUser({ uid: 'test-user-123' });
      FirebaseTestHelper.simulateNetworkError();

      portfolioStore.addInvestment();
      await portfolioStore.saveToCloud();

      expect(portfolioStore.syncError).toBeTruthy();
      expect(portfolioStore.isSaving).toBe(false);
    });
  });

  describe('loadFromCloud', () => {
    it('should load portfolio data from cloud', async () => {
      const userId = 'test-user-123';
      FirebaseTestHelper.mockSignedInUser({ uid: userId });

      // Setup mock data
      FirebaseTestHelper.setMockPortfolioData(userId, {
        investments: [{
          id: 'investment-1',
          inputs: {
            name: 'Cloud Investment',
            initialAmount: '25000',
            rateOfReturn: '8'
          }
        }],
        settings: {
          inflationRate: '3.5',
          displayOptions: { showRealValues: true }
        }
      });

      await portfolioStore.loadFromCloud();

      expect(portfolioStore.investments).toHaveLength(1);
      expect(portfolioStore.investments[0].inputs.name).toBe('Cloud Investment');
      expect(portfolioStore.investments[0].inputs.initialAmount).toBe('25000');
      expect(portfolioStore.inflationRate).toBe('3.5');
    });

    it('should handle missing cloud data gracefully', async () => {
      FirebaseTestHelper.mockSignedInUser({ uid: 'new-user-456' });

      await portfolioStore.loadFromCloud();

      expect(portfolioStore.investments).toHaveLength(0);
      expect(portfolioStore.properties).toHaveLength(0);
      expect(portfolioStore.syncError).toBeNull();
    });
  });

  describe('auto-save functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-save after changes when signed in', async () => {
      FirebaseTestHelper.mockSignedInUser({ uid: 'test-user-123' });
      
      const saveToCloudSpy = jest.spyOn(portfolioStore, 'saveToCloud');
      
      // Make a change
      portfolioStore.addInvestment();
      portfolioStore.investments[0].updateInput('name', 'Auto Save Test');

      // Wait for debounced save (2 seconds)
      jest.advanceTimersByTime(2100);
      await Promise.resolve(); // Allow async operations to complete

      expect(saveToCloudSpy).toHaveBeenCalled();
    });

    it('should not auto-save when not signed in', async () => {
      FirebaseTestHelper.mockSignedOutUser();
      
      const saveToCloudSpy = jest.spyOn(portfolioStore, 'saveToCloud');
      
      portfolioStore.addInvestment();
      jest.advanceTimersByTime(2100);

      expect(saveToCloudSpy).not.toHaveBeenCalled();
    });
  });
});
```

### Integration Tests
Create `src/features/core/integration/authSync.integration.test.ts`:
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '@/App';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';

describe('Auth & Sync Integration', () => {
  it('should migrate local data to cloud on first sign-in', async () => {
    // Setup: Create local portfolio data
    const localData = {
      investments: [{
        id: 'local-investment',
        inputs: { name: 'Local Investment', initialAmount: '15000' }
      }]
    };
    localStorage.setItem('investisizer_portfolio', JSON.stringify(localData));

    render(<App />);

    // Sign in
    fireEvent.click(screen.getByText('Sign In'));
    fireEvent.click(screen.getByText('Continue with Google'));

    await waitFor(() => {
      expect(screen.getByText('Saved to cloud')).toBeInTheDocument();
    });

    // Verify migration
    const cloudData = FirebaseTestHelper.getMockPortfolioData('test@example.com');
    expect(cloudData.investments).toHaveLength(1);
    expect(cloudData.investments[0].inputs.name).toBe('Local Investment');
  });

  it('should sync changes across components', async () => {
    FirebaseTestHelper.mockSignedInUser({ uid: 'test-user' });
    
    render(<App />);

    // Add investment
    fireEvent.click(screen.getByText('Add Investment'));
    
    // Make changes
    fireEvent.change(screen.getByLabelText('Investment Name'), {
      target: { value: 'Sync Test Investment' }
    });

    // Verify auto-save indicator appears
    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Saved to cloud')).toBeInTheDocument();
    });
  });
});
```

## Jest Configuration

### Update jest.config.js
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/testSetup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^firebase/app$': '<rootDir>/src/__mocks__/firebase/app.ts',
    '^firebase/auth$': '<rootDir>/src/__mocks__/firebase/auth.ts',
    '^firebase/firestore$': '<rootDir>/src/__mocks__/firebase/firestore.ts'
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/__mocks__/**'
  ]
};
```

## Package Dependencies
Add these to package.json devDependencies:
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

## Testing Commands
Add these scripts to package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:firebase": "jest --testPathPattern='firebase|auth|sync'"
  }
}
```

## Benefits of This Testing Strategy

1. **Realistic Behavior**: Mocks simulate actual Firebase patterns
2. **Clean Test Code**: Helper utilities eliminate boilerplate
3. **Comprehensive Coverage**: Tests auth, sync, error scenarios, and integration
4. **Fast Execution**: No actual Firebase calls, all in-memory
5. **Isolation**: Each test starts with clean state
6. **Error Simulation**: Easy to test error conditions
7. **Maintainable**: Centralized mock logic, easy to update

## Implementation Notes

1. **Mock Persistence**: Mocks maintain state within test suites but reset between tests
2. **Error Handling**: Easy simulation of network errors, auth failures, and permission issues
3. **Async Testing**: Proper handling of async Firebase operations
4. **Integration Testing**: Full app testing with realistic Firebase mock behavior
5. **Performance**: Fast test execution without external dependencies

This testing approach ensures robust validation of Firebase integration while keeping tests fast, reliable, and easy to maintain.