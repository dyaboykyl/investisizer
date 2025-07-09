# Currency Formatting Implementation Plan

## Overview
Create a shared currency formatting component and utility to ensure consistent currency display throughout the application. The formatting rule is:
- **4+ digits**: No decimal places (e.g., `$1,234`, `$10,000`)
- **< 4 digits**: Two decimal places (e.g., `$123.45`, `$99.99`)

## Technical Approach

### 1. Core Utility Function
Create a `formatCurrency` utility function that:
- Takes a number and optional options
- Returns formatted string based on digit count
- Handles edge cases (negative numbers, zero, null/undefined)

### 2. React Component
Create a `CurrencyDisplay` component that:
- Wraps the utility function
- Provides consistent styling options
- Supports different display modes (inline, block, etc.)
- Handles color coding for positive/negative values

### 3. Integration Strategy
- Replace all `.toLocaleString()` calls for currency values
- Update components systematically:
  - `PropertySummary.tsx` (primary target)
  - `PortfolioSummary.tsx`
  - Results tables and charts
  - Input components (where applicable)

## Implementation Details

### Utility Function Location
`src/features/shared/utils/formatCurrency.ts`

### Component Location
`src/features/shared/components/CurrencyDisplay.tsx`

### Key Features
- Consistent formatting rules
- TypeScript support
- Configurable options (prefix, suffix, color coding)
- Performance optimized
- Accessibility considerations

## Testing Strategy
- Unit tests for utility function
- Component tests for React component
- Integration tests for existing components
- Visual regression testing

## Rollout Plan
1. Create utility function and component
2. Update PropertySummary.tsx as proof of concept
3. Systematically replace other currency displays
4. Update any remaining `.toLocaleString()` calls
5. Add comprehensive tests

## Potential Challenges
- Identifying all currency display locations
- Ensuring consistent behavior across different number types
- Handling edge cases (very large numbers, scientific notation)
- Maintaining backwards compatibility during transition