import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { CurrencyInput, PercentageInput, CheckboxInput } from '@/features/shared/components/forms';
import { ExpenseBreakdown, VacancyImpactDisplay } from './rental';

interface PropertyRentalManagementProps {
  asset: Property;
}

export const PropertyRentalManagement: React.FC<PropertyRentalManagementProps> = observer(({ asset }) => {
  const icon = (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  // Component state - most calculations now handled in child components

  return (
    <CollapsibleSection title="Rental Property Management" icon={icon} defaultExpanded={false}>
      <div className="space-y-6">
        {/* Rental Property Toggle */}
        <CheckboxInput
          label={
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>This is a rental property</span>
            </div>
          }
          checked={asset.inputs.isRentalProperty}
          onChange={(checked) => asset.updateInput('isRentalProperty', checked)}
          description="Enable to track rental income, expenses, and cash flow contributions to linked investments."
        />

        {asset.inputs.isRentalProperty && (
          <>
            {/* Rental Settings Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                Rental Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Rental Settings */}
                <CurrencyInput
                  label="Monthly Rent ($)"
                  value={asset.inputs.monthlyRent || ''}
                  onChange={(value) => asset.updateInput('monthlyRent', value)}
                />

                <PercentageInput
                  label="Rent Growth Rate (% per year)"
                  value={asset.inputs.rentGrowthRate || ''}
                  onChange={(value) => asset.updateInput('rentGrowthRate', value)}
                />

                <PercentageInput
                  label="Vacancy Rate (%)"
                  value={asset.inputs.vacancyRate || ''}
                  onChange={(value) => asset.updateInput('vacancyRate', value)}
                  helpText="Expected percentage of time the property will be vacant."
                />

                <PercentageInput
                  label="Maintenance Rate (% of property value)"
                  value={asset.inputs.maintenanceRate || ''}
                  onChange={(value) => asset.updateInput('maintenanceRate', value)}
                  helpText="Annual maintenance and repairs. Typical range: 1-3%."
                />

                {/* Property Management Section */}
                <div className="md:col-span-2">
                  <CheckboxInput
                    label="Enable Property Management Services"
                    checked={asset.inputs.propertyManagementEnabled}
                    onChange={(checked) => asset.updateInput('propertyManagementEnabled', checked)}
                    description="Include professional property management fees for tenant placement and monthly management."
                  />

                  {asset.inputs.propertyManagementEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <PercentageInput
                        label="Listing Fee (% of monthly rent)"
                        value={asset.inputs.listingFeeRate || ''}
                        onChange={(value) => asset.updateInput('listingFeeRate', value)}
                        helpText="Fee for finding new tenants. Typical: 50-150%."
                      />

                      <PercentageInput
                        label="Monthly Management Fee (% of rent)"
                        value={asset.inputs.monthlyManagementFeeRate || ''}
                        onChange={(value) => asset.updateInput('monthlyManagementFeeRate', value)}
                        helpText="Monthly management fee. Typical: 8-12%."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Breakdown Section */}
            <ExpenseBreakdown asset={asset} />
            
            {/* Vacancy Impact Section */}
            <VacancyImpactDisplay asset={asset} />
          </>
        )}
      </div>
    </CollapsibleSection>
  );
});