import { PortfolioStore } from '@/features/portfolio/stores/PortfolioStore';
import { ThemeStore } from '../theme/ThemeStore';
import { TaxProfileStore } from '@/features/tax/stores/TaxProfileStore';

export class RootStore {
  themeStore: ThemeStore;
  portfolioStore: PortfolioStore;
  taxProfileStore: TaxProfileStore;

  constructor() {
    this.themeStore = new ThemeStore();
    this.portfolioStore = new PortfolioStore();
    this.taxProfileStore = new TaxProfileStore();
  }
}

export const rootStore = new RootStore();