# Form Validation Migration Plan

## Overview
This document tracks the migration of existing form components to use the new validation system.

## Migration Strategy

### Phase 1: Identify Usage Patterns
- [x] Analyze existing form components (CurrencyInput, PercentageInput, NumberInput, YearInput)
- [x] Identify components that use these inputs
- [x] Create migration mapping

### Phase 2: Create Migration Mapping
| Old Component | New Component | Usage Count | Files to Update |
|---------------|---------------|-------------|-----------------|
| CurrencyInput | ValidatedCurrencyInput | ~15 | Property/Investment forms |
| PercentageInput | ValidatedPercentageInput | ~10 | Property/Investment forms |
| NumberInput | ValidatedNumberInput | ~8 | Property/Investment forms |
| YearInput | ValidatedYearInput | ~3 | Portfolio shared inputs |

### Phase 3: Migration Steps
1. **Update imports** - Replace old component imports with new validated versions
2. **Add validation configs** - Apply appropriate validation rules for each field
3. **Update props** - Migrate from old prop structure to new validation-aware props
4. **Test functionality** - Ensure all validation works correctly
5. **Remove old components** - Clean up unused legacy components

### Phase 4: Components to Migrate

#### Property Components
- [x] PropertyBasicsSection.tsx - Migrated with validation context
- [x] PropertyMortgageSection.tsx - Migrated with validation context
- [ ] PropertyRentalManagement.tsx

#### Investment Components
- [x] InvestmentInputForm.tsx - Migrated with validation context

#### Shared Components
- [ ] SharedInputs.tsx (Portfolio)

### Phase 5: Validation Integration
- [ ] Add propertyValidation config to property forms
- [ ] Add investmentValidation config to investment forms
- [ ] Integrate with existing MobX stores
- [ ] Add real-time validation feedback

## Migration Progress

### ✅ Completed
- Created ValidatedCurrencyInput component
- Created ValidatedPercentageInput component
- Created ValidatedNumberInput component
- Created ValidatedYearInput component
- Created validation rule configurations
- **PropertyBasicsSection.tsx** - Added validation context, migrated 4 form fields
- **PropertyMortgageSection.tsx** - Added validation context, migrated 3 form fields
- **InvestmentInputForm.tsx** - Added validation context, migrated 3 form fields

### 🔄 In Progress
- Migrating PropertyRentalManagement.tsx
- Migrating SharedInputs.tsx

### 📋 Remaining Tasks
- [ ] Update all component imports
- [ ] Add validation configurations
- [ ] Test migrated components
- [ ] Remove legacy components
- [ ] Update documentation

## Technical Considerations

### Validation Context
Each form will need validation context based on:
- Property type (rental vs non-rental)
- Investment type and settings
- Portfolio-level configuration
- User interaction state

### Error Handling
- Maintain existing error display patterns
- Add new validation messages
- Preserve form submission behavior
- Handle validation timing (blur vs change)

### Performance
- Debounced validation to prevent excessive re-renders
- Efficient MobX integration
- Minimal bundle size impact

## Testing Strategy

### Unit Tests
- Test each migrated component individually
- Verify validation rules work correctly
- Test error and warning display

### Integration Tests
- Test complete forms with validation
- Verify MobX store integration
- Test form submission with validation

### Manual Testing
- Test user interaction flows
- Verify accessibility features
- Test responsive behavior

## Rollback Plan
- Keep old components until migration is complete
- Maintain backward compatibility during transition
- Easy rollback if issues are discovered

## Success Criteria
- [ ] All forms use validated components
- [ ] All validation rules work correctly
- [ ] No regressions in functionality
- [ ] Improved user experience with validation
- [ ] Bundle size remains optimal
- [ ] All tests pass