import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { PercentageInput, YearInput, CurrencyInput } from '@/features/shared/components/forms';

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
        <PercentageInput
          label="Interest Rate (%)"
          value={asset.inputs.interestRate || ''}
          onChange={(value) => asset.updateInput('interestRate', value)}
        />

        <YearInput
          label="Loan Term (years)"
          value={asset.inputs.loanTerm || ''}
          onChange={(value) => asset.updateInput('loanTerm', value)}
          allowDecimals={false}
        />

        <div className="md:col-span-2">
          <CurrencyInput
            label="Total Monthly Payment ($)"
            value={asset.inputs.monthlyPayment || asset.calculatedPrincipalInterestPayment.toString()}
            onChange={(value) => asset.updateInput('monthlyPayment', value)}
            placeholder={`${asset.calculatedPrincipalInterestPayment.toLocaleString()} (calculated P+I)`}
            helpText="Auto-filled with calculated P+I. Edit to include taxes, insurance, and other fees."
          />
        </div>
      </div>
    </CollapsibleSection>
  );
});