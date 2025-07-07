import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export class FirestoreService {
  // Save entire portfolio to cloud as a single JSON document
  static async savePortfolio(userId: string, portfolioData: any) {
    const portfolioRef = doc(db, `users/${userId}/portfolio`);
    await setDoc(portfolioRef, portfolioData);
  }

  // Load entire portfolio from cloud
  static async loadPortfolio(userId: string) {
    const portfolioRef = doc(db, `users/${userId}/portfolio`);
    const portfolioSnap = await getDoc(portfolioRef);
    return portfolioSnap.exists() ? portfolioSnap.data() : null;
  }

  // Save user profile
  static async saveUserProfile(userId: string, profile: any) {
    const profileRef = doc(db, `users/${userId}/profile`);
    await setDoc(profileRef, profile, { merge: true });
  }

  // Load user profile
  static async loadUserProfile(userId: string) {
    const profileRef = doc(db, `users/${userId}/profile`);
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() ? profileSnap.data() : null;
  }
}