import { observer } from 'mobx-react-lite';
import React from 'react';
import { useInvestmentStore } from '../../stores/hooks';
import { ProjectionChart } from '../ProjectionChart';
import { ResultsTable } from './ResultsTable';

export const ProjectionResults: React.FC = observer(() => {
  const store = useInvestmentStore();

  if (!store.hasResults) {
    return null;
  }

  return (
    <>
      <ProjectionChart data={store.results} />
      <ResultsTable results={store.results} />
    </>
  );
});