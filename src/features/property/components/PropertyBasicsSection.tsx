import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedYearInput, ValidatedPercentageInput, ValidatedCurrencyInput } from '@/features/shared/components/forms';
import { createPropertyValidationConfig } from '@/features/shared/validation';
import { useFormValidation } from '@/features/shared/validation/hooks';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface PropertyBasicsSectionProps {
  asset: Property;
}

export const PropertyBasicsSection: React.FC<PropertyBasicsSectionProps> = observer(({ asset }) => {
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
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  return (
    <CollapsibleSection title="Property Details" icon={icon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidatedYearInput
          label="Years Ago Bought"
          value={asset.inputs.yearsBought || ''}
          onChange={(value) => asset.updateInput('yearsBought', value)}
          validationContext={validationContext}
          fieldName="yearsBought"
          validateOnBlur={true}
          helpText="How many years ago was this property purchased?"
        />

        <ValidatedPercentageInput
          label="Property Growth Rate (% per year)"
          value={asset.inputs.propertyGrowthRate || ''}
          onChange={(value) => asset.updateInput('propertyGrowthRate', value)}
          validationContext={validationContext}
          fieldName="propertyGrowthRate"
          validateOnBlur={true}
          helpText="Expected annual appreciation rate"
          highValueWarning={{ threshold: 10, message: 'Growth rate above 10% is very optimistic' }}
        />

        <ValidatedCurrencyInput
          label="Purchase Price"
          value={asset.inputs.purchasePrice || ''}
          onChange={(value) => asset.updateInput('purchasePrice', value)}
          validationContext={validationContext}
          fieldName="purchasePrice"
          validateOnBlur={true}
          required={true}
          helpText="Total purchase price of the property"
        />

        <ValidatedPercentageInput
          label="Down Payment"
          value={asset.inputs.downPaymentPercentage || ''}
          onChange={(value) => asset.updateInput('downPaymentPercentage', value)}
          validationContext={validationContext}
          fieldName="downPaymentPercentage"
          validateOnBlur={true}
          required={true}
          helpText="Percentage of purchase price paid as down payment"
          highValueWarning={{ threshold: 40, message: 'Down payment above 40% is unusually high' }}
        />
      </div>
    </CollapsibleSection>
  );
});