import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export class FirestoreService {
  // Check if Firebase is disabled
  private static isFirebaseDisabled(): boolean {
    return db === null;
  }

  // Save entire portfolio to cloud as a single JSON document
  static async savePortfolio(userId: string, portfolioData: any) {
    // Skip if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      console.log('Firebase disabled, skipping cloud save');
      return;
    }

    try {
      console.log('Attempting to save portfolio for user:', userId);
      console.log('Data size:', JSON.stringify(portfolioData).length, 'characters');
      
      // Use correct Firestore path: collection/document/collection/document
      const portfolioRef = doc(db, `users/${userId}/data/portfolio`);
      
      // Add timeout to prevent hanging operations
      const saveOperation = setDoc(portfolioRef, portfolioData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore operation timed out after 10 seconds')), 10000);
      });
      
      await Promise.race([saveOperation, timeoutPromise]);
      
      console.log('Portfolio saved successfully');
    } catch (error: any) {
      console.error('FirestoreService.savePortfolio failed:', error);
      
      // Add more context to common Firestore errors
      if (error.message === 'Firestore operation timed out after 10 seconds') {
        throw new Error('Save operation timed out. Check your internet connection and try again.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Check Firestore security rules');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore service unavailable. Check your internet connection.');
      } else if (error.code === 'quota-exceeded') {
        throw new Error('Firestore quota exceeded. Try again later.');
      } else if (error.code === 'invalid-argument') {
        throw new Error('Invalid data format. Check your portfolio data.');
      } else {
        throw new Error(`Firestore error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Load entire portfolio from cloud
  static async loadPortfolio(userId: string) {
    // Skip if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      console.log('Firebase disabled, skipping cloud load');
      return null;
    }

    try {
      console.log('Attempting to load portfolio for user:', userId);
      
      // Use correct Firestore path: collection/document/collection/document
      const portfolioRef = doc(db, `users/${userId}/data/portfolio`);
      
      // Add timeout to prevent hanging operations
      const loadOperation = getDoc(portfolioRef);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore operation timed out after 10 seconds')), 10000);
      });
      
      const portfolioSnap = await Promise.race([loadOperation, timeoutPromise]) as any;
      
      if (portfolioSnap.exists()) {
        console.log('Portfolio loaded successfully');
        return portfolioSnap.data();
      } else {
        console.log('No portfolio data found for user');
        return null;
      }
    } catch (error: any) {
      console.error('FirestoreService.loadPortfolio failed:', error);
      
      // Add more context to common Firestore errors
      if (error.message === 'Firestore operation timed out after 10 seconds') {
        throw new Error('Load operation timed out. Check your internet connection and try again.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied: Check Firestore security rules');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore service unavailable. Check your internet connection.');
      } else {
        throw new Error(`Failed to load portfolio: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // Save user profile
  static async saveUserProfile(userId: string, profile: any) {
    // Skip if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      console.log('Firebase disabled, skipping profile save');
      return;
    }

    const profileRef = doc(db, `users/${userId}/data/profile`);
    await setDoc(profileRef, profile, { merge: true });
  }

  // Load user profile
  static async loadUserProfile(userId: string) {
    // Skip if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      console.log('Firebase disabled, skipping profile load');
      return null;
    }

    const profileRef = doc(db, `users/${userId}/data/profile`);
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() ? profileSnap.data() : null;
  }
}