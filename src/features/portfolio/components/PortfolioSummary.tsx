import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../stores/PortfolioStore';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { CurrencyDisplay } from '@/features/shared/components/CurrencyDisplay';

interface PortfolioSummaryProps {
  finalResult: CombinedResult | undefined;
  enabledAssetsCount: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = observer(({ finalResult, enabledAssetsCount }) => {
  const portfolioStore = usePortfolioStore();

  if (enabledAssetsCount === 0) {
    return null;
  }

  const totalInitialInvestment = portfolioStore.totalInitialInvestment;
  const totalContributed = portfolioStore.totalContributed;
  const totalReturnPercentage = portfolioStore.totalReturnPercentage;

  // Calculate final year and projection period for title
  const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();
  const projectionYears = parseInt(portfolioStore.years) || 10;
  const finalYear = startingYear + projectionYears;

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
    </svg>
  );

  // Loading state with placeholder elements
  const isLoading = !finalResult;

  // Helper component for loading placeholders
  const LoadingPlaceholder = () => (
    <>
      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
    </>
  );

  return (
    <CollapsibleSection title={`Net Wealth Summary for ${finalYear} (+${projectionYears} years)`} icon={icon} defaultExpanded={true}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Total Net Wealth */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Total Net Wealth
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : !portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.totalRealBalance}
                className="text-2xl font-bold text-blue-900 dark:text-blue-100"
              />
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Nominal: <CurrencyDisplay amount={finalResult.totalBalance} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={finalResult.totalBalance}
                className="text-2xl font-bold text-blue-900 dark:text-blue-100"
              />
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.totalRealBalance} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Investment Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Investment Balance
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : !portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.totalRealInvestmentBalance}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay amount={finalResult.totalInvestmentBalance} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={finalResult.totalInvestmentBalance}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.totalRealInvestmentBalance} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Property Equity */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Property Equity
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : !portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.totalRealPropertyEquity}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay amount={finalResult.totalPropertyEquity} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={finalResult.totalPropertyEquity}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.totalRealPropertyEquity} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Property Value */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Property Value
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : !portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.totalRealPropertyValue}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay amount={finalResult.totalPropertyValue} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={finalResult.totalPropertyValue}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.totalRealPropertyValue} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Total Initial Investment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Initial Investment
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <>
              <CurrencyDisplay
                amount={Math.round(totalInitialInvestment)}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalContributed > 0 && (
                  <>Added: <CurrencyDisplay amount={Math.round(totalContributed)} className="inline" /></>
                )}
                {totalContributed === 0 && (
                  <>Down payments & deposits</>
                )}
              </p>
            </>
          )}
        </div>

        {/* Total Return */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Return
          </h3>
          {isLoading ? (
            <LoadingPlaceholder />
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalReturnPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                On initial investment
              </p>
            </>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
});