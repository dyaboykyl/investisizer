import React from 'react';
import { observer } from 'mobx-react-lite';
import { Investment } from '@/features/investment/stores/Investment';
import { Property } from '@/features/property/stores/Property';
import type { CombinedResult } from '@/features/portfolio/stores/PortfolioStore';
import { AssetLinkingIndicator } from './AssetLinkingIndicator';
import { InvestmentBreakdown } from './InvestmentBreakdown';
import { PropertyBreakdown } from './PropertyBreakdown';

interface AssetBreakdownItemProps {
  asset: Investment | Property;
  breakdown: CombinedResult['assetBreakdown'][0] | undefined;
  finalResult: CombinedResult | undefined;
  linkedInvestment?: Investment | null;
  linkedProperties?: Property[];
}

export const AssetBreakdownItem: React.FC<AssetBreakdownItemProps> = observer(({
  asset,
  breakdown,
  finalResult,
  linkedInvestment,
  linkedProperties = []
}) => {
  const isEnabled = asset.enabled;

  return (
    <div className={`p-4 rounded-lg border transition-all ${isEnabled
        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        : 'bg-gray-25 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'
      }`}>
      {/* Header with checkbox and asset info */}
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => {
            asset.setEnabled(e.target.checked);
          }}
          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
        />
        <div className="ml-3 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white font-medium">{asset.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${asset.type === 'investment'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                  {asset.type === 'investment' ? 'Investment' : 'Property'}
                </span>
              </div>

              {/* Show linking indicators */}
              <AssetLinkingIndicator
                linkedInvestment={linkedInvestment}
                linkedProperties={linkedProperties}
              />
            </div>

            {/* Final balance/equity on the right */}
            {isEnabled && breakdown && (
              <div className="text-left sm:text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${breakdown.balance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {((breakdown.balance / (finalResult?.totalBalance || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </label>

      {/* Detailed breakdown when enabled */}
      {isEnabled && breakdown && (
        <div className="mt-3 pl-7 border-l-2 border-gray-200 dark:border-gray-600">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {breakdown.assetType === 'investment' ? (
              <InvestmentBreakdown breakdown={breakdown} linkedProperties={linkedProperties} />
            ) : (
              <PropertyBreakdown breakdown={breakdown} />
            )}
          </div>
        </div>
      )}

      {/* Disabled state message */}
      {!isEnabled && (
        <div className="mt-2 pl-7 text-sm text-gray-500 dark:text-gray-500">
          Excluded from net wealth calculations
        </div>
      )}
    </div>
  );
});