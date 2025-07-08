import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedCurrencyInput, ValidatedPercentageInput, ValidatedCheckboxInput } from '@/features/shared/components/forms';
import { ExpenseBreakdown, VacancyImpactDisplay } from './rental';
import { createPropertyValidationConfig } from '@/features/shared/validation';
import { useFormValidation } from '@/features/shared/validation/hooks';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface PropertyRentalManagementProps {
  asset: Property;
}

export const PropertyRentalManagement: React.FC<PropertyRentalManagementProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  // Set up validation
  const validationConfig = createPropertyValidationConfig();
  const validationContext = {
    isRentalProperty: asset.inputs.isRentalProperty,
    projectionYears: portfolioStore.years,
    propertyGrowthModel: asset.inputs.propertyGrowthModel
  };
  
  // Setup validation (can be expanded for form-level validation)
  useFormValidation(validationConfig, validationContext);

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
        <ValidatedCheckboxInput
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
          validationContext={validationContext}
          fieldName="isRentalProperty"
          helpText="Enable to track rental income, expenses, and cash flow contributions to linked investments."
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
                <ValidatedCurrencyInput
                  label="Monthly Rent"
                  value={asset.inputs.monthlyRent || ''}
                  onChange={(value) => asset.updateInput('monthlyRent', value)}
                  validationContext={validationContext}
                  fieldName="monthlyRent"
                  validateOnBlur={true}
                  required={true}
                  helpText="Monthly rental income before expenses"
                />

                <ValidatedPercentageInput
                  label="Rent Growth Rate (% per year)"
                  value={asset.inputs.rentGrowthRate || ''}
                  onChange={(value) => asset.updateInput('rentGrowthRate', value)}
                  validationContext={validationContext}
                  fieldName="rentGrowthRate"
                  validateOnBlur={true}
                  helpText="Expected annual rent increase rate"
                  highValueWarning={{ threshold: 8, message: 'Rent growth above 8% annually is very optimistic' }}
                />

                <ValidatedPercentageInput
                  label="Vacancy Rate"
                  value={asset.inputs.vacancyRate || ''}
                  onChange={(value) => asset.updateInput('vacancyRate', value)}
                  validationContext={validationContext}
                  fieldName="vacancyRate"
                  validateOnBlur={true}
                  helpText="Expected percentage of time the property will be vacant"
                  highValueWarning={{ threshold: 15, message: 'Vacancy rate above 15% is very high' }}
                />

                <ValidatedPercentageInput
                  label="Maintenance Rate (% of property value)"
                  value={asset.inputs.maintenanceRate || ''}
                  onChange={(value) => asset.updateInput('maintenanceRate', value)}
                  validationContext={validationContext}
                  fieldName="maintenanceRate"
                  validateOnBlur={true}
                  helpText="Annual maintenance and repairs. Typical range: 1-3%"
                  highValueWarning={{ threshold: 4, message: 'Maintenance rate above 4% is very high' }}
                />

                {/* Property Management Section */}
                <div className="md:col-span-2">
                  <ValidatedCheckboxInput
                    label="Enable Property Management Services"
                    checked={asset.inputs.propertyManagementEnabled}
                    onChange={(checked) => asset.updateInput('propertyManagementEnabled', checked)}
                    validationContext={validationContext}
                    fieldName="propertyManagementEnabled"
                    helpText="Include professional property management fees for tenant placement and monthly management."
                  />

                  {asset.inputs.propertyManagementEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <ValidatedPercentageInput
                        label="Listing Fee (% of monthly rent)"
                        value={asset.inputs.listingFeeRate || ''}
                        onChange={(value) => asset.updateInput('listingFeeRate', value)}
                        validationContext={validationContext}
                        fieldName="listingFeeRate"
                        validateOnBlur={true}
                        helpText="Fee for finding new tenants. Typical: 50-150%"
                        highValueWarning={{ threshold: 200, message: 'Listing fee above 200% is very high' }}
                      />

                      <ValidatedPercentageInput
                        label="Monthly Management Fee (% of rent)"
                        value={asset.inputs.monthlyManagementFeeRate || ''}
                        onChange={(value) => asset.updateInput('monthlyManagementFeeRate', value)}
                        validationContext={validationContext}
                        fieldName="monthlyManagementFeeRate"
                        validateOnBlur={true}
                        helpText="Monthly management fee. Typical: 8-12%"
                        highValueWarning={{ threshold: 20, message: 'Management fee above 20% is very high' }}
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