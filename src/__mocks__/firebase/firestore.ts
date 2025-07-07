interface MockDocument {
  id: string;
  data: any;
  exists: boolean;
}

interface MockCollection {
  [docId: string]: MockDocument;
}

class MockFirestore {
  private collections: { [path: string]: MockCollection } = {};
  private static instance: MockFirestore;

  static getInstance(): MockFirestore {
    if (!MockFirestore.instance) {
      MockFirestore.instance = new MockFirestore();
    }
    return MockFirestore.instance;
  }

  // Document operations
  async getDoc(docRef: any): Promise<MockDocument> {
    const doc = this.collections[docRef.collectionPath]?.[docRef.id];
    const mockDoc = doc || { id: docRef.id, data: null, exists: false };
    
    // Add exists() method to match Firebase API
    return {
      ...mockDoc,
      exists: () => mockDoc.exists,
      data: () => mockDoc.data
    } as any;
  }

  async setDoc(docRef: any, data: any, options?: any): Promise<void> {
    if (!this.collections[docRef.collectionPath]) {
      this.collections[docRef.collectionPath] = {};
    }
    
    const existingData = this.collections[docRef.collectionPath][docRef.id]?.data || {};
    const newData = options?.merge ? { ...existingData, ...data } : data;
    
    this.collections[docRef.collectionPath][docRef.id] = {
      id: docRef.id,
      data: newData,
      exists: true
    };
  }

  async deleteDoc(docRef: any): Promise<void> {
    if (this.collections[docRef.collectionPath]) {
      delete this.collections[docRef.collectionPath][docRef.id];
    }
  }

  // Collection operations
  async getDocs(collectionRef: any): Promise<{ docs: MockDocument[] }> {
    const collection = this.collections[collectionRef.path] || {};
    return {
      docs: Object.values(collection).filter(doc => doc.exists)
    };
  }

  // Batch operations
  createBatch(): MockBatch {
    return new MockBatch();
  }

  // Test utilities
  setMockData(path: string, docId: string, data: any) {
    if (!this.collections[path]) {
      this.collections[path] = {};
    }
    this.collections[path][docId] = {
      id: docId,
      data,
      exists: true
    };
  }

  getMockData(path: string, docId: string) {
    return this.collections[path]?.[docId]?.data;
  }

  reset() {
    this.collections = {};
  }

  getAllMockData() {
    return { ...this.collections };
  }
}

class MockBatch {
  private operations: Array<{ type: string; docRef: any; data?: any }> = [];

  constructor() {}

  set(docRef: any, data: any): MockBatch {
    this.operations.push({ type: 'set', docRef, data });
    return this;
  }

  delete(docRef: any): MockBatch {
    this.operations.push({ type: 'delete', docRef });
    return this;
  }

  async commit(): Promise<void> {
    const firestore = MockFirestore.getInstance();
    for (const op of this.operations) {
      if (op.type === 'set') {
        await firestore.setDoc(op.docRef, op.data);
      } else if (op.type === 'delete') {
        await firestore.deleteDoc(op.docRef);
      }
    }
  }
}

export const mockFirestore = MockFirestore.getInstance();

// Mock functions
export const doc = jest.fn((_db, path) => {
  const parts = path.split('/');
  const id = parts[parts.length - 1];
  const collectionPath = parts.slice(0, -1).join('/');
  return { id, path, collectionPath };
});

export const collection = jest.fn((_db, path) => ({ path }));

export const getDoc = jest.fn().mockImplementation((docRef) => mockFirestore.getDoc(docRef));
export const setDoc = jest.fn().mockImplementation((docRef, data, options) => 
  mockFirestore.setDoc(docRef, data, options)
);
export const deleteDoc = jest.fn().mockImplementation((docRef) => mockFirestore.deleteDoc(docRef));
export const getDocs = jest.fn().mockImplementation((collectionRef) => 
  mockFirestore.getDocs(collectionRef)
);
export const writeBatch = jest.fn().mockImplementation(() => mockFirestore.createBatch());
export const enableIndexedDbPersistence = jest.fn().mockResolvedValue(undefined);