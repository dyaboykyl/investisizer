import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/features/core/stores/hooks';

const ErrorModal: React.FC<{
  error: string;
  onClose: () => void;
  onRetry: () => void;
}> = ({ error, onClose, onRetry }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 pb-8 px-4 z-[9999]">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full max-h-[calc(100vh-10rem)] overflow-y-auto">
      <div className="flex items-center mb-4">
        <svg className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save Error</h3>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Failed to save your data:
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
          <code className="text-sm text-red-800 dark:text-red-200 break-words whitespace-pre-wrap">{error}</code>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your data is preserved in memory. Check the browser console for more details.
        </p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          Retry Save
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);

export const SaveStatus: React.FC = observer(() => {
  const { authStore, portfolioStore, storageStore } = useRootStore();
  const [showErrorModal, setShowErrorModal] = useState(false);

  if (!authStore.isSignedIn) return null;

  const handleRetry = async () => {
    setShowErrorModal(false);
    storageStore.clearError();
    await portfolioStore.save();
  };

  const handleCloseModal = () => {
    setShowErrorModal(false);
    storageStore.clearError();
  };

  if (storageStore.isSaving) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
          Saving...
        </div>
        <button
          onClick={storageStore.resetState}
          className="text-xs text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          title="Reset save state (debug)"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  if (storageStore.saveError) {
    return (
      <>
        <button
          onClick={() => setShowErrorModal(true)}
          className="flex items-center text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          title="Click to see save error details"
        >
          <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Save error
        </button>
        
        {showErrorModal && (
          <ErrorModal
            error={storageStore.saveError}
            onClose={handleCloseModal}
            onRetry={handleRetry}
          />
        )}
      </>
    );
  }

  if (storageStore.lastSaveTime) {
    const timeAgo = new Date().getTime() - storageStore.lastSaveTime.getTime();
    const minutesAgo = Math.floor(timeAgo / (1000 * 60));
    const timeText = minutesAgo < 1 ? 'just now' : 
                    minutesAgo === 1 ? '1 minute ago' : 
                    minutesAgo < 60 ? `${minutesAgo} minutes ago` : 
                    'over an hour ago';

    return (
      <div className="flex items-center space-x-2">
        <div 
          className="flex items-center text-sm text-green-500 dark:text-green-400"
          title={`Last saved: ${storageStore.lastSaveTime.toLocaleString()}`}
        >
          <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Saved {timeText}
        </div>
        <button
          onClick={() => portfolioStore.save()}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Save now"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
          </svg>
        </button>
      </div>
    );
  }

  // Show manual save button if never saved
  return (
    <button
      onClick={() => portfolioStore.save()}
      className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      title="Save data"
    >
      <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
      </svg>
      Save now
    </button>
  );
});