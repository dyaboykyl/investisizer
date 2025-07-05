import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { ProjectionChart } from '@/features/shared/components/ProjectionChart';
import { ResultsTable } from '@/features/investment/components/ResultsTable';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface InvestmentProjectionResultsProps {
  asset: Investment;
}

export const InvestmentProjectionResults: React.FC<InvestmentProjectionResultsProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  if (!asset.hasResults) {
    return null;
  }

  return (
    <>
      <ProjectionChart 
        data={asset.results} 
        showNominal={portfolioStore.showNominal}
        showReal={portfolioStore.showReal}
      />
      <ResultsTable results={asset.results} />
    </>
  );
});