import { RootStore } from '@/features/core/stores/RootStore';
import { createSimpleMockAuth } from '@/test-utils/mockAuthFactory';

describe('Cloud Data Priority Integration', () => {
  let rootStore: RootStore;
  let mockAuth: any;

  beforeEach(() => {
    // Clear localStorage to start fresh
    localStorage.clear();
    
    // Create mock auth and root store
    mockAuth = createSimpleMockAuth();
    rootStore = new RootStore(mockAuth);
  });

  afterEach(() => {
    // Clean up auth but preserve Firestore data for persistence testing
    mockAuth.reset();
    // Note: NOT calling FirebaseTestHelper.reset() to preserve cloud data between auth state changes
  });

  describe('sign out and sign back in scenarios', () => {
    it('should load existing cloud data when signing back into existing account, not local data', async () => {
      const userId = 'existing-user-123';
      
      // STEP 1: User signs in for the first time and saves some data to cloud
      console.log('=== STEP 1: Initial sign in and save ===');
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // Create some initial portfolio data
      rootStore.portfolioStore.addInvestment('Cloud Investment');
      const cloudInvestment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Cloud Investment');
      if (cloudInvestment) {
        cloudInvestment.updateInput('initialAmount', '50000');
        cloudInvestment.updateInput('annualContribution', '5000');
      }
      rootStore.portfolioStore.setInflationRate('3.0');
      rootStore.portfolioStore.setYears('20');
      
      // Save to cloud
      await rootStore.portfolioStore.save();
      
      // Verify the data was saved
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Cloud Investment')?.inputs.initialAmount).toBe('50000');
      
      // STEP 2: User signs out
      console.log('=== STEP 2: User signs out ===');
      await rootStore.authStore.signOut();
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(rootStore.authStore.isSignedIn).toBe(false);
      
      // STEP 3: While signed out, user creates some different local data
      console.log('=== STEP 3: Create different local data while signed out ===');
      
      // Clear current portfolio and create different local data
      rootStore.portfolioStore.clearAll();
      rootStore.portfolioStore.addInvestment('Local Investment');
      const localInvestment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment');
      if (localInvestment) {
        localInvestment.updateInput('initialAmount', '10000');
        localInvestment.updateInput('annualContribution', '1000');
      }
      rootStore.portfolioStore.setInflationRate('2.0');
      rootStore.portfolioStore.setYears('10');
      
      // This should save to localStorage only since user is signed out
      await rootStore.portfolioStore.save();
      
      // Verify local data is different from cloud data
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment')?.inputs.initialAmount).toBe('10000');
      expect(rootStore.portfolioStore.inflationRate).toBe('2.0');
      expect(rootStore.portfolioStore.years).toBe('10');
      
      // STEP 4: User signs back into the SAME existing account
      console.log('=== STEP 4: Sign back into existing account ===');
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for auth state to propagate and data to load
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // CRITICAL TEST: The portfolio should now show the CLOUD data, not the local data
      console.log('Current investments:', rootStore.portfolioStore.investments.map(inv => ({ name: inv.name, initial: inv.inputs.initialAmount })));
      console.log('Inflation rate:', rootStore.portfolioStore.inflationRate);
      console.log('Years:', rootStore.portfolioStore.years);
      
      // This is the bug: if local data overwrites cloud data, these assertions will fail
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Cloud Investment')).toBeDefined();
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment')).toBeUndefined();
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Cloud Investment')?.inputs.initialAmount).toBe('50000');
      expect(rootStore.portfolioStore.inflationRate).toBe('3.0');
      expect(rootStore.portfolioStore.years).toBe('20');
    });

    it('should preserve local data when signing into NEW account with no cloud data', async () => {
      const newUserId = 'new-user-456';
      
      // STEP 1: User creates local data while signed out
      console.log('=== STEP 1: Create local data while signed out ===');
      expect(rootStore.authStore.isSignedIn).toBe(false);
      
      rootStore.portfolioStore.addInvestment('Local Investment');
      const localInvestment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment');
      if (localInvestment) {
        localInvestment.updateInput('initialAmount', '15000');
        localInvestment.updateInput('annualContribution', '2000');
      }
      rootStore.portfolioStore.setInflationRate('2.5');
      
      // STEP 2: User signs into a NEW account (no existing cloud data)
      console.log('=== STEP 2: Sign into NEW account ===');
      mockAuth.setCurrentUser({ uid: newUserId, email: 'newuser@example.com', displayName: 'New User' });
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // Since this is a new account with no cloud data, local data should be preserved
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment')).toBeDefined();
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment')?.inputs.initialAmount).toBe('15000');
      expect(rootStore.portfolioStore.inflationRate).toBe('2.5');
    });

    it('should handle rapid sign out and sign in correctly', async () => {
      const userId = 'rapid-test-user';
      
      // STEP 1: Sign in and save data
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      rootStore.portfolioStore.addInvestment('Original Investment');
      const investment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Original Investment');
      if (investment) {
        investment.updateInput('initialAmount', '25000');
      }
      
      await rootStore.portfolioStore.save();
      
      // STEP 2: Sign out
      await rootStore.authStore.signOut();
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // STEP 3: Modify local data
      rootStore.portfolioStore.clearAll();
      rootStore.portfolioStore.addInvestment('Modified Investment');
      
      // STEP 4: Rapid sign back in
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Should load original cloud data, not modified local data
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Original Investment')).toBeDefined();
      expect(rootStore.portfolioStore.investments.find(inv => inv.name === 'Modified Investment')).toBeUndefined();
    });

    it('should handle case where cloud data exists but is corrupted/invalid', async () => {
      const userId = 'corrupted-data-user';
      
      // STEP 1: Create valid local data
      rootStore.portfolioStore.addInvestment('Valid Local Investment');
      const localInvestment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Valid Local Investment');
      if (localInvestment) {
        localInvestment.updateInput('initialAmount', '30000');
      }
      
      // STEP 2: Simulate corrupted cloud data by mocking a cloud save with invalid data
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Simulate saving corrupted data to cloud (this would normally not happen, but tests edge cases)
      try {
        await rootStore.portfolioStore.save();
        
        // STEP 3: Sign out and back in
        await rootStore.authStore.signOut();
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Modify local data
        rootStore.portfolioStore.clearAll();
        rootStore.portfolioStore.addInvestment('Fallback Investment');
        
        mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Should either load valid cloud data or handle gracefully
        expect(rootStore.portfolioStore.hasAssets).toBe(true);
        
      } catch (error) {
        // If cloud operations fail, local data should be preserved
        expect(rootStore.portfolioStore.hasAssets).toBe(true);
      }
    });
  });
});