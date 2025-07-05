import { observer } from 'mobx-react-lite';
import React from 'react';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { InvestmentAnalysis } from '@/features/investment/components/InvestmentAnalysis';
import { PropertyAssetAnalysis } from '@/features/property/components/PropertyAssetAnalysis';
import { DisplayOptions } from '@/features/shared/components/DisplayOptions';
import { CombinedPortfolioView } from './CombinedPortfolioView';
import { TabBar } from '../navigation/TabBar';
import { isInvestment, isProperty } from '@/features/portfolio/factories/AssetFactory';

export const MultiAssetCalculator: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { activeTabId, activeAsset } = portfolioStore;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in pb-32 md:pb-36">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Multi-Asset Portfolio Projection
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Plan your financial future with multiple assets. Analyze individual investments and see their combined performance.
        </p>
      </div>

      <TabBar />

      <div className="mt-8">
        {activeTabId === 'combined' ? (
          <CombinedPortfolioView />
        ) : activeAsset ? (
          isProperty(activeAsset) ? (
            <PropertyAssetAnalysis asset={activeAsset} />
          ) : isInvestment(activeAsset) ? (
            <InvestmentAnalysis asset={activeAsset} />
          ) : null
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Select an asset to view its analysis
            </p>
          </div>
        )}
      </div>

      <DisplayOptions />
    </div>
  );
});