import { Investment, type InvestmentInputs } from './Investment';
import { Property, type PropertyInputs } from './Property';

// Union type for all asset types
export type Asset = Investment | Property;
export type AssetType = 'investment' | 'property';

// Type guards for runtime type checking
export function isInvestment(asset: Asset): asset is Investment {
  return asset instanceof Investment;
}

export function isProperty(asset: Asset): asset is Property {
  return asset instanceof Property;
}

// Factory function overloads for type safety
export function createAsset(type: 'investment', name?: string, inputs?: Partial<InvestmentInputs>): Investment;
export function createAsset(type: 'property', name?: string, inputs?: Partial<PropertyInputs>): Property;
export function createAsset(type: AssetType, name?: string, inputs?: any): Asset {
  switch (type) {
    case 'investment':
      return new Investment(name, inputs);
    case 'property':
      return new Property(name, inputs);
    default:
      throw new Error(`Unknown asset type: ${type}`);
  }
}

// Factory function for creating assets from JSON data
export function createAssetFromJSON(data: any): Asset {
  switch (data.type) {
    case 'investment':
      return Investment.fromJSON(data);
    case 'property':
      return Property.fromJSON(data);
    default:
      throw new Error(`Unknown asset type: ${data.type}`);
  }
}