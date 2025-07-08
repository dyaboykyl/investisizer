import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '@/features/core/stores/hooks';

export const TabBarActions: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();

  if (!portfolioStore.hasUnsavedChanges) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => portfolioStore.undoChanges()}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Undo changes"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
      </button>
      <button
        onClick={() => portfolioStore.save()}
        className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
        title="Save changes"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
        </svg>
      </button>
    </>
  );
});