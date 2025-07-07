import '@testing-library/jest-dom';
import { FirebaseTestHelper } from './firebaseTestUtils';

// Mock Firebase modules
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

// Mock the Firebase config module
jest.mock('@/services/firebase.config', () => ({
  default: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: 'test-sender-id',
    appId: 'test-app-id'
  }
}));

// Mock the Firebase service module
jest.mock('@/services/firebase', () => ({
  auth: 'mock-auth',
  db: 'mock-firestore'
}));

// Global test setup
beforeEach(() => {
  FirebaseTestHelper.reset();
});

// Mock environment variables
process.env.VITE_FIREBASE_DEV_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_DEV_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_DEV_PROJECT_ID = 'test-project';