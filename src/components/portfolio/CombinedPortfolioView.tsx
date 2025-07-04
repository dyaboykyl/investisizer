import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '../../stores/hooks';
import { ProjectionChart } from '../ProjectionChart';
import type { AssetCalculationResult } from '../../stores/Asset';
import { SharedInputs } from './SharedInputs';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetSelector } from './AssetSelector';
import { CombinedProjectionTable } from './CombinedProjectionTable';
import { EmptyPortfolioState } from './EmptyPortfolioState';

export const CombinedPortfolioView: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { combinedResults, enabledAssets } = portfolioStore;

  // Convert combined results to the format expected by ProjectionChart
  const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();
  const chartData: AssetCalculationResult[] = combinedResults.map(result => ({
    year: result.year,
    actualYear: startingYear + result.year,
    balance: result.totalBalance,
    realBalance: result.totalRealBalance,
    annualContribution: result.totalAnnualContribution,
    realAnnualContribution: result.totalRealAnnualContribution,
    totalEarnings: result.totalEarnings,
    realTotalEarnings: result.totalRealEarnings,
    yearlyGain: result.totalYearlyGain,
    realYearlyGain: result.totalRealYearlyGain
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

      {/* Asset Selection */}
      <AssetSelector />

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