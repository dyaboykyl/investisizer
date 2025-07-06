import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface PropertyRentalSectionProps {
  asset: Property;
}

export const PropertyRentalSection: React.FC<PropertyRentalSectionProps> = observer(({ asset }) => {
  const icon = (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  return (
    <CollapsibleSection title="Rental Property Settings" icon={icon}>
      <div className="space-y-6">
        {/* Rental Property Toggle */}
        <div className="group">
          <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            <input
              type="checkbox"
              checked={asset.inputs.isRentalProperty}
              onChange={(e) => {
                asset.updateInput('isRentalProperty', e.target.checked);
              }}
              className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>This is a rental property</span>
            </div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
            Enable to track rental income, expenses, and cash flow contributions to linked investments.
          </p>
        </div>

        {asset.inputs.isRentalProperty && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Rental Settings */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monthly Rent ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.monthlyRent || ''}
                  onChange={(e) => {
                    asset.updateInput('monthlyRent', e.target.value);
                  }}
                  className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rent Growth Rate (% per year)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.rentGrowthRate || ''}
                  onChange={(e) => {
                    asset.updateInput('rentGrowthRate', e.target.value);
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
                Vacancy Rate (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.vacancyRate || ''}
                  onChange={(e) => {
                    asset.updateInput('vacancyRate', e.target.value);
                  }}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expected percentage of time the property will be vacant.
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Maintenance Rate (% of property value)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.maintenanceRate || ''}
                  onChange={(e) => {
                    asset.updateInput('maintenanceRate', e.target.value);
                  }}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Annual maintenance and repairs. Typical range: 1-3%.
              </p>
            </div>

            {/* Property Management Section */}
            <div className="group md:col-span-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <input
                  type="checkbox"
                  checked={asset.inputs.propertyManagementEnabled}
                  onChange={(e) => {
                    asset.updateInput('propertyManagementEnabled', e.target.checked);
                  }}
                  className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                Enable Property Management Services
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Include professional property management fees for tenant placement and monthly management.
              </p>

              {asset.inputs.propertyManagementEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Listing Fee (% of monthly rent)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.]?[0-9]*"
                        value={asset.inputs.listingFeeRate || ''}
                        onChange={(e) => {
                          asset.updateInput('listingFeeRate', e.target.value);
                        }}
                        className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Fee for finding new tenants. Typical: 50-150%.
                    </p>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Management Fee (% of rent)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.]?[0-9]*"
                        value={asset.inputs.monthlyManagementFeeRate || ''}
                        onChange={(e) => {
                          asset.updateInput('monthlyManagementFeeRate', e.target.value);
                        }}
                        className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Monthly management fee. Typical: 8-12%.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
});