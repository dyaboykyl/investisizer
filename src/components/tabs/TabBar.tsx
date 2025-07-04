import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { type AssetType } from '../../stores/AssetFactory';
import { usePortfolioStore } from '../../stores/hooks';
import { Tab } from './Tab';

class TabBarState {
  showDropdown = false;

  constructor() {
    makeObservable(this, {
      showDropdown: observable,
      setShowDropdown: action,
      toggleDropdown: action
    });
  }

  setShowDropdown = (show: boolean) => {
    this.showDropdown = show;
  };

  toggleDropdown = () => {
    this.setShowDropdown(!this.showDropdown);
  };
}

export const TabBar: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { assets, activeTabId, setActiveTab, addAsset, removeAsset } = portfolioStore;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tabBarStateRef = useRef(new TabBarState());
  const tabBarState = tabBarStateRef.current;
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const handleAddAsset = (type: AssetType) => {
    addAsset(undefined, type);
    tabBarState.setShowDropdown(false);
  };

  const handleRemoveAsset = (id: string) => {
    removeAsset(id);
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current && tabBarState.showDropdown) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  };

  const handleToggleDropdown = () => {
    tabBarState.toggleDropdown();
    if (!tabBarState.showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is on dropdown itself
      const dropdown = document.querySelector('.fixed.w-48');
      if (dropdown && dropdown.contains(event.target as Node)) {
        return; // Don't close if clicking inside dropdown
      }
      
      // Check if click is on the button
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return; // Don't close if clicking the button
      }
      
      tabBarState.setShowDropdown(false);
    };

    if (tabBarState.showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tabBarState.showDropdown]);

  // Update dropdown position on scroll
  useEffect(() => {
    if (tabBarState.showDropdown) {
      const handleScroll = () => updateDropdownPosition();
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [tabBarState.showDropdown]);

  return (
    <>
      <div className="border-b border-gray-200 dark:border-gray-700 relative">
        <div className="flex items-center px-2 md:px-4 overflow-x-auto">
          <div className="flex items-center gap-1 flex-nowrap">
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

            {/* Add Asset Button */}
            <button
              ref={buttonRef}
              onClick={handleToggleDropdown}
              className="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex-shrink-0"
              title="Add new asset"
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
          </div>
        </div>
      </div>

      {/* Dropdown Menu - positioned outside scrollable container */}
      {tabBarState.showDropdown && createPortal(
        <div 
          className="fixed w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-[100]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1">
            <button
              onClick={() => handleAddAsset('investment')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Investment Asset
              </div>
            </button>
            <button
              onClick={() => handleAddAsset('property')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Property Asset
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
});