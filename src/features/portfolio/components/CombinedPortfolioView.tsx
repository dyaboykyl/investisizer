import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { ProjectionChart } from '@/features/shared/components/ProjectionChart';
import type { InvestmentResult } from '@/features/investment/stores/Investment';
import type { CombinedResult } from '../stores/PortfolioStore';
import { SharedInputs } from './SharedInputs';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetBreakdownSelector } from './AssetBreakdownSelector';
import { CombinedProjectionTable } from './CombinedProjectionTable';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import { useAsyncComputed } from '@/features/shared/hooks/useAsyncComputed';
import { LoadingOverlay, ChartSkeleton, TableSkeleton } from '@/features/shared/components/LoadingStates';

export const CombinedPortfolioView: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { enabledAssets } = portfolioStore;

  // Use async computation for heavy portfolio aggregation
  const { result: portfolioData, isLoading } = useAsyncComputed(
    () => {
      const combinedResults = portfolioStore.combinedResults;
      
      // Convert combined results to the format expected by ProjectionChart
      const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();
      const chartData: InvestmentResult[] = combinedResults.map((result: CombinedResult) => ({
        year: result.year,
        actualYear: startingYear + result.year,
        balance: result.totalBalance,
        realBalance: result.totalRealBalance,
        annualContribution: result.totalAnnualContribution,
        realAnnualContribution: result.totalRealAnnualContribution,
        totalEarnings: result.totalEarnings,
        realTotalEarnings: result.totalRealEarnings,
        yearlyGain: result.totalYearlyGain,
        realYearlyGain: result.totalRealYearlyGain,
        annualInvestmentGain: result.totalYearlyGain - result.totalAnnualContribution,
        realAnnualInvestmentGain: result.totalRealYearlyGain - result.totalRealAnnualContribution,
        propertyCashFlow: 0,
        realPropertyCashFlow: 0
      }));

      const finalResult = combinedResults[combinedResults.length - 1];

      return { combinedResults, chartData, finalResult };
    },
    [
      Array.from(portfolioStore.assets.values()).map(a => a.enabled).join(','),
      Array.from(portfolioStore.assets.values()).map(a => JSON.stringify(a.inputs)).join('|'),
      portfolioStore.years,
      portfolioStore.startingYear,
      portfolioStore.inflationRate
    ],
    { debounceMs: 200 }
  );

  const { combinedResults = [], chartData = [], finalResult } = portfolioData || {};

  return (
    <div className="animate-fade-in">
      {/* Portfolio Summary */}
      <PortfolioSummary
        finalResult={finalResult}
        enabledAssetsCount={enabledAssets.length}
      />

      {/* Global Settings */}
      <SharedInputs />

      {/* Asset Portfolio & Breakdown */}
      <AssetBreakdownSelector finalResult={finalResult} />

      {enabledAssets.length === 0 && !isLoading ? (
        <EmptyPortfolioState />
      ) : (
        <>
          {/* Charts and tables */}
          {chartData.length > 0 && (
            <LoadingOverlay
              isLoading={isLoading}
              skeleton={<ChartSkeleton height="h-80" />}
            >
              <ProjectionChart
                data={chartData}
                showNominal={portfolioStore.showNominal}
                showReal={portfolioStore.showReal}
              />
            </LoadingOverlay>
          )}

          {/* Combined Results Table */}
          <LoadingOverlay
            isLoading={isLoading}
            skeleton={<TableSkeleton rows={parseInt(portfolioStore.years) || 10} columns={6} />}
          >
            <CombinedProjectionTable combinedResults={combinedResults} />
          </LoadingOverlay>
        </>
      )}
    </div>
  );
});