export interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class MockFirebaseAuth {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  get user() {
    return this.currentUser;
  }

  // Mock sign in methods
  async signInWithPopup(_provider: any): Promise<{ user: MockUser }> {
    const mockUser: MockUser = {
      uid: `mock-user-${Date.now()}`,
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    this.setCurrentUser(mockUser);
    return { user: mockUser };
  }

  async signInWithEmailAndPassword(email: string, _password: string): Promise<{ user: MockUser }> {
    // Simulate auth validation
    if (email === 'invalid@test.com') {
      throw new Error('auth/user-not-found');
    }
    
    const mockUser: MockUser = {
      uid: `mock-user-${email.replace('@', '-').replace('.', '-')}`,
      email,
      displayName: null
    };
    
    this.setCurrentUser(mockUser);
    return { user: mockUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<{ user: MockUser }> {
    if (email === 'existing@test.com') {
      throw new Error('auth/email-already-in-use');
    }
    
    return this.signInWithEmailAndPassword(email, password);
  }

  async signOut(): Promise<void> {
    this.setCurrentUser(null);
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    // Call synchronously for predictable test behavior
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  setCurrentUser(user: MockUser | null) {
    this.currentUser = user;
    // Call listeners synchronously for predictable test behavior
    this.listeners.forEach(listener => listener(user));
  }

  // Test utilities
  mockSignIn(user: Partial<MockUser> = {}) {
    const mockUser: MockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      ...user
    };
    this.setCurrentUser(mockUser);
  }

  mockSignOut() {
    this.setCurrentUser(null);
  }

  reset() {
    this.currentUser = null;
    // Notify listeners of reset
    this.listeners.forEach(listener => listener(null));
    this.listeners = [];
  }
}

// Create single instance at module load time
export const mockAuth = new MockFirebaseAuth();
export const GoogleAuthProvider = jest.fn();
export const signInWithPopup = jest.fn().mockImplementation((_auth, provider) => 
  mockAuth.signInWithPopup(provider)
);
export const signInWithEmailAndPassword = jest.fn().mockImplementation((_auth, email, password) =>
  mockAuth.signInWithEmailAndPassword(email, password)
);
export const createUserWithEmailAndPassword = jest.fn().mockImplementation((_auth, email, password) =>
  mockAuth.createUserWithEmailAndPassword(email, password)
);
export const signOut = jest.fn().mockImplementation((_auth) => mockAuth.signOut());
export const onAuthStateChanged = jest.fn().mockImplementation((_auth, callback) =>
  mockAuth.onAuthStateChanged(callback)
);