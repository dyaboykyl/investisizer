import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface PropertyBasicsSectionProps {
  asset: Property;
}

export const PropertyBasicsSection: React.FC<PropertyBasicsSectionProps> = observer(({ asset }) => {
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  return (
    <CollapsibleSection title="Property Details" icon={icon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Years Ago Bought
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={asset.inputs.yearsBought || ''}
              onChange={(e) => {
                asset.updateInput('yearsBought', e.target.value);
              }}
              className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">years</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Property Growth Rate (% per year)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.propertyGrowthRate || ''}
              onChange={(e) => {
                asset.updateInput('propertyGrowthRate', e.target.value);
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
            Purchase Price ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.purchasePrice || ''}
              onChange={(e) => {
                asset.updateInput('purchasePrice', e.target.value);
              }}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Down Payment (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.downPaymentPercentage || ''}
              onChange={(e) => {
                asset.updateInput('downPaymentPercentage', e.target.value);
              }}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
});