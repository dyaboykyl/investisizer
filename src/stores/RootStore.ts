import { PortfolioStore } from './PortfolioStore';
import { ThemeStore } from './ThemeStore';

export class RootStore {
  themeStore: ThemeStore;
  portfolioStore: PortfolioStore;

  constructor() {
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore();
  }
}

export const rootStore = new RootStore();