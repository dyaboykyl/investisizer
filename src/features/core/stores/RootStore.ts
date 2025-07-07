import { PortfolioStore } from '@/features/portfolio/stores/PortfolioStore';
import { ThemeStore } from '../theme/ThemeStore';

export class RootStore {
  themeStore: ThemeStore;
  portfolioStore: PortfolioStore;

  constructor() {
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore();
  }
}

export const rootStore = new RootStore();