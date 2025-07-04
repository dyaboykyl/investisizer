import React from 'react';

export const EmptyPortfolioState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No Assets Selected
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Select at least one asset above to see the combined portfolio analysis.
      </p>
    </div>
  );
};