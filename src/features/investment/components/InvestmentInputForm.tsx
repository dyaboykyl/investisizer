import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedCurrencyInput, ValidatedPercentageInput } from '@/features/shared/components/forms';
import { createInvestmentValidationConfig } from '@/features/shared/validation';
import { useFormValidation } from '@/features/shared/validation/hooks';

interface InvestmentInputFormProps {
  asset: Investment;
}

export const InvestmentInputForm: React.FC<InvestmentInputFormProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();

  // Set up validation
  const validationConfig = createInvestmentValidationConfig();
  const validationContext = {
    projectionYears: portfolioStore.years
  };
  
  // Setup validation (can be expanded for form-level validation)
  useFormValidation(validationConfig, validationContext);


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
        <ValidatedCurrencyInput
          label="Initial Amount"
          value={asset.inputs.initialAmount}
          onChange={(value) => handleInputChange('initialAmount', value)}
          allowNegative={true}
          className="max-w-xs"
          validationContext={validationContext}
          fieldName="initialAmount"
          validateOnBlur={true}
          required={true}
          helpText="Starting investment amount"
        />

        <ValidatedPercentageInput
          label="Annual Rate of Return"
          value={asset.inputs.rateOfReturn}
          onChange={(value) => handleInputChange('rateOfReturn', value)}
          allowNegative={true}
          className="max-w-xs"
          validationContext={validationContext}
          fieldName="expectedReturn"
          validateOnBlur={true}
          required={true}
          helpText="Expected annual return percentage"
          highValueWarning={{ threshold: 15, message: 'Return above 15% is very optimistic' }}
          lowValueWarning={{ threshold: 0, message: 'Consider inflation impact on returns' }}
        />

        <div className="max-w-xs">
          <ValidatedCurrencyInput
            label="Annual Contribution/Withdrawal"
            value={asset.inputs.annualContribution}
            onChange={(value) => handleInputChange('annualContribution', value)}
            allowNegative={true}
            validationContext={validationContext}
            fieldName="annualContribution"
            validateOnBlur={true}
            helpText="Use negative values for withdrawals"
          />

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
        </div>
      </div>

    </CollapsibleSection>
  );
});