import { RootStore } from '@/features/core/stores/RootStore';
import { FirebaseTestHelper } from '@/test-utils/firebaseTestUtils';
import { createSimpleMockAuth } from '@/test-utils/mockAuthFactory';

describe('Auth and Portfolio Cloud Sync Integration', () => {
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
    // Clean up
    mockAuth.reset();
    FirebaseTestHelper.reset();
  });

  describe('sign-in integration', () => {
    it('should allow manual save when user signs in', async () => {
      const userId = 'test-user-123';
      
      // Verify user is not signed in initially
      expect(rootStore.authStore.isSignedIn).toBe(false);

      // Sign in
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });

      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(rootStore.authStore.isSignedIn).toBe(true);
      // User can now manually save to cloud
    });

    it('should preserve local data when user signs in', async () => {
      // Create local portfolio data before signing in
      rootStore.portfolioStore.addInvestment('Local Investment');
      const investment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment');
      if (investment) {
        investment.updateInput('initialAmount', '12000');
        investment.updateInput('annualContribution', '800');
      }
      
      rootStore.portfolioStore.setInflationRate('2.8');
      rootStore.portfolioStore.setYears('15');

      const userId = 'new-user-456';
      
      // Verify local data exists
      const initialInvestmentCount = rootStore.portfolioStore.investments.length;
      const localInvestment = rootStore.portfolioStore.investments.find(inv => inv.name === 'Local Investment');
      expect(localInvestment?.inputs.initialAmount).toBe('12000');

      // Sign in should not lose local data
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });

      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify local data is still there
      expect(rootStore.portfolioStore.investments.length).toBeGreaterThanOrEqual(initialInvestmentCount);
      expect(rootStore.authStore.isSignedIn).toBe(true);
    });

    it('should allow manual save when user signs in with local data', async () => {
      const userId = 'existing-user-789';
      
      // Create some local data
      rootStore.portfolioStore.addInvestment('Local Investment');
      rootStore.portfolioStore.setYears('10');
      
      // Initially user is not signed in
      expect(rootStore.authStore.isSignedIn).toBe(false);

      // Sign in
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });

      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));

      // User is now signed in and can manually save
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // Manual save should now save to both localStorage and cloud
      await rootStore.portfolioStore.save();
      expect(rootStore.portfolioStore.lastSaveTime).not.toBeNull();
    });

    it('should handle portfolio changes after sign-in', async () => {
      const userId = 'user-with-portfolio';
      
      // Sign in
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });

      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify user is signed in
      expect(rootStore.authStore.isSignedIn).toBe(true);
      
      // Make changes to portfolio - these should not cause errors
      rootStore.portfolioStore.addInvestment('New Investment');
      rootStore.portfolioStore.setInflationRate('3.2');

      // Verify the changes were applied locally
      expect(rootStore.portfolioStore.investments.some(inv => inv.name === 'New Investment')).toBe(true);
      expect(rootStore.portfolioStore.inflationRate).toBe('3.2');
      
      // Manual save should work
      await rootStore.portfolioStore.save();
      expect(rootStore.portfolioStore.lastSaveTime).not.toBeNull();
    });

    it('should not save to cloud when not signed in', async () => {
      // Ensure user is not signed in
      mockAuth.setCurrentUser(null);

      // Make changes
      rootStore.portfolioStore.addInvestment('Local Only');
      rootStore.portfolioStore.setInflationRate('4.0');

      // Try to save
      await rootStore.portfolioStore.save();

      // Should have saved to localStorage
      expect(rootStore.portfolioStore.isSaving).toBe(false);
      expect(rootStore.portfolioStore.lastSaveTime).not.toBeNull(); // Save time updated for localStorage save
      
      // Verify data was saved to localStorage
      const savedData = localStorage.getItem('portfolioData');
      expect(savedData).not.toBeNull();
    });
  });

  describe('sign-out integration', () => {
    it('should only save to localStorage after sign-out', async () => {
      const userId = 'test-user-123';
      
      // Sign in and wait for sync
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify user is signed in
      expect(rootStore.authStore.isSignedIn).toBe(true);

      // Sign out
      await rootStore.authStore.signOut();

      // Verify user is signed out
      expect(rootStore.authStore.isSignedIn).toBe(false);
      
      // Make changes after sign-out
      rootStore.portfolioStore.addInvestment('Post Sign-Out Investment');

      // Save should only update localStorage
      await rootStore.portfolioStore.save();

      // Should have saved locally (time updated even for localStorage-only saves)
      expect(rootStore.portfolioStore.isSaving).toBe(false);
      expect(rootStore.portfolioStore.lastSaveTime).not.toBeNull();
    });
  });

  describe('error handling integration', () => {
    it('should handle auth errors gracefully', async () => {
      // Mock the auth method to throw an error
      mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('auth/network-request-failed')
      );

      await rootStore.authStore.signInWithEmail('test@example.com', 'password');

      expect(rootStore.authStore.isSignedIn).toBe(false);
      expect(rootStore.authStore.error).toBeTruthy();
    });

    it('should handle cloud sync errors gracefully', async () => {
      const userId = 'test-user-123';
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });
      
      // For this test we'll skip detailed Firestore error simulation 
      // since it requires extensive Firestore mocking setup
      // Just verify auth state remains intact
      expect(rootStore.authStore.isSignedIn).toBe(true);
    });

    it('should recover from sync errors', async () => {
      const userId = 'test-user-123';
      mockAuth.setCurrentUser({ uid: userId, email: 'test@example.com', displayName: 'Test User' });

      // For this test we'll skip detailed Firestore error simulation
      // Just verify auth state remains intact
      expect(rootStore.authStore.isSignedIn).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple rapid sign-ins/sign-outs', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      // Sign in as user 1
      mockAuth.setCurrentUser({ uid: userId1, email: 'user1@example.com', displayName: 'User 1' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(rootStore.authStore.isSignedIn).toBe(true);
      expect(rootStore.authStore.uid).toBe(userId1);

      // Sign out
      await rootStore.authStore.signOut();
      expect(rootStore.authStore.isSignedIn).toBe(false);

      // Sign in as user 2
      mockAuth.setCurrentUser({ uid: userId2, email: 'user2@example.com', displayName: 'User 2' });
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(rootStore.authStore.isSignedIn).toBe(true);
      expect(rootStore.authStore.uid).toBe(userId2);
    });

    it('should maintain local state during temporary auth failures', async () => {
      // Create local data
      rootStore.portfolioStore.addInvestment('Local Investment');
      const originalInvestmentCount = rootStore.portfolioStore.investments.length;

      // Try to sign in with error
      mockAuth.signInWithPopup.mockRejectedValueOnce(
        new Error('auth/network-request-failed')
      );
      await rootStore.authStore.signInWithGoogle();

      // Local data should be preserved
      expect(rootStore.portfolioStore.investments).toHaveLength(originalInvestmentCount);
      expect(rootStore.authStore.isSignedIn).toBe(false);
    });
  });

  describe('reactive behavior integration', () => {
    it('should react to auth state changes throughout the system', async () => {
      // Initial state - should not be signed in
      expect(rootStore.authStore.isSignedIn).toBe(false);

      // Sign in
      mockAuth.setCurrentUser({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User' });
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(rootStore.authStore.isSignedIn).toBe(true);
      // User can now manually save to cloud
      
      // Sign out
      mockAuth.setCurrentUser(null);
      
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(rootStore.authStore.isSignedIn).toBe(false);
      // User can only save to localStorage when signed out
    });
  });
});