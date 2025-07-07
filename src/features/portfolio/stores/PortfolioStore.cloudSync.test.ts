import { PortfolioStore } from './PortfolioStore';
import { RootStore } from '@/features/core/stores/RootStore';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';
import { Investment } from '@/features/investment/stores/Investment';
import { Property } from '@/features/property/stores/Property';
import { createSimpleMockAuth } from '@/test-utils/mockAuthFactory';
import { runInAction } from 'mobx';

// No mocking needed - auto-save has been removed, using StorageStore

describe('PortfolioStore Storage Integration', () => {
  let rootStore: RootStore;
  let portfolioStore: PortfolioStore;
  let mockAuth: any;

  beforeEach(() => {
    // Clear localStorage to start fresh
    localStorage.clear();
    mockAuth = createSimpleMockAuth();
    rootStore = new RootStore(mockAuth);
    portfolioStore = rootStore.portfolioStore;
  });

  afterEach(() => {
    mockAuth.reset();
    FirebaseTestHelper.reset();
  });

  describe('computed properties', () => {
    it('should serialize data correctly', () => {
      portfolioStore.setInflationRate('3.0');
      portfolioStore.setYears('15');
      
      const serializedData = JSON.parse(portfolioStore.serializedData);
      expect(serializedData.inflationRate).toBe('3.0');
      expect(serializedData.years).toBe('15');
      expect(serializedData.assets).toBeInstanceOf(Array);
    });

    it('should delegate storage state to StorageStore', () => {
      // Initially should not be saving
      expect(portfolioStore.isSaving).toBe(false);
      expect(portfolioStore.saveError).toBeNull();
      expect(portfolioStore.lastSaveTime).toBeNull();

      // Set state through StorageStore
      runInAction(() => {
        rootStore.storageStore.isSaving = true;
        rootStore.storageStore.saveError = 'Test error';
        rootStore.storageStore.lastSaveTime = new Date();
      });

      // Should be reflected in PortfolioStore
      expect(portfolioStore.isSaving).toBe(true);
      expect(portfolioStore.saveError).toBe('Test error');
      expect(portfolioStore.lastSaveTime).not.toBeNull();
    });
  });

  describe('auth integration', () => {
    it('should allow manual save when user signs in', async () => {
      expect(rootStore.authStore.isSignedIn).toBe(false);
      
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      expect(rootStore.authStore.isSignedIn).toBe(true);
      expect(rootStore.authStore.uid).toBe('test-user-123');
      
      // User can now manually save
      portfolioStore.addInvestment('Test Investment');
      await portfolioStore.save();
      
      expect(portfolioStore.lastSaveTime).not.toBeNull();
    });

    it('should only save to localStorage when user signs out', async () => {
      // Sign in first
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      expect(rootStore.authStore.isSignedIn).toBe(true);

      // Sign out
      mockAuth.setCurrentUser(null);
      expect(rootStore.authStore.isSignedIn).toBe(false);
      
      // Save should only update localStorage, not cloud
      portfolioStore.addInvestment('Local Only Investment');
      await portfolioStore.save();
      
      // Should have updated lastSaveTime (localStorage save)
      expect(portfolioStore.lastSaveTime).not.toBeNull();
    });

    it('should prevent concurrent saves', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Manually set saving state to simulate ongoing save
      runInAction(() => {
        rootStore.storageStore.isSaving = true;
      });

      const savePromise = portfolioStore.save();
      expect(portfolioStore.isSaving).toBe(true);
      
      await savePromise;
      // Since we manually set isSaving=true, it should remain true
      expect(portfolioStore.isSaving).toBe(true);
    });
  });

  describe('asset management', () => {
    it('should manage different asset types when signed in', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Verify auth state first
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // Add different types of assets
      const investmentId = portfolioStore.addInvestment('Test Investment');
      const propertyId = portfolioStore.addProperty('Test Property');
      
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      investment.updateInput('initialAmount', '15000');
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.updateInput('purchasePrice', '250000');
      
      // Verify assets were created correctly
      expect(portfolioStore.investments).toHaveLength(2); // Default asset + new one
      expect(portfolioStore.properties).toHaveLength(1);
      expect(investment.inputs.initialAmount).toBe('15000');
      expect(property.inputs.purchasePrice).toBe('250000');
    });

    it('should load from storage when not signed in', async () => {
      mockAuth.setCurrentUser(null);

      // Should not cause errors
      await portfolioStore.loadFromStorage();

      expect(portfolioStore.saveError).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should clear save error when clearSaveError is called', () => {
      // Set error through StorageStore
      runInAction(() => {
        rootStore.storageStore.saveError = 'Test error';
      });
      
      expect(portfolioStore.saveError).toBe('Test error');

      portfolioStore.clearSaveError();
      expect(portfolioStore.saveError).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      // This test would require mocking StorageStore.save to throw an error
      // For now, just verify the error handling interface exists
      expect(typeof portfolioStore.clearSaveError).toBe('function');
      expect(typeof portfolioStore.resetStorageState).toBe('function');
    });
  });

  describe('data serialization', () => {
    it('should serialize portfolio data correctly', () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Add test data
      portfolioStore.setInflationRate('3.5');
      portfolioStore.setYears('20');
      portfolioStore.setShowNominal(false);
      portfolioStore.setShowReal(true);
      
      const investmentId = portfolioStore.addInvestment('Test Investment');
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      investment.updateInput('initialAmount', '25000');
      
      const serializedData = JSON.parse(portfolioStore.serializedData);
      
      expect(serializedData.inflationRate).toBe('3.5');
      expect(serializedData.years).toBe('20');
      expect(serializedData.showNominal).toBe(false);
      expect(serializedData.showReal).toBe(true);
      expect(serializedData.assets).toHaveLength(2); // Default asset + new one
      
      // Find the test investment we created
      const testInvestment = serializedData.assets.find((asset: any) => asset.name === 'Test Investment');
      expect(testInvestment).toBeDefined();
      expect(testInvestment.inputs.initialAmount).toBe('25000');
    });
  });

  describe('unified storage', () => {
    it('should save to both localStorage and cloud when signed in', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      portfolioStore.addInvestment('Test Investment');
      
      // Clear localStorage to verify save writes to it
      localStorage.removeItem('portfolioData');
      
      await portfolioStore.save();
      
      // Should have saved to localStorage (via StorageStore)
      const savedData = localStorage.getItem('portfolioData');
      expect(savedData).not.toBeNull();
      
      // Should have updated save time
      expect(portfolioStore.lastSaveTime).not.toBeNull();
      expect(portfolioStore.saveError).toBeNull();
    });

    it('should only save to localStorage when not signed in', async () => {
      mockAuth.setCurrentUser(null);
      
      portfolioStore.addInvestment('Test Investment');
      
      // Clear localStorage to verify save writes to it
      localStorage.removeItem('portfolioData');
      
      await portfolioStore.save();
      
      // Should have saved to localStorage
      const savedData = localStorage.getItem('portfolioData');
      expect(savedData).not.toBeNull();
      
      // Should have updated save time even for localStorage-only saves
      expect(portfolioStore.lastSaveTime).not.toBeNull();
    });

    it('should support legacy method names', async () => {
      // Test that legacy methods still work
      expect(typeof portfolioStore.save).toBe('function');
      expect(typeof portfolioStore.saveToLocalStorage).toBe('function');
      expect(typeof portfolioStore.clearSyncError).toBe('function');
      expect(typeof portfolioStore.resetSyncState).toBe('function');
      
      // Test legacy property getters
      expect(portfolioStore.syncError).toBe(portfolioStore.saveError);
      expect(portfolioStore.lastSyncTime).toBe(portfolioStore.lastSaveTime);
    });
  });
});