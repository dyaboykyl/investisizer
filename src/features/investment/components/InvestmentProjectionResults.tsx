import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { ProjectionChart } from '@/features/shared/components/ProjectionChart';
import { ResultsTable } from '@/features/investment/components/ResultsTable';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { useComputationLoading } from '@/features/shared/hooks/useAsyncComputed';
import { LoadingOverlay, ChartSkeleton, TableSkeleton } from '@/features/shared/components/LoadingStates';

interface InvestmentProjectionResultsProps {
  asset: Investment;
}

export const InvestmentProjectionResults: React.FC<InvestmentProjectionResultsProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  // Use computation loading for heavy calculations
  const { result: computedResults, isLoading } = useComputationLoading(
    asset,
    () => asset.results,
    [
      asset.inputs.initialAmount,
      asset.inputs.rateOfReturn,
      asset.inputs.annualContribution,
      asset.inputs.inflationRate,
      asset.inflationAdjustedContributions,
      portfolioStore.years,
      portfolioStore.startingYear,
      asset.linkedPropertyCashFlows.join(',') // Track changes in linked cash flows
    ],
    150 // Minimum loading time for better UX
  );
  
  if (!asset.hasResults && !isLoading) {
    return null;
  }

  const results = computedResults || asset.results;

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isLoading={isLoading}
        skeleton={<ChartSkeleton height="h-64" />}
      >
        <ProjectionChart 
          data={results} 
          showNominal={portfolioStore.showNominal}
          showReal={portfolioStore.showReal}
        />
      </LoadingOverlay>
      
      <LoadingOverlay
        isLoading={isLoading}
        skeleton={<TableSkeleton rows={parseInt(portfolioStore.years) || 10} columns={5} />}
      >
        <ResultsTable results={results} />
      </LoadingOverlay>
    </div>
  );
});