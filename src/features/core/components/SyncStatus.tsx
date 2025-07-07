import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/features/core/stores/hooks';

export const SyncStatus: React.FC = observer(() => {
  const { authStore, portfolioStore } = useRootStore();

  if (!authStore.isSignedIn) return null;

  if (portfolioStore.isSaving) {
    return (
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
        Saving...
      </div>
    );
  }

  if (portfolioStore.syncError) {
    return (
      <button
        onClick={portfolioStore.clearSyncError}
        className="flex items-center text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
        title={`Sync error: ${portfolioStore.syncError}`}
      >
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        Sync error
      </button>
    );
  }

  if (portfolioStore.lastSyncTime) {
    return (
      <div className="flex items-center text-sm text-green-500 dark:text-green-400">
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Saved to cloud
      </div>
    );
  }

  return null;
});