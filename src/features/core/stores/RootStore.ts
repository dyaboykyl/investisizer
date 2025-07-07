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
}

export const rootStore = new RootStore();