import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedYearInput, ValidatedPercentageInput, ValidatedNumberInput } from '@/features/shared/components/forms';
import { useFormValidation } from '@/features/shared/validation/hooks';
import { type FormValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export const SharedInputs: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  
  // Create validation config for portfolio-level settings
  const validationConfig: FormValidationConfig = {
    years: {
      rules: [rules.numeric, rules.integer, rules.positive, rules.maxValue(100)],
      required: true
    },
    inflationRate: {
      rules: [rules.numeric, rules.range(-10, 20), rules.highPercentageWarning(8, 'Inflation rate above 8% is historically high')],
      required: true
    },
    startingYear: {
      rules: [rules.numeric, rules.integer, rules.minValue(1900), rules.maxValue(new Date().getFullYear() + 20)],
      required: true
    }
  };
  
  const validationContext = {};
  
  // Setup validation (can be expanded for form-level validation)
  useFormValidation(validationConfig, validationContext);
  
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Global Settings" icon={icon}>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <ValidatedYearInput
          label="Investment Period (Years)"
          value={portfolioStore.years}
          onChange={(value) => portfolioStore.setYears(value)}
          validationContext={validationContext}
          fieldName="years"
          validateOnBlur={true}
          required={true}
          helpText="Applied to all assets in your portfolio"
          className="max-w-xs"
          minYear={1}
          maxYear={100}
        />

        <ValidatedPercentageInput
          label="Expected Inflation Rate"
          value={portfolioStore.inflationRate}
          onChange={(value) => portfolioStore.setInflationRate(value)}
          allowNegative={true}
          validationContext={validationContext}
          fieldName="inflationRate"
          validateOnBlur={true}
          required={true}
          helpText="Used for real value calculations across all assets"
          className="max-w-xs"
          highValueWarning={{ threshold: 8, message: 'Inflation rate above 8% is historically high' }}
        />
        
        <ValidatedNumberInput
          label="Starting Year"
          value={portfolioStore.startingYear}
          onChange={(value) => portfolioStore.setStartingYear(value)}
          integerOnly={true}
          allowNegative={false}
          validationContext={validationContext}
          fieldName="startingYear"
          validateOnBlur={true}
          required={true}
          helpText="First year of projections"
          className="max-w-xs"
          minValue={1900}
          maxValue={new Date().getFullYear() + 20}
        />
      </div>
    </CollapsibleSection>
  );
});