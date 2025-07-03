import { InvestmentStore } from './InvestmentStore';
import { ThemeStore } from './ThemeStore';

export class RootStore {
  investmentStore: InvestmentStore;
  themeStore: ThemeStore;

  constructor() {
    this.investmentStore = new InvestmentStore();
    this.themeStore = new ThemeStore();
  }
}

export const rootStore = new RootStore();