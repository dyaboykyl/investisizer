import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedPercentageInput, ValidatedYearInput, ValidatedCurrencyInput } from '@/features/shared/components/forms';
import { createPropertyValidationConfig } from '@/features/shared/validation';
import { useFormValidation } from '@/features/shared/validation/hooks';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface PropertyMortgageSectionProps {
  asset: Property;
}

export const PropertyMortgageSection: React.FC<PropertyMortgageSectionProps> = observer(({ asset }) => {
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  return (
    <CollapsibleSection title="Mortgage & Financing" icon={icon}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidatedPercentageInput
          label="Interest Rate"
          value={asset.inputs.interestRate || ''}
          onChange={(value) => asset.updateInput('interestRate', value)}
          validationContext={validationContext}
          fieldName="mortgageRate"
          validateOnBlur={true}
          required={true}
          helpText="Annual interest rate for the mortgage"
          highValueWarning={{ threshold: 10, message: 'Interest rate above 10% is very high' }}
        />

        <ValidatedYearInput
          label="Loan Term"
          value={asset.inputs.loanTerm || ''}
          onChange={(value) => asset.updateInput('loanTerm', value)}
          validationContext={validationContext}
          fieldName="mortgageTermYears"
          validateOnBlur={true}
          required={true}
          helpText="Length of mortgage in years"
          minYear={1}
          maxYear={50}
        />

        <div className="md:col-span-2">
          <ValidatedCurrencyInput
            label="Total Monthly Payment"
            value={asset.inputs.monthlyPayment || asset.calculatedPrincipalInterestPayment.toString()}
            onChange={(value) => asset.updateInput('monthlyPayment', value)}
            validationContext={validationContext}
            fieldName="monthlyPayment"
            validateOnBlur={true}
            placeholder={`${asset.calculatedPrincipalInterestPayment.toLocaleString()} (calculated P+I)`}
            helpText="Auto-filled with calculated P+I. Edit to include taxes, insurance, and other fees."
          />
        </div>
      </div>
    </CollapsibleSection>
  );
});