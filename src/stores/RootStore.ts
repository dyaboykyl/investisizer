import { InvestmentStore } from './InvestmentStore';
import { ThemeStore } from './ThemeStore';
import { PortfolioStore } from './PortfolioStore';

export class RootStore {
  investmentStore: InvestmentStore;
  themeStore: ThemeStore;
  portfolioStore: PortfolioStore;

  constructor() {
    this.investmentStore = new InvestmentStore();
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore();
  }
}

export const rootStore = new RootStore();