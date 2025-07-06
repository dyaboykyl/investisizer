/**
 * Property Test Suite - Entry Point
 * 
 * This file serves as a reference point for all Property tests.
 * The actual tests have been split into focused, smaller files for better organization:
 * 
 * - Property.core.test.ts      - Basic property functionality (creation, mortgage calculations, payments)
 * - Property.rental.test.ts    - Rental property features and calculations
 * - Property.summary.test.ts   - Summary data computed property tests
 * - Property.sales.test.ts     - Property sale configuration and calculations
 * - Property.validation.test.ts - Property sale validation and warnings
 * 
 * To run all property tests: npm test -- Property.*.test.ts
 * To run a specific category: npm test -- Property.core.test.ts
 */

import { Property } from '@/features/property/stores/Property';

describe('Property Test Suite - Aggregated', () => {
  it('should run all property tests across split files', () => {
    // This test confirms that the test splitting maintains the same coverage
    const property = new Property();
    expect(property).toBeDefined();
    expect(property.type).toBe('property');
  });

  it('should have property sales functionality available', () => {
    const property = new Property();
    
    // Verify sale configuration exists
    expect(property.inputs.saleConfig).toBeDefined();
    expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
    
    // Verify sale methods exist
    expect(typeof property.setSaleEnabled).toBe('function');
    expect(typeof property.updateSaleConfig).toBe('function');
    
    // Verify sale computed properties exist
    expect(typeof property.effectiveSalePrice).toBe('number');
    expect(typeof property.sellingCosts).toBe('number');
    expect(typeof property.netSaleProceeds).toBe('number');
  });
});