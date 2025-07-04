import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '../../stores/Investment';
import { ProjectionChart } from '../ProjectionChart';
import { ResultsTable } from '../investment/ResultsTable';
import { usePortfolioStore } from '../../stores/hooks';

interface AssetProjectionResultsProps {
  asset: Investment;
}

export const AssetProjectionResults: React.FC<AssetProjectionResultsProps> = observer(({ asset }) => {
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