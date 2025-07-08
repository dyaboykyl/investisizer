# Generic Table System Implementation

## Objective
Create a reusable table component system to reduce code duplication and provide consistent styling across all table implementations in the finance analysis application.

## Current State Analysis
- **Problem**: Table implementations are duplicated across InvestmentTableHeader/Body, PropertyResultsTable, and CombinedProjectionTable
- **Duplication**: ~70% similar code for styling, responsive design, and basic table structure
- **Opportunity**: Extract common patterns into reusable components

## Solution Architecture

### Core Components Structure

```typescript
// src/features/shared/components/tables/
├── Table.tsx                 // Main table container with CollapsibleSection integration
├── TableHeader.tsx           // Header with dual-value column support
├── TableBody.tsx             // Body with alternating rows and hover effects
├── TableRow.tsx              // Individual row with alternating colors
├── TableCell.tsx             // Cell with formatting and styling
├── FinancialTable.tsx        // Pre-configured for financial data
├── types.ts                  // TypeScript interfaces
└── index.ts                  // Barrel exports
```

### Key Features

#### 1. **Dual-Value Column Support**
- Automatic Nominal/Real column pairs
- Conditional rendering based on portfolio settings
- Consistent border styling between columns

#### 2. **Flexible Column Configuration**
```typescript
interface ColumnDefinition<T> {
  key: string;
  label: string;
  type: 'currency' | 'text' | 'year' | 'percentage';
  alignment?: 'left' | 'center' | 'right';
  sticky?: boolean;
  conditionalRender?: (data: T) => boolean;
  formatter?: (value: any, row: T) => string;
  colorize?: (value: any, row: T) => string;
}
```

#### 3. **Responsive Design**
- Mobile-first approach with `px-3 md:px-6` spacing
- Horizontal scrolling on mobile with `overflow-x-auto`
- Consistent responsive typography

#### 4. **Theming Support**
- Dark/light mode compatibility
- Consistent color palette for positive/negative values
- Alternating row colors with hover effects

#### 5. **Portfolio Store Integration**
- Automatic integration with `usePortfolioStore()`
- Nominal/Real column visibility management
- Observer pattern for reactive updates

## Implementation Plan

### Phase 1: Core Components ✅
- ✅ Create type definitions and interfaces
- ✅ Implement TableCell with formatting and styling
- ✅ Implement TableRow with alternating colors
- ✅ Implement TableHeader with dual-value support
- ✅ Implement TableBody with data rendering
- ✅ Create main Table component with CollapsibleSection
- ✅ Create FinancialTable for financial data

### Phase 2: Documentation and Testing ✅
- ✅ Create comprehensive documentation
- ✅ Add usage examples
- ✅ Test compilation and basic functionality (build successful)
- ✅ Verify responsive design (follows existing patterns)

### Phase 3: Migration
- [ ] Refactor CombinedProjectionTable to use generic system
- [ ] Refactor InvestmentTableHeader/Body to use generic system
- [ ] Refactor PropertyResultsTable to use generic system
- [ ] Verify all functionality is preserved

### Phase 4: Optimization
- [ ] Bundle size analysis
- [ ] Performance testing
- [ ] Accessibility improvements

## Usage Examples

### Basic Table
```typescript
const columns: ColumnDefinition[] = [
  { key: 'year', label: 'Year', type: 'year', sticky: true },
  { key: 'value', label: 'Value', type: 'currency', alignment: 'right' }
];

<Table 
  data={data}
  columns={columns}
  title="Basic Table"
/>
```

### Financial Table with Dual Values
```typescript
const dualValueColumns: DualValueColumn[] = [
  {
    key: 'balance',
    label: 'Balance',
    nominalKey: 'balanceNominal',
    realKey: 'balanceReal',
    type: 'currency',
    alignment: 'right'
  }
];

<FinancialTable
  data={data}
  columns={baseColumns}
  dualValueColumns={dualValueColumns}
  title="Investment Analysis"
/>
```

### Custom Table with Conditional Rendering
```typescript
const columns: ColumnDefinition[] = [
  {
    key: 'rentalIncome',
    label: 'Rental Income',
    type: 'currency',
    conditionalRender: (data) => data.isRentalProperty,
    colorize: (value) => value > 0 ? 'text-green-600' : 'text-red-600'
  }
];
```

## Expected Benefits

### Code Reduction
- **Estimated 60-70% reduction** in table-related code
- **Consistent styling** across all tables
- **Single source of truth** for table behavior

### Maintainability
- **Centralized styling** - changes apply to all tables
- **Type safety** - TypeScript interfaces prevent errors
- **Reusable patterns** - consistent API across tables

### Performance
- **Smaller bundle size** through code deduplication
- **Optimized rendering** with proper React patterns
- **Better tree shaking** with focused components

## Migration Strategy

### Step 1: CombinedProjectionTable (Simplest)
- Most straightforward migration
- No conditional columns
- Good test case for basic functionality

### Step 2: InvestmentTableHeader/Body (Medium)
- Dual-value column pattern
- Portfolio store integration
- Property cash flow conditional rendering

### Step 3: PropertyResultsTable (Most Complex)
- Complex conditional columns
- Sticky positioning
- Rental property logic
- Status indicators

## Technical Considerations

### TypeScript Support
- Generic components for type safety
- Proper inference for data types
- Compile-time validation

### Responsive Design
- Mobile-first approach
- Consistent breakpoints
- Proper overflow handling

### Accessibility
- Proper table semantics
- ARIA labels where needed
- Keyboard navigation support

### Performance
- Memo optimization for large datasets
- Efficient re-rendering patterns
- Lazy loading potential

## Testing Strategy

### Unit Tests
- Individual component functionality
- Data formatting and display
- Conditional rendering logic

### Integration Tests
- Portfolio store integration
- Theme switching
- Responsive behavior

### Visual Tests
- Consistent styling across themes
- Proper alignment and spacing
- Mobile responsiveness

## Progress Tracking

### ✅ Completed
- [x] Core component architecture
- [x] Type definitions and interfaces
- [x] Basic table components (Table, TableHeader, TableBody, TableRow, TableCell)
- [x] Financial table wrapper
- [x] Dual-value column support
- [x] Documentation
- [x] Compilation and basic testing (build successful)
- [x] Usage examples and validation

### 🔄 In Progress
- [ ] Table system migration to existing tables

### ⏳ Pending
- [ ] Table system refactoring migration
- [ ] Performance optimization
- [ ] Accessibility enhancements

## Notes
- All components use observer pattern for MobX integration
- Responsive design follows existing application patterns
- Color system matches current application theme
- Bundle size impact should be minimal due to code deduplication