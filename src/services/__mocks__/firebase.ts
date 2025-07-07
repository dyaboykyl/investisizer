// Mock Firebase service for tests
import { mockAuth } from '@/__mocks__/firebase/auth';
import { mockFirestore } from '@/__mocks__/firebase/firestore';

export const auth = mockAuth;
export const db = mockFirestore;