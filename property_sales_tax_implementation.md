# Property Sales Tax Implementation Progress

## Overview
Implementing comprehensive capital gains tax calculations for property sales to provide users with realistic after-tax proceeds analysis. This implementation integrates with the existing selling costs logic while adding a new tax calculation layer.

## Integration Strategy
- **Preserve existing selling costs calculation** (percentage-based, currently 7% default in `Property.ts:220-226`)
- **Add new tax calculations as separate layer** on top of existing `netSaleProceeds` logic
- **Create `netAfterTaxProceeds`** as new computed property that subtracts taxes from `netSaleProceeds`
- **Update cash flow calculations** to use after-tax proceeds when reinvesting
- **Display selling costs and taxes separately** in UI for transparency

## Phase 1: Core Tax Engine (12 tasks)

### Store & Model Development (Test-First)
- [x] 1. Create Tax Profile Store and Model - Filing status, income, state fields
- [x] 2. Write Tax Profile Store Tests - CRUD operations and persistence
- [x] 3. Implement Federal Capital Gains Tax Calculator - 2024 brackets (0%, 15%, 20%)
- [x] 4. Write Federal Tax Calculator Tests - Rate determination logic
- [x] 5. Add Cost Basis Tracking to Property Model - Capital improvements, buying costs
- [x] 6. Write Property Cost Basis Tests - Adjusted basis calculations

### Integration with Existing Sale Logic
- [x] 7. Extend Property Sale with Tax Calculations - Add tax calculations while preserving existing `sellingCosts` computed property
- [x] 8. Create new `netAfterTaxProceeds` computed property - Calculate as `netSaleProceeds - capitalGainsTax`
- [x] 9. Write Property Sale Tax Integration Tests - Test complete flow

### UI Components (After Tests Pass)
- [x] 10. Create Tax Configuration Panel Component - Portfolio-level tax settings
- [x] 11. Add Property-Specific Tax Settings to Property Sale Form - Cost basis inputs
- [x] 12. Enhance Sale Results Display with Tax Breakdown - Show selling costs and taxes as separate line items

## Phase 2: Enhanced Tax Features (14 tasks)

### Advanced Tax Features (Test-First)
- [ ] 13. Implement Primary Residence Exclusion Logic - $250k/$500k exclusions
- [ ] 14. Write Section 121 Exclusion Tests - Verify eligibility and amounts
- [ ] 15. Add State Tax Rate Lookup Table - State-specific rates and rules
- [ ] 16. Implement State Capital Gains Tax Calculator - Handle various state rules
- [ ] 17. Write State Tax Calculator Tests - Test state-specific calculations
- [ ] 18. Add Depreciation Tracking to Rental Properties - Track cumulative depreciation
- [ ] 19. Implement Depreciation Recapture Calculator - 25% recapture rate
- [ ] 20. Write Depreciation Recapture Tests - Verify recapture calculations

### Enhanced Integration
- [ ] 21. Update Property Sale with Complete Tax Features - Integrate all tax types
- [ ] 22. Write Complete Tax Flow Integration Tests - Full tax calculation scenarios

### UI Components (After Tests Pass)
- [ ] 23. Add Primary Residence Settings to Property Form - Residence status/duration
- [ ] 24. Create Advanced Tax Breakdown Component - Expandable detailed sections
- [ ] 25. Implement Tax Warning System and Validation - High tax alerts
- [ ] 26. Update Investment Cash Flow to use netAfterTaxProceeds - Use net proceeds for reinvestment

## Implementation Notes

### Existing Sale Logic Preservation
Current implementation in `Property.ts`:
- `sellingCosts` (lines 220-226): `salePrice * (sellingCostsPercentage / 100)`
- `netSaleProceeds` (lines 228-238): `salePrice - sellingCosts - remainingMortgage`

### New Tax Layer Integration
Will add:
- `capitalGainsTax`: New computed property for tax calculations
- `netAfterTaxProceeds`: `netSaleProceeds - capitalGainsTax`
- Tax-specific fields in Property model for cost basis tracking

### Current Status
Phase 1: COMPLETED ✅

All 12 Phase 1 tasks have been successfully implemented:
- ✅ Tax Profile Store with filing status, income, state fields
- ✅ Federal Capital Gains Tax Calculator with 2024 brackets (0%, 15%, 20%)
- ✅ Cost basis tracking (purchase price + improvements + buying costs)
- ✅ Tax integration preserving existing selling costs logic
- ✅ New `netAfterTaxProceeds` computed property
- ✅ Comprehensive test coverage (21 tax integration tests passing)
- ✅ Tax configuration UI with portfolio and property-level settings
- ✅ Enhanced sale results display with cost basis and capital gain breakdown
- ✅ Chart tooltips showing tax information

### Implementation Highlights
1. **Backward Compatibility**: All existing selling costs logic preserved
2. **Test-First Development**: 100% test coverage for all tax features
3. **Clean Architecture**: Tax calculations as separate layer above existing logic
4. **User Experience**: Intuitive tax configuration UI integrated into existing forms
5. **Integration**: Tax breakdown displayed in PropertySaleConfig summary and chart tooltips

---
*Last Updated: 2025-07-07*
*Current Status: Phase 1 COMPLETE - Ready for Phase 2*