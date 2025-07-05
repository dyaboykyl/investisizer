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

export const CombinedPortfolioView: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { combinedResults, enabledAssets } = portfolioStore;

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
    annualInvestmentGain: result.totalYearlyGain - result.totalAnnualContribution, // Calculate from available data
    realAnnualInvestmentGain: result.totalRealYearlyGain - result.totalRealAnnualContribution // Calculate from available data
  }));

  const finalResult = combinedResults[combinedResults.length - 1];

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

      {enabledAssets.length === 0 ? (
        <EmptyPortfolioState />
      ) : (
        <>
          {/* Charts and tables */}
          {chartData.length > 0 && (
            <ProjectionChart
              data={chartData}
              showNominal={portfolioStore.showNominal}
              showReal={portfolioStore.showReal}
            />
          )}

          {/* Combined Results Table */}
          <CombinedProjectionTable combinedResults={combinedResults} />
        </>
      )}
    </div>
  );
});