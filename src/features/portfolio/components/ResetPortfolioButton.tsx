import { usePortfolioStore } from '@/features/core/stores/hooks';
import { observer } from 'mobx-react-lite';
import React from 'react';

export const ResetPortfolioButton: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();

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
      <span className="hidden sm:inline">Reset to Default</span>
      <span className="sm:hidden">Reset</span>
    </button>
  );
});
