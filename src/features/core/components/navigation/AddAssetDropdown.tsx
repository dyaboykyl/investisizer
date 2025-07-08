import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { type AssetType } from '@/features/portfolio/factories/AssetFactory';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { useClickOutsideMultiple, useEscapeKey } from '@/features/shared/hooks';

export const AddAssetDropdown: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { addInvestment, addProperty } = portfolioStore;
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { createRef } = useClickOutsideMultiple<HTMLElement>(() => {
    setShowDropdown(false);
  }, showDropdown);

  const dropdownRef = createRef(0);
  const buttonRef = createRef(1);

  useEscapeKey(() => {
    setShowDropdown(false);
  }, showDropdown);

  const handleAddAsset = (type: AssetType) => {
    if (type === 'investment') {
      addInvestment();
    } else {
      addProperty();
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Add new asset"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <svg
          className="w-4 h-4 md:w-5 md:h-5"
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

      {/* Dropdown Menu */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in"
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleAddAsset('investment')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
              role="menuitem"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Investment Asset
              </div>
            </button>
            <button
              onClick={() => handleAddAsset('property')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
              role="menuitem"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Property Asset
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});