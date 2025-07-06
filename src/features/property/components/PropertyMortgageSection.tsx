import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface PropertyMortgageSectionProps {
  asset: Property;
}

export const PropertyMortgageSection: React.FC<PropertyMortgageSectionProps> = observer(({ asset }) => {
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  return (
    <CollapsibleSection title="Mortgage & Financing" icon={icon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Interest Rate (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.interestRate || ''}
              onChange={(e) => {
                asset.updateInput('interestRate', e.target.value);
              }}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loan Term (years)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={asset.inputs.loanTerm || ''}
              onChange={(e) => {
                asset.updateInput('loanTerm', e.target.value);
              }}
              className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">years</span>
            </div>
          </div>
        </div>

        <div className="group md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Monthly Payment ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.monthlyPayment || asset.calculatedPrincipalInterestPayment.toString()}
              onChange={(e) => {
                asset.updateInput('monthlyPayment', e.target.value);
              }}
              placeholder={`${asset.calculatedPrincipalInterestPayment.toLocaleString()} (calculated P+I)`}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Auto-filled with calculated P+I. Edit to include taxes, insurance, and other fees.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
});