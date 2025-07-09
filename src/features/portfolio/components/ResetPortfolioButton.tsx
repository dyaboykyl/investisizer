import { usePortfolioStore } from '@/features/core/stores/hooks';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

export const ResetPortfolioButton: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the portfolio to its default state? All your changes will be lost.')) {
      portfolioStore.resetToDefault();
    }
  };

  return (
    <button
      onClick={handleReset}
      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300 transition-all duration-200"
      aria-label="Reset to Default"
    >
      {isMobile ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        "Reset to Default"
      )}
    </button>
  );
});
