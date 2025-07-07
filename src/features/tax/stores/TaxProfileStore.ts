import { makeAutoObservable } from 'mobx';

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';

export interface TaxProfile {
  filingStatus: FilingStatus;
  annualIncome: string;
  state: string;
  enableStateTax: boolean;
  otherCapitalGains: string;
  carryoverLosses: string;
}

export class TaxProfileStore {
  profile: TaxProfile = {
    filingStatus: 'single',
    annualIncome: '',
    state: '',
    enableStateTax: true,
    otherCapitalGains: '',
    carryoverLosses: '',
  };

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  updateProfile(updates: Partial<TaxProfile>) {
    Object.assign(this.profile, updates);
    this.saveToStorage();
  }

  get parsedProfile() {
    return {
      filingStatus: this.profile.filingStatus,
      annualIncome: parseFloat(this.profile.annualIncome || '0') || 0,
      state: this.profile.state,
      enableStateTax: this.profile.enableStateTax,
      otherCapitalGains: parseFloat(this.profile.otherCapitalGains || '0') || 0,
      carryoverLosses: parseFloat(this.profile.carryoverLosses || '0') || 0,
    };
  }

  private saveToStorage() {
    try {
      localStorage.setItem('investisizer_tax_profile', JSON.stringify(this.profile));
    } catch (error) {
      console.warn('Failed to save tax profile to localStorage:', error);
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('investisizer_tax_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(this.profile, parsed);
      }
    } catch (error) {
      console.warn('Failed to load tax profile from localStorage:', error);
    }
  }

  resetProfile() {
    this.profile = {
      filingStatus: 'single',
      annualIncome: '',
      state: '',
      enableStateTax: true,
      otherCapitalGains: '',
      carryoverLosses: '',
    };
    this.saveToStorage();
  }
}