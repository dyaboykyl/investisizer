import { reaction } from 'mobx';
import { PortfolioStore } from '@/features/portfolio/stores/PortfolioStore';
import { ThemeStore } from '../theme/ThemeStore';
import { AuthStore } from './AuthStore';
import { StorageStore } from './StorageStore';

export class RootStore {
  authStore: AuthStore;
  themeStore: ThemeStore;
  storageStore: StorageStore;
  portfolioStore: PortfolioStore;

  constructor(auth?: any) {
    this.authStore = new AuthStore(auth);
    this.themeStore = new ThemeStore();
    this.storageStore = new StorageStore(this);
    this.portfolioStore = new PortfolioStore(this);

    // Set up data sync reactions
    this.setupDataSync();
    
    // Set up global debug helpers
    this.setupDebugHelpers();
  }

  private setupDataSync() {
    // React to auth state changes and load appropriate data
    reaction(
      () => ({
        isSignedIn: this.authStore.isSignedIn,
        userId: this.authStore.uid
      }),
      (authState, previousAuthState) => {
        console.log('Auth state changed:', { 
          from: previousAuthState, 
          to: authState 
        });
        
        // Load data when user signs in
        if (authState.isSignedIn && authState.userId) {
          console.log('User signed in, loading data for user:', authState.userId);
          this.portfolioStore.loadFromStorage();
        }
        
        // Note: We don't need to handle sign-out explicitly since PortfolioStore
        // will continue to work with local data when user is signed out
      },
      {
        name: 'AuthStateDataSync',
        fireImmediately: false // Don't fire on initial setup
      }
    );
  }

  private setupDebugHelpers() {
    // Make debug functions available globally for troubleshooting
    if (typeof window !== 'undefined') {
      (window as any).debugApp = {
        rootStore: this,
        resetStorageState: () => this.storageStore.resetState(),
        forceSave: () => this.portfolioStore.save(),
        clearError: () => this.storageStore.clearError(),
        logState: () => {
          console.log('App State:', {
            isSignedIn: this.authStore.isSignedIn,
            user: this.authStore.user,
            isSaving: this.storageStore.isSaving,
            saveError: this.storageStore.saveError,
            lastSaveTime: this.storageStore.lastSaveTime,
            hasAssets: this.portfolioStore.hasAssets
          });
        }
      };
      console.log('Debug helpers available: window.debugApp');
    }
  }
}

export const rootStore = new RootStore();