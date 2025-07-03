import { observer } from 'mobx-react-lite';
import React from 'react';
import { Asset } from '../../stores/Asset';
import { ProjectionChart } from '../ProjectionChart';
import { ResultsTable } from '../investment/ResultsTable';

interface AssetProjectionResultsProps {
  asset: Asset;
}

export const AssetProjectionResults: React.FC<AssetProjectionResultsProps> = observer(({ asset }) => {
  if (!asset.hasResults) {
    return null;
  }

  return (
    <>
      <ProjectionChart data={asset.results} />
      <ResultsTable results={asset.results} />
    </>
  );
});