import { mockAuth } from '@/__mocks__/firebase/auth';
import { mockFirestore } from '@/__mocks__/firebase/firestore';

export class FirebaseTestHelper {
  static reset() {
    mockAuth.reset();
    mockFirestore.reset();
    jest.clearAllMocks();
  }

  static mockSignedInUser(userData: Partial<any> = {}) {
    const user = {
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      ...userData
    };
    mockAuth.setCurrentUser(user);
  }

  static mockSignedOutUser() {
    mockAuth.setCurrentUser(null);
  }

  static setMockPortfolioData(userId: string, data: {
    investments?: any[];
    properties?: any[];
    settings?: any;
  }) {
    // Convert old format to new single document format
    const portfolioData: any = {};
    
    // Add settings as top-level properties
    if (data.settings) {
      portfolioData.inflationRate = data.settings.inflationRate;
      portfolioData.years = data.settings.years;
      portfolioData.startingYear = data.settings.startingYear;
      portfolioData.showNominal = data.settings.showNominal;
      portfolioData.showReal = data.settings.showReal;
    }
    
    // Combine investments and properties into assets array
    portfolioData.assets = [];
    if (data.investments) {
      portfolioData.assets.push(...data.investments);
    }
    if (data.properties) {
      portfolioData.assets.push(...data.properties);
    }
    
    // Save as single document
    mockFirestore.setMockData(`users/${userId}`, 'portfolio', portfolioData);
  }

  static getMockPortfolioData(userId: string) {
    const portfolioData = mockFirestore.getMockData(`users/${userId}`, 'portfolio');
    
    if (!portfolioData) {
      return {
        settings: null,
        investments: [],
        properties: []
      };
    }
    
    // Convert new format back to old format for backward compatibility
    const assets = portfolioData.assets || [];
    return {
      settings: {
        inflationRate: portfolioData.inflationRate,
        years: portfolioData.years,
        startingYear: portfolioData.startingYear,
        showNominal: portfolioData.showNominal,
        showReal: portfolioData.showReal
      },
      investments: assets.filter((asset: any) => asset.type === 'investment'),
      properties: assets.filter((asset: any) => asset.type === 'property')
    };
  }

  static simulateNetworkError() {
    jest.spyOn(mockFirestore, 'setDoc').mockRejectedValueOnce(
      new Error('Firebase: Network request failed')
    );
  }

  static simulateAuthError(errorCode: string) {
    const error = new Error(`Firebase Auth Error: ${errorCode}`);
    error.name = errorCode;
    jest.spyOn(mockAuth, 'signInWithEmailAndPassword').mockRejectedValueOnce(error);
  }

  static simulateFirestoreError(method: string, errorCode: string) {
    const error = new Error(`Firestore Error: ${errorCode}`);
    error.name = errorCode;
    jest.spyOn(mockFirestore, method as any).mockRejectedValueOnce(error);
  }
}