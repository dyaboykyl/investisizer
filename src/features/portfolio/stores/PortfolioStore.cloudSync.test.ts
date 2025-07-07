import { PortfolioStore } from './PortfolioStore';
import { RootStore } from '@/features/core/stores/RootStore';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';
import { Investment } from '@/features/investment/stores/Investment';
import { Property } from '@/features/property/stores/Property';
import { createSimpleMockAuth } from '@/test-utils/mockAuthFactory';

// Mock the reaction function to control timing
jest.mock('mobx', () => {
  const originalMobx = jest.requireActual('mobx');
  return {
    ...originalMobx,
    reaction: jest.fn((fn, effect, options) => {
      // For testing, we'll call the effect immediately when the tracked function changes
      return originalMobx.reaction(fn, effect, { ...options, delay: 0 });
    })
  };
});

describe('PortfolioStore Cloud Sync', () => {
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
    it('should return correct shouldAutoSave state', async () => {
      expect(portfolioStore.shouldAutoSave).toBe(false);

      mockAuth.setCurrentUser({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for any pending auto-save operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Reset isSaving to false to test the computed property
      portfolioStore.isSaving = false;
      
      expect(portfolioStore.shouldAutoSave).toBe(true);

      portfolioStore.isSaving = true;
      expect(portfolioStore.shouldAutoSave).toBe(false);
    });

    it('should serialize data correctly', () => {
      portfolioStore.setInflationRate('3.0');
      portfolioStore.setYears('15');
      
      const serializedData = JSON.parse(portfolioStore.serializedData);
      expect(serializedData.inflationRate).toBe('3.0');
      expect(serializedData.years).toBe('15');
      expect(serializedData.assets).toBeInstanceOf(Array);
    });
  });

  describe('auth integration', () => {
    it('should enable auto-save when user signs in', async () => {
      expect(portfolioStore.shouldAutoSave).toBe(false);
      
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for any pending auto-save operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Reset isSaving to false to test the computed property
      portfolioStore.isSaving = false;
      
      expect(portfolioStore.shouldAutoSave).toBe(true);
      expect(rootStore.authStore.isSignedIn).toBe(true);
      expect(rootStore.authStore.uid).toBe('test-user-123');
    });

    it('should disable auto-save when user signs out', async () => {
      // Sign in first
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for any pending auto-save operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Reset isSaving to false to test the computed property
      portfolioStore.isSaving = false;
      
      expect(portfolioStore.shouldAutoSave).toBe(true);

      // Sign out
      mockAuth.setCurrentUser(null);
      
      expect(portfolioStore.shouldAutoSave).toBe(false);
      expect(rootStore.authStore.isSignedIn).toBe(false);
    });

    it('should prevent save when not signed in', async () => {
      mockAuth.setCurrentUser(null);

      portfolioStore.addInvestment('Test Investment');
      await portfolioStore.saveToCloud();

      expect(portfolioStore.isSaving).toBe(false);
      expect(portfolioStore.lastSyncTime).toBeNull();
      expect(portfolioStore.syncError).toBeNull();
    });

    it('should prevent save when already saving', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      portfolioStore.isSaving = true;

      const savePromise = portfolioStore.saveToCloud();
      expect(portfolioStore.isSaving).toBe(true);
      
      await savePromise;
      // Should not have changed the saving state or made any calls
      expect(portfolioStore.isSaving).toBe(true);
    });
  });

  describe('asset management', () => {
    it('should manage different asset types when signed in', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for any pending auto-save operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Reset isSaving to false to test the computed property
      portfolioStore.isSaving = false;
      
      // Verify auth state first
      expect(portfolioStore.shouldAutoSave).toBe(true);
      
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

    it('should prevent load when not signed in', async () => {
      mockAuth.setCurrentUser(null);

      await portfolioStore.loadFromCloud();

      expect(portfolioStore.syncError).toBeNull();
      // Should not have modified anything
    });
  });

  describe('error handling', () => {
    it('should clear sync error when clearSyncError is called', () => {
      portfolioStore.syncError = 'Test error';
      expect(portfolioStore.syncError).toBe('Test error');

      portfolioStore.clearSyncError();
      expect(portfolioStore.syncError).toBeNull();
    });

    it('should handle multiple concurrent save attempts', async () => {
      mockAuth.setCurrentUser({ uid: 'test-user-123', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for any pending auto-save operations to complete
      await new Promise(resolve => setTimeout(resolve, 10));
      
      portfolioStore.isSaving = true;

      // Multiple save attempts should not interfere
      const promise1 = portfolioStore.saveToCloud();
      const promise2 = portfolioStore.saveToCloud();

      await Promise.all([promise1, promise2]);
      expect(portfolioStore.isSaving).toBe(true); // Should remain true since we set it manually
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
});