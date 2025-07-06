import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { PropertyBasicsSection } from './PropertyBasicsSection';
import { PropertyMortgageSection } from './PropertyMortgageSection';
import { PropertyPortfolioSection } from './PropertyPortfolioSection';
import { PropertyRentalSection } from './PropertyRentalSection';
import { PropertySaleConfig } from './PropertySaleConfig';

interface PropertyInputFormProps {
  asset: Property;
}

export const PropertyInputForm: React.FC<PropertyInputFormProps> = observer(({ asset }) => {
  return (
    <>
      <PropertySaleConfig asset={asset} />
      <PropertyBasicsSection asset={asset} />
      <PropertyMortgageSection asset={asset} />
      <PropertyRentalSection asset={asset} />
      <PropertyPortfolioSection asset={asset} />
    </>
  );
});