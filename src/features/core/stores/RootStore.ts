import { when } from 'mobx';
import { PortfolioStore } from '@/features/portfolio/stores/PortfolioStore';
import { ThemeStore } from '../theme/ThemeStore';
import { AuthStore } from './AuthStore';

export class RootStore {
  authStore: AuthStore;
  themeStore: ThemeStore;
  portfolioStore: PortfolioStore;

  constructor(auth?: any) {
    this.authStore = new AuthStore(auth);
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore(this);

    // Set up cloud sync reactions
    this.setupCloudSync();
    
    // Set up global debug helpers
    this.setupDebugHelpers();
  }

  private setupCloudSync() {
    // Load from cloud when user signs in
    when(
      () => this.authStore.isSignedIn,
      () => {
        this.portfolioStore.loadFromCloud();
        this.portfolioStore.migrateLocalDataToCloud();
      }
    );
  }

  private setupDebugHelpers() {
    // Make debug functions available globally for troubleshooting
    if (typeof window !== 'undefined') {
      (window as any).debugApp = {
        rootStore: this,
        resetSyncState: () => this.portfolioStore.resetSyncState(),
        forceSave: () => this.portfolioStore.saveToCloud(),
        clearError: () => this.portfolioStore.clearSyncError(),
        logState: () => {
          console.log('App State:', {
            isSignedIn: this.authStore.isSignedIn,
            user: this.authStore.user,
            isSaving: this.portfolioStore.isSaving,
            syncError: this.portfolioStore.syncError,
            lastSyncTime: this.portfolioStore.lastSyncTime,
            hasAssets: this.portfolioStore.hasAssets
          });
        }
      };
      console.log('Debug helpers available: window.debugApp');
    }
  }
}

export const rootStore = new RootStore();