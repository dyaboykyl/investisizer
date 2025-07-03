import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '../stores/hooks';

export const UnsavedChangesIndicator: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  
  if (!portfolioStore.hasUnsavedChanges) {
    return null;
  }
  
  return (
    <div className="fixed bottom-6 right-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up">
      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          You have unsaved changes
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
          Remember to save your assets
        </p>
      </div>
    </div>
  );
});