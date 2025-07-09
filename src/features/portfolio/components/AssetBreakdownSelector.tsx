import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../stores/PortfolioStore';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { AssetBreakdownItem } from './breakdown';

interface AssetBreakdownSelectorProps {
  finalResult: CombinedResult | undefined;
}

export const AssetBreakdownSelector: React.FC<AssetBreakdownSelectorProps> = observer(({ finalResult }) => {
  const portfolioStore = usePortfolioStore();
  const { assetsList } = portfolioStore;
  
  const isLoading = !finalResult;

  // Find the breakdown data for each asset
  const getAssetBreakdown = (assetId: string) => {
    return finalResult?.assetBreakdown.find(breakdown => breakdown.assetId === assetId);
  };

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Asset Portfolio & Breakdown" icon={icon}>

      <div className="space-y-3">
        {isLoading ? (
          // Show loading placeholders for each asset
          assetsList.map((asset) => (
            <div 
              key={asset.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                  <div key={cardIndex} className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          assetsList.map((asset) => {
            const breakdown = getAssetBreakdown(asset.id);

            // Check for linked relationships
            const linkedInvestment = asset.type === 'property' && 'linkedInvestmentId' in asset.inputs && asset.inputs.linkedInvestmentId ?
              portfolioStore.investments.find(inv => inv.id === asset.inputs.linkedInvestmentId) : null;
            const linkedProperties = asset.type === 'investment' ?
              portfolioStore.properties.filter(prop => prop.inputs.linkedInvestmentId === asset.id && prop.enabled) : [];

            return (
              <AssetBreakdownItem
                key={asset.id}
                asset={asset}
                breakdown={breakdown}
                finalResult={finalResult}
                linkedInvestment={linkedInvestment}
                linkedProperties={linkedProperties}
              />
            );
          })
        )}
      </div>

      {assetsList.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>No assets created yet. Use the + button in the tab bar to add your first asset.</p>
        </div>
      )}
    </CollapsibleSection>
  );
});