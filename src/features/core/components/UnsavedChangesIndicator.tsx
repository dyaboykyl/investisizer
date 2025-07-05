import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/features/core/stores/hooks';

export const UnsavedChangesIndicator: React.FC = observer(() => {
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

  if (!portfolioStore.hasUnsavedChanges) {
    return null;
  }

  const handleSave = () => {
    portfolioStore.saveToLocalStorage();
  };

  const handleUndo = () => {
    portfolioStore.undoChanges();
  };

  return (
    <div className={`fixed ${isFooterVisible ? 'bottom-44' : 'bottom-24'} right-4 md:right-6 max-w-sm w-full md:w-auto bg-yellow-50/90 dark:bg-yellow-900/30 backdrop-blur-sm border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-3 md:p-4 animate-slide-up z-30 transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            You have unsaved changes
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
            Your changes will be lost if you leave
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={handleUndo}
          className="flex-1 md:flex-none px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo
        </button>
        <button
          onClick={handleSave}
          className="flex-1 md:flex-none px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
          </svg>
          Save
        </button>
      </div>
    </div>
  );
});