import { InvestmentInputForm } from '@/features/investment/components/InvestmentInputForm';
import { InvestmentProjectionResults } from '@/features/investment/components/InvestmentProjectionResults';
import { InvestmentSummary } from '@/features/investment/components/InvestmentSummary';
import { Investment } from '@/features/investment/stores/Investment';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface InvestmentAnalysisProps {
  asset: Investment;
}

export const InvestmentAnalysis: React.FC<InvestmentAnalysisProps> = observer(({ asset }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <input
            type="text"
            value={asset.name}
            onChange={(e) => {
              asset.setName(e.target.value);
            }}
            className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 px-2 py-1 text-gray-900 dark:text-white outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={asset.enabled}
              onChange={(e) => {
                asset.setEnabled(e.target.checked);
              }}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include in portfolio
            </span>
          </label>
        </div>
      </div>

      {asset.hasResults && <InvestmentSummary asset={asset} />}
      <InvestmentInputForm asset={asset} />
      <InvestmentProjectionResults asset={asset} />
    </div>
  );
});