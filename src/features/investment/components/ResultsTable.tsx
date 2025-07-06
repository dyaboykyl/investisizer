import { observer } from 'mobx-react-lite';
import React from 'react';
import type { InvestmentResult } from '@/features/investment/stores/Investment';
import { InvestmentTableBody } from '@/features/investment/components/InvestmentTableBody';
import { InvestmentTableHeader } from '@/features/investment/components/InvestmentTableHeader';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface ResultsTableProps {
  results: InvestmentResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = observer(({ results }) => {
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <CollapsibleSection 
      title="Projection Results" 
      icon={icon}
      className="mt-6 animate-slide-up animation-delay-200"
      defaultExpanded={false}
    >

      <div className="overflow-x-auto -mx-3 md:mx-0 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <InvestmentTableHeader />
            <InvestmentTableBody results={results} />
          </table>
        </div>
      </div>
    </CollapsibleSection>
  );
});