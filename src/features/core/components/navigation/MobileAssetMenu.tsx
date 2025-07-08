import React, { useRef, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { type AssetType } from '@/features/portfolio/factories/AssetFactory';
import { usePortfolioStore } from '@/features/core/stores/hooks';

export const MobileAssetMenu: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { addInvestment, addProperty } = portfolioStore;
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddAsset = (type: AssetType) => {
    if (type === 'investment') {
      addInvestment();
    } else {
      addProperty();
    }
    setShowAssetMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowAssetMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAssetMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="hidden">
      <button
        ref={menuButtonRef}
        onClick={() => setShowAssetMenu(!showAssetMenu)}
        className={`p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 ${
          showAssetMenu ? 'rotate-45' : ''
        }`}
        aria-label="Add new asset"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Floating menu options */}
      {showAssetMenu && (
        <div className="absolute bottom-full right-0 mb-2 space-y-2">
          <button
            onClick={() => handleAddAsset('property')}
            className="block w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center whitespace-nowrap">
              <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Property
            </div>
          </button>
          <button
            onClick={() => handleAddAsset('investment')}
            className="block w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center whitespace-nowrap">
              <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Investment
            </div>
          </button>
        </div>
      )}
    </div>
  );
});