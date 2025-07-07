import { AuthStore } from './AuthStore';
import { createSimpleMockAuth } from '@/test-utils/mockAuthFactory';


describe('AuthStore', () => {
  let authStore: AuthStore;
  let simpleMockAuth: any;

  beforeEach(() => {
    simpleMockAuth = createSimpleMockAuth();
    authStore = new AuthStore(simpleMockAuth);
  });

  afterEach(() => {
    simpleMockAuth.reset();
  });

  describe('initialization', () => {
    it('should initialize with correct state', () => {
      // In tests, auth state is synchronous so loading is immediately false
      expect(authStore.isLoading).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.error).toBeNull();
    });

    it('should set loading to false after auth state listener fires', () => {
      // Auth state change should be synchronous in tests
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('computed properties', () => {
    it('should return correct isSignedIn state', () => {
      // Auth state should be synchronous in tests
      expect(authStore.isSignedIn).toBe(false);
      
      simpleMockAuth.setCurrentUser({
        uid: 'test-user-123',
        email: 'test@example.com', 
        displayName: 'Test User'
      });
      
      expect(authStore.isSignedIn).toBe(true);
    });

    it('should return correct displayName', () => {
      expect(authStore.displayName).toBeNull();
      
      simpleMockAuth.setCurrentUser({ displayName: 'Test User', uid: 'test', email: 'test@example.com' });
      expect(authStore.displayName).toBe('Test User');
    });

    it('should return correct email', () => {
      expect(authStore.email).toBeNull();
      
      simpleMockAuth.setCurrentUser({ email: 'test@example.com', uid: 'test', displayName: null });
      expect(authStore.email).toBe('test@example.com');
    });

    it('should return correct uid', () => {
      expect(authStore.uid).toBeNull();
      
      simpleMockAuth.setCurrentUser({ uid: 'test-uid-123', email: 'test@example.com', displayName: null });
      expect(authStore.uid).toBe('test-uid-123');
    });
  });

  describe('sign in with Google', () => {
    it('should sign in successfully', async () => {
      await authStore.signInWithGoogle();

      expect(authStore.isSignedIn).toBe(true);
      expect(authStore.user?.email).toBe('test@example.com');
      expect(authStore.error).toBeNull();
      expect(authStore.isLoading).toBe(false);
    });

    it('should handle authentication errors', async () => {
      // Wait for initial state to settle
      
      // Mock the signInWithPopup to throw an error
      simpleMockAuth.signInWithPopup.mockRejectedValueOnce(
        new Error('auth/popup-closed-by-user')
      );

      await authStore.signInWithGoogle();

      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.error).toBe('auth/popup-closed-by-user');
      expect(authStore.isLoading).toBe(false);
    });

    it('should set loading state during sign-in', async () => {
      // Wait for initial state
      
      // Create a promise that we can control
      let resolveSignIn: any;
      const signInPromise = new Promise<{ user: any }>((resolve) => {
        resolveSignIn = resolve;
      });
      
      simpleMockAuth.signInWithPopup.mockReturnValueOnce(signInPromise);

      const signInCall = authStore.signInWithGoogle();
      
      // Should be loading
      expect(authStore.isLoading).toBe(true);
      
      // Resolve the sign-in and update the mock user state
      const user = { uid: 'test', email: 'test@example.com', displayName: 'Test' };
      simpleMockAuth.setCurrentUser(user);
      resolveSignIn({ user });
      await signInCall;
      
      // Should no longer be loading
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('email authentication', () => {
    it('should sign in with valid credentials', async () => {
      await authStore.signInWithEmail('test@example.com', 'password123');

      expect(authStore.isSignedIn).toBe(true);
      expect(authStore.user?.email).toBe('test@example.com');
      expect(authStore.error).toBeNull();
    });

    it('should reject invalid credentials', async () => {
      await authStore.signInWithEmail('invalid@test.com', 'wrongpassword');

      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.error).toBe('auth/user-not-found');
    });

    it('should create new account with valid email', async () => {
      await authStore.signUpWithEmail('newuser@example.com', 'password123');

      expect(authStore.isSignedIn).toBe(true);
      expect(authStore.user?.email).toBe('newuser@example.com');
      expect(authStore.error).toBeNull();
    });

    it('should handle existing email error during sign-up', async () => {
      await authStore.signUpWithEmail('existing@test.com', 'password123');

      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.error).toBe('auth/email-already-in-use');
    });

    it('should clear previous errors on new sign-in attempt', async () => {
      // First attempt with error
      await authStore.signInWithEmail('invalid@test.com', 'wrong');
      expect(authStore.error).toBeTruthy();

      // Second attempt should clear error during loading
      const signInPromise = authStore.signInWithEmail('valid@test.com', 'correct');
      expect(authStore.error).toBeNull();
      
      await signInPromise;
    });
  });

  describe('sign out', () => {
    it('should sign out successfully', async () => {
      // First sign in
      simpleMockAuth.setCurrentUser({ uid: 'test', email: 'test@example.com', displayName: 'Test' });
      expect(authStore.isSignedIn).toBe(true);

      // Then sign out
      await authStore.signOut();
      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.user).toBeNull();
    });

    it('should handle sign out errors', async () => {
      simpleMockAuth.setCurrentUser({ uid: 'test', email: 'test@example.com', displayName: 'Test' });
      
      simpleMockAuth.signOut.mockRejectedValueOnce(
        new Error('Network error')
      );

      await authStore.signOut();
      expect(authStore.error).toBe('Network error');
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      await authStore.signInWithEmail('invalid@test.com', 'wrong');
      expect(authStore.error).toBeTruthy();

      authStore.clearError();
      expect(authStore.error).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      simpleMockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(
        new Error('Firebase: Network request failed')
      );

      await authStore.signInWithEmail('test@example.com', 'password');
      
      expect(authStore.error).toBe('Firebase: Network request failed');
      expect(authStore.isSignedIn).toBe(false);
      expect(authStore.isLoading).toBe(false);
    });
  });

  describe('auth state listener', () => {
    it('should update user state when auth state changes', () => {
      // Auth state should be synchronous in tests
      expect(authStore.user).toBeNull();

      // Simulate user signing in externally
      const mockUser = {
        uid: 'external-user',
        email: 'external@example.com',
        displayName: 'External User'
      };
      
      simpleMockAuth.setCurrentUser(mockUser);
      expect(authStore.user).toEqual(mockUser);
    });

    it('should update loading state when listener is called', () => {
      // Create new auth store to test initial state
      const newMockAuth = createSimpleMockAuth();
      const newAuthStore = new AuthStore(newMockAuth);
      
      // In tests, auth listener fires synchronously so loading is immediately false
      expect(newAuthStore.isLoading).toBe(false);
    });
  });

  describe('reactive behavior', () => {
    it('should react to user state changes', () => {
      const displayNames: (string | null)[] = [];
      
      // Set up reaction to track displayName changes
      const { reaction } = require('mobx');
      const dispose = reaction(
        () => authStore.displayName,
        (displayName: string | null) => {
          displayNames.push(displayName);
        }
      );

      // Auth state should be synchronous in tests
      
      // Initial state
      displayNames.push(authStore.displayName);

      // Trigger changes
      simpleMockAuth.setCurrentUser({ uid: 'user1', email: 'user1@example.com', displayName: 'First Name' });
      simpleMockAuth.setCurrentUser({ uid: 'user2', email: 'user2@example.com', displayName: 'Second Name' });
      simpleMockAuth.setCurrentUser(null);

      // Reactions should fire synchronously with our mock
      
      expect(displayNames).toContain(null); // Initial state
      expect(displayNames).toContain('First Name');
      expect(displayNames).toContain('Second Name');
      
      dispose();
    });
  });
});