import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/features/core/stores/hooks';

export const DisplayOptions: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0
      }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`fixed ${isFooterVisible ? 'bottom-24' : 'bottom-6'} left-2 right-28 sm:left-4 sm:right-4 md:left-auto md:right-6 md:w-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-2 z-40 mb-2 transition-all duration-300 h-12 flex items-center`}>
      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-2">Display:</h3>
      <div className="flex flex-row gap-3">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioStore.showNominal}
            onChange={(e) => portfolioStore.setShowNominal(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
          />
          <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">Nominal</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioStore.showReal}
            onChange={(e) => portfolioStore.setShowReal(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
          />
          <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">Real</span>
        </label>
      </div>
    </div>
  );
});