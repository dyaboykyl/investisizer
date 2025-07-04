export interface BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  readonly type: 'investment' | 'property';

  // UI state
  showBalance: boolean;
  showContributions: boolean;
  showNetGain: boolean;
  showNominal: boolean;
  showReal: boolean;

  // Common computed properties
  readonly hasResults: boolean;
  readonly finalResult: any | null;

  // Actions
  setName(name: string): void;
  setEnabled(enabled: boolean): void;
  setShowBalance(value: boolean): void;
  setShowContributions(value: boolean): void;
  setShowNetGain(value: boolean): void;

  // Core methods
  calculateProjection(startingYear?: number): void;
  toJSON(): any;
}

export interface BaseCalculationResult {
  year: number;
  actualYear: number;
  balance: number;
  realBalance: number;
}