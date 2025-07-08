import { makeAutoObservable, runInAction } from 'mobx';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth as defaultAuth } from '@/services/firebase';

export class AuthStore {
  user: User | null = null;
  isLoading = true;
  error: string | null = null;
  private auth: any;

  constructor(auth: any = defaultAuth) {
    this.auth = auth;
    makeAutoObservable(this);
    this.initAuthListener();
  }

  // Check if Firebase is disabled
  private isFirebaseDisabled(): boolean {
    // Firebase is disabled if auth is a mock object with only basic properties
    return this.auth && typeof this.auth.currentUser !== 'undefined' && !this.auth.apiKey;
  }

  get isSignedIn(): boolean {
    return this.user !== null;
  }

  get displayName(): string | null {
    return this.user?.displayName || null;
  }

  get email(): string | null {
    return this.user?.email || null;
  }

  get uid(): string | null {
    return this.user?.uid || null;
  }

  private initAuthListener() {
    // Use injected auth methods if available (for mocks), otherwise use imports
    if (this.auth.onAuthStateChanged) {
      this.auth.onAuthStateChanged((user: any) => {
        runInAction(() => {
          this.user = user;
          this.isLoading = false;
        });
      });
    } else {
      onAuthStateChanged(this.auth, (user) => {
        runInAction(() => {
          this.user = user;
          this.isLoading = false;
        });
      });
    }
  }

  signInWithGoogle = async () => {
    // Check if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      runInAction(() => {
        this.error = 'Authentication is disabled in production mode';
        this.isLoading = false;
      });
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
      });
      
      
      const provider = new GoogleAuthProvider();
      if (this.auth.signInWithPopup) {
        await this.auth.signInWithPopup(provider);
      } else {
        await signInWithPopup(this.auth, provider);
      }
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
    // Check if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      runInAction(() => {
        this.error = 'Authentication is disabled in production mode';
        this.isLoading = false;
      });
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
      });
      
      if (this.auth.signInWithEmailAndPassword) {
        await this.auth.signInWithEmailAndPassword(email, password);
      } else {
        await signInWithEmailAndPassword(this.auth, email, password);
      }
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
    // Check if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      runInAction(() => {
        this.error = 'Authentication is disabled in production mode';
        this.isLoading = false;
      });
      return;
    }

    try {
      runInAction(() => {
        this.isLoading = true;
        this.error = null;
      });
      
      if (this.auth.createUserWithEmailAndPassword) {
        await this.auth.createUserWithEmailAndPassword(email, password);
      } else {
        await createUserWithEmailAndPassword(this.auth, email, password);
      }
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
    // Check if Firebase is disabled
    if (this.isFirebaseDisabled()) {
      runInAction(() => {
        this.error = 'Authentication is disabled in production mode';
      });
      return;
    }

    try {
      if (this.auth.signOut) {
        await this.auth.signOut();
      } else {
        await firebaseSignOut(this.auth);
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  };

  clearError = () => {
    runInAction(() => {
      this.error = null;
    });
  };
}