import { makeAutoObservable, runInAction } from 'mobx';
import { FirestoreService } from '@/services/firestore';
import type { RootStore } from './RootStore';

export interface StorageState {
  isSaving: boolean;
  lastSaveTime: Date | null;
  saveError: string | null;
}

export class StorageStore {
  // Storage state
  isSaving = false;
  lastSaveTime: Date | null = null;
  saveError: string | null = null;

  private rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // Unified save method - saves to appropriate storage based on auth state
  async save(key: string, data: any): Promise<void> {
    if (this.isSaving) {
      console.warn('Save already in progress, skipping');
      return;
    }

    try {
      runInAction(() => {
        this.isSaving = true;
        this.saveError = null;
      });

      // Always save to localStorage first (as cache/fallback)
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);

      // If user is signed in, also save to cloud
      if (this.rootStore.authStore.isSignedIn && this.rootStore.authStore.user) {
        console.log('Saving to cloud for user:', this.rootStore.authStore.user.uid);
        
        await FirestoreService.savePortfolio(
          this.rootStore.authStore.user.uid,
          data
        );
        
        console.log('Cloud save successful');
      } else {
        console.log('User not signed in, saved to localStorage only');
      }

      runInAction(() => {
        this.lastSaveTime = new Date();
        this.saveError = null;
      });

    } catch (error: any) {
      console.error('Save failed:', error);
      
      runInAction(() => {
        this.saveError = error.message || 'Save failed';
      });
      
      // Re-throw so callers can handle if needed
      throw error;
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }

  // Unified load method - loads from appropriate storage based on auth state
  async load(key: string): Promise<any> {
    try {
      // If user is signed in, try to load from cloud first
      if (this.rootStore.authStore.isSignedIn && this.rootStore.authStore.user) {
        console.log('Loading from cloud for user:', this.rootStore.authStore.user.uid);
        
        try {
          const cloudData = await FirestoreService.loadPortfolio(this.rootStore.authStore.user.uid);
          
          if (cloudData) {
            console.log('Cloud data loaded successfully');
            
            // Also update localStorage cache
            localStorage.setItem(key, JSON.stringify(cloudData));
            
            runInAction(() => {
              this.lastSaveTime = new Date();
              this.saveError = null;
            });
            
            return cloudData;
          }
        } catch (error: any) {
          console.warn('Cloud load failed, falling back to localStorage:', error.message);
          
          runInAction(() => {
            this.saveError = `Cloud load failed: ${error.message}. Using local data.`;
          });
        }
      }

      // Fallback to localStorage (or primary storage when not signed in)
      const localData = localStorage.getItem(key);
      if (localData) {
        console.log('Loading from localStorage');
        return JSON.parse(localData);
      }

      console.log('No data found in any storage');
      return null;

    } catch (error: any) {
      console.error('Load failed:', error);
      
      runInAction(() => {
        this.saveError = error.message || 'Load failed';
      });
      
      return null;
    }
  }

  // Clear data from all storage locations
  async clear(key: string): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(key);

      // If signed in, also clear from cloud
      if (this.rootStore.authStore.isSignedIn && this.rootStore.authStore.user) {
        // Note: For simplicity, we don't delete cloud data, just local cache
        // In a real app, you might want a separate "deleteFromCloud" method
        console.log('Cleared localStorage, cloud data remains intact');
      }

      runInAction(() => {
        this.lastSaveTime = null;
        this.saveError = null;
      });

    } catch (error: any) {
      console.error('Clear failed:', error);
      
      runInAction(() => {
        this.saveError = error.message || 'Clear failed';
      });
    }
  }

  // Clear any save errors
  clearError(): void {
    runInAction(() => {
      this.saveError = null;
    });
  }

  // Reset storage state (for debugging)
  resetState(): void {
    runInAction(() => {
      this.isSaving = false;
      this.saveError = null;
    });
  }

  // Migration helper - loads from old localStorage keys if needed
  async migrateFromOldKeys(newKey: string, oldKeys: string[]): Promise<any> {
    // Check if new key already has data
    const existingData = await this.load(newKey);
    if (existingData) {
      return existingData;
    }

    // Try to find data in old keys
    for (const oldKey of oldKeys) {
      const oldData = localStorage.getItem(oldKey);
      if (oldData) {
        try {
          const parsedData = JSON.parse(oldData);
          console.log(`Migrating data from ${oldKey} to ${newKey}`);
          
          // Save to new location
          await this.save(newKey, parsedData);
          
          // Remove old data
          localStorage.removeItem(oldKey);
          
          return parsedData;
        } catch (error) {
          console.warn(`Failed to migrate data from ${oldKey}:`, error);
        }
      }
    }

    return null;
  }

  // Synchronous methods for test compatibility
  saveSync(key: string, data: any): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      
      runInAction(() => {
        this.lastSaveTime = new Date();
        this.saveError = null;
      });
    } catch (error: any) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      runInAction(() => {
        this.saveError = error.message || 'Save failed';
      });
    }
  }

  loadSync(key: string): any {
    try {
      const dataStr = localStorage.getItem(key);
      if (dataStr) {
        return JSON.parse(dataStr);
      }
      return null;
    } catch (error: any) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      runInAction(() => {
        this.saveError = error.message || 'Load failed';
      });
      return null;
    }
  }

  // Computed properties for UI
  get hasUnsavedError(): boolean {
    return this.saveError !== null;
  }

  get canSave(): boolean {
    return !this.isSaving;
  }

  get statusMessage(): string {
    if (this.isSaving) return 'Saving...';
    if (this.saveError) return 'Save failed';
    if (this.lastSaveTime) {
      const timeAgo = new Date().getTime() - this.lastSaveTime.getTime();
      const minutesAgo = Math.floor(timeAgo / (1000 * 60));
      
      if (minutesAgo < 1) return 'Saved just now';
      if (minutesAgo === 1) return 'Saved 1 minute ago';
      if (minutesAgo < 60) return `Saved ${minutesAgo} minutes ago`;
      return 'Saved over an hour ago';
    }
    return 'Not saved';
  }
}