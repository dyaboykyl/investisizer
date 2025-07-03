import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tab } from './Tab';
import { usePortfolioStore } from '../../stores/hooks';

export const TabBar: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { assets, activeTabId, setActiveTab, addAsset, removeAsset } = portfolioStore;

  const handleAddAsset = () => {
    addAsset();
  };

  const handleRemoveAsset = (id: string) => {
    removeAsset(id);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-1 px-4">
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
          onClick={handleAddAsset}
          className="ml-2 p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          title="Add new asset"
        >
          <svg
            className="w-5 h-5"
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
  );
});