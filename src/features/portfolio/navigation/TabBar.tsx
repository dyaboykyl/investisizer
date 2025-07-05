import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { type AssetType } from '../factories/AssetFactory';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Tab } from '@/features/portfolio/navigation/Tab';

export const TabBar: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { assets, activeTabId, setActiveTab, addInvestment, addProperty, removeAsset } = portfolioStore;
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddAsset = (type: AssetType) => {
    if (type === 'investment') {
      addInvestment();
    } else {
      addProperty();
    }
    setShowDropdown(false);
    setShowAssetMenu(false);
  };

  const handleRemoveAsset = (id: string) => {
    removeAsset(id);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      
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

  // Close dropdowns on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
        setShowAssetMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        {/* Scrollable tabs area */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex items-center gap-1 px-2 md:px-4">
            {/* Combined Portfolio Tab */}
            <Tab
              id="combined"
              label="Combined Portfolio"
              isActive={activeTabId === 'combined'}
              onClick={setActiveTab}
              closable={false}
            />

            {/* Asset Tabs */}
            {Array.from(assets.values()).map((asset) => (
              <Tab
                key={asset.id}
                id={asset.id}
                label={asset.name}
                isActive={activeTabId === asset.id}
                onClick={setActiveTab}
                onClose={handleRemoveAsset}
                closable={assets.size > 1}
              />
            ))}
          </div>
        </div>

        {/* Fixed action buttons area - outside scrollable container */}
        <div className="flex-shrink-0 flex items-center gap-1 px-2 md:px-4 border-l border-gray-200 dark:border-gray-700">
          {/* Save and Undo buttons */}
          {portfolioStore.hasUnsavedChanges && (
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
                onClick={() => portfolioStore.saveToLocalStorage()}
                className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                title="Save changes"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                </svg>
              </button>
            </>
          )}
          
          {/* Add asset button */}
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

            {/* Dropdown Menu - can now overflow without issues */}
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
        </div>

        {/* Alternative: Floating menu button for mobile */}
        <div className="md:hidden fixed bottom-20 right-4 z-50">
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
      </div>
    </div>
  );
});