import { TaxProfileStore, type TaxProfile, type FilingStatus } from './TaxProfileStore';

describe('TaxProfileStore', () => {
  let store: TaxProfileStore;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    store = new TaxProfileStore();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with default profile values', () => {
      expect(store.profile.filingStatus).toBe('single');
      expect(store.profile.annualIncome).toBe('');
      expect(store.profile.state).toBe('');
      expect(store.profile.enableStateTax).toBe(true);
      expect(store.profile.otherCapitalGains).toBe('');
      expect(store.profile.carryoverLosses).toBe('');
    });

    it('should load from localStorage if data exists', () => {
      const savedProfile: TaxProfile = {
        filingStatus: 'married_joint',
        annualIncome: '150000',
        state: 'CA',
        enableStateTax: false,
        otherCapitalGains: '5000',
        carryoverLosses: '2000',
      };
      
      localStorage.setItem('investisizer_tax_profile', JSON.stringify(savedProfile));
      
      const newStore = new TaxProfileStore();
      expect(newStore.profile).toEqual(savedProfile);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('investisizer_tax_profile', 'invalid json');
      
      const newStore = new TaxProfileStore();
      expect(newStore.profile.filingStatus).toBe('single');
      expect(newStore.profile.annualIncome).toBe('');
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', () => {
      store.updateProfile({
        filingStatus: 'married_joint',
        annualIncome: '125000',
      });

      expect(store.profile.filingStatus).toBe('married_joint');
      expect(store.profile.annualIncome).toBe('125000');
      expect(store.profile.state).toBe(''); // unchanged
    });

    it('should save to localStorage after update', () => {
      store.updateProfile({
        filingStatus: 'head_of_household',
        state: 'TX',
      });

      const saved = localStorage.getItem('investisizer_tax_profile');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.filingStatus).toBe('head_of_household');
      expect(parsed.state).toBe('TX');
    });

    it('should handle partial updates', () => {
      store.updateProfile({ filingStatus: 'married_joint' });
      store.updateProfile({ annualIncome: '200000' });

      expect(store.profile.filingStatus).toBe('married_joint');
      expect(store.profile.annualIncome).toBe('200000');
      expect(store.profile.enableStateTax).toBe(true); // unchanged
    });
  });

  describe('parsedProfile', () => {
    it('should parse numeric fields correctly', () => {
      store.updateProfile({
        annualIncome: '150000',
        otherCapitalGains: '25000',
        carryoverLosses: '5000',
      });

      const parsed = store.parsedProfile;
      expect(parsed.annualIncome).toBe(150000);
      expect(parsed.otherCapitalGains).toBe(25000);
      expect(parsed.carryoverLosses).toBe(5000);
    });

    it('should handle empty string values', () => {
      store.updateProfile({
        annualIncome: '',
        otherCapitalGains: '',
        carryoverLosses: '',
      });

      const parsed = store.parsedProfile;
      expect(parsed.annualIncome).toBe(0);
      expect(parsed.otherCapitalGains).toBe(0);
      expect(parsed.carryoverLosses).toBe(0);
    });

    it('should handle invalid numeric values', () => {
      store.updateProfile({
        annualIncome: 'invalid',
        otherCapitalGains: 'abc',
        carryoverLosses: 'xyz',
      });

      const parsed = store.parsedProfile;
      expect(parsed.annualIncome).toBe(0);
      expect(parsed.otherCapitalGains).toBe(0);
      expect(parsed.carryoverLosses).toBe(0);
    });

    it('should preserve non-numeric fields', () => {
      store.updateProfile({
        filingStatus: 'married_separate',
        state: 'NY',
        enableStateTax: false,
      });

      const parsed = store.parsedProfile;
      expect(parsed.filingStatus).toBe('married_separate');
      expect(parsed.state).toBe('NY');
      expect(parsed.enableStateTax).toBe(false);
    });
  });

  describe('resetProfile', () => {
    it('should reset to default values', () => {
      store.updateProfile({
        filingStatus: 'married_joint',
        annualIncome: '200000',
        state: 'CA',
        enableStateTax: false,
      });

      store.resetProfile();

      expect(store.profile.filingStatus).toBe('single');
      expect(store.profile.annualIncome).toBe('');
      expect(store.profile.state).toBe('');
      expect(store.profile.enableStateTax).toBe(true);
    });

    it('should clear localStorage after reset', () => {
      store.updateProfile({ annualIncome: '100000' });
      expect(localStorage.getItem('investisizer_tax_profile')).toBeTruthy();

      store.resetProfile();

      const saved = localStorage.getItem('investisizer_tax_profile');
      const parsed = JSON.parse(saved!);
      expect(parsed.annualIncome).toBe('');
    });
  });

  describe('filing status validation', () => {
    const validStatuses: FilingStatus[] = ['single', 'married_joint', 'married_separate', 'head_of_household'];

    it.each(validStatuses)('should accept valid filing status: %s', (status) => {
      store.updateProfile({ filingStatus: status });
      expect(store.profile.filingStatus).toBe(status);
    });
  });

  describe('localStorage error handling', () => {
    it('should handle localStorage save errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => {
        store.updateProfile({ annualIncome: '100000' });
      }).not.toThrow();

      // Restore original function
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle localStorage load errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage access denied');
      });

      // Should not throw and should use default values
      expect(() => {
        const newStore = new TaxProfileStore();
        expect(newStore.profile.filingStatus).toBe('single');
      }).not.toThrow();

      // Restore original function
      Storage.prototype.getItem = originalGetItem;
    });
  });
});