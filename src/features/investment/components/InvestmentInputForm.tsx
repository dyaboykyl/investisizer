import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface InvestmentInputFormProps {
  asset: Investment;
}

export const InvestmentInputForm: React.FC<InvestmentInputFormProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();

  const handleSave = () => {
    portfolioStore.save();
  };

  const handleInputChange = <K extends keyof typeof asset.inputs>(key: K, value: typeof asset.inputs[K]) => {
    asset.updateInput(key, value);
  };
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Input Parameters" icon={icon} className="animate-slide-up">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Initial Amount ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={asset.inputs.initialAmount}
              onChange={(e) => handleInputChange('initialAmount', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Annual Rate of Return (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={asset.inputs.rateOfReturn}
              onChange={(e) => handleInputChange('rateOfReturn', e.target.value)}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div className="group max-w-xs">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Annual Contribution/Withdrawal ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={asset.inputs.annualContribution}
              onChange={(e) => handleInputChange('annualContribution', e.target.value)}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>

          {/* Inflation-adjusted contributions toggle */}
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={asset.inflationAdjustedContributions}
                onChange={(e) => {
                  asset.setInflationAdjustedContributions(e.target.checked);
                }}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Inflation-Adjusted
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Maintain constant purchasing power
                </p>
              </div>
            </label>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Use negative values for withdrawals
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 group"
      >
        <span>Save Asset</span>
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </CollapsibleSection>
  );
});