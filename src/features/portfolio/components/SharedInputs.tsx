import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

export const SharedInputs: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Global Settings" icon={icon}>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Investment Period (Years)
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={portfolioStore.years}
            onChange={(e) => portfolioStore.setYears(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Applied to all assets in your portfolio
          </p>
        </div>

        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Expected Inflation Rate (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={portfolioStore.inflationRate}
              onChange={(e) => portfolioStore.setInflationRate(e.target.value)}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Used for real value calculations across all assets
          </p>
        </div>
        
        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Starting Year
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={portfolioStore.startingYear}
            onChange={(e) => portfolioStore.setStartingYear(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            First year of projections
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
});