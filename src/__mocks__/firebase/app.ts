export const initializeApp = jest.fn().mockReturnValue({
  name: 'mock-app',
  options: {}
});

export const getAuth = jest.fn().mockReturnValue('mock-auth');
export const getFirestore = jest.fn().mockReturnValue('mock-firestore');