import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { YearInput, PercentageInput, CurrencyInput } from '@/features/shared/components/forms';

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
        <YearInput
          label="Years Ago Bought"
          value={asset.inputs.yearsBought || ''}
          onChange={(value) => asset.updateInput('yearsBought', value)}
          allowDecimals={false}
        />

        <PercentageInput
          label="Property Growth Rate (% per year)"
          value={asset.inputs.propertyGrowthRate || ''}
          onChange={(value) => asset.updateInput('propertyGrowthRate', value)}
        />

        <CurrencyInput
          label="Purchase Price ($)"
          value={asset.inputs.purchasePrice || ''}
          onChange={(value) => asset.updateInput('purchasePrice', value)}
        />

        <PercentageInput
          label="Down Payment (%)"
          value={asset.inputs.downPaymentPercentage || ''}
          onChange={(value) => asset.updateInput('downPaymentPercentage', value)}
        />
      </div>
    </CollapsibleSection>
  );
});