import { observer } from 'mobx-react-lite';
import React from 'react';
import { Asset } from '../../stores/Asset';
import { ProjectionChart } from '../ProjectionChart';
import { ResultsTable } from '../investment/ResultsTable';
import { usePortfolioStore } from '../../stores/hooks';

interface AssetProjectionResultsProps {
  asset: Asset;
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