// Create a simple mock auth for testing
export const createSimpleMockAuth = () => {
  let currentUser: any = null;
  const listeners: ((user: any) => void)[] = [];
  
  const mock = {
    get user() { return currentUser; },
    setCurrentUser(user: any) {
      currentUser = user;
      listeners.forEach(listener => listener(user));
    },
    onAuthStateChanged(callback: (user: any) => void) {
      listeners.push(callback);
      // Call synchronously for predictable test behavior
      callback(currentUser);
      return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      };
    },
    signInWithPopup: jest.fn(async function() { 
      const user = { uid: 'google-user', email: 'test@example.com', displayName: 'Test User' };
      mock.setCurrentUser(user);
      return { user };
    }),
    signInWithEmailAndPassword: jest.fn(async function(email: string) { 
      if (email === 'invalid@test.com') throw new Error('auth/user-not-found');
      const user = { uid: `user-${email}`, email, displayName: null };
      mock.setCurrentUser(user);
      return { user }; 
    }),
    createUserWithEmailAndPassword: jest.fn(async function(email: string) { 
      if (email === 'existing@test.com') throw new Error('auth/email-already-in-use');
      const user = { uid: `user-${email}`, email, displayName: null };
      mock.setCurrentUser(user);
      return { user }; 
    }),
    signOut: jest.fn(async function() { 
      mock.setCurrentUser(null); 
    }),
    reset() { 
      currentUser = null; 
      listeners.forEach(l => l(null));
      listeners.length = 0;
      // Reset mocks
      mock.signInWithPopup.mockClear();
      mock.signInWithEmailAndPassword.mockClear();
      mock.createUserWithEmailAndPassword.mockClear();
      mock.signOut.mockClear();
    }
  };
  
  return mock;
};