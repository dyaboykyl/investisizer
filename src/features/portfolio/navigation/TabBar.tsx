import { observer } from 'mobx-react-lite';
import React from 'react';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Tab } from '@/features/portfolio/navigation/Tab';
import { AddAssetDropdown, MobileAssetMenu } from '@/features/core/components/navigation';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

export const TabBar: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { assets, activeTabId, setActiveTab, removeAsset } = portfolioStore;
  
  // Hide desktop add button on mobile, show mobile floating button instead
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const handleRemoveAsset = (id: string) => {
    removeAsset(id);
  };

  return (
    <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center">
        {/* Tabs area with wrapping support */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1 px-2 md:px-4 py-1">
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

        {/* Fixed action buttons area */}
        <div className="flex-shrink-0 flex items-center gap-1 px-2 md:px-4 lg:border-l border-gray-200 dark:border-gray-700 py-1">
          {/* Add asset button - only show on desktop */}
          {!isMobile && <AddAssetDropdown />}
        </div>

        {/* Mobile floating menu button */}
        <MobileAssetMenu />
      </div>
    </div>
  );
});