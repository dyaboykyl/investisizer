# PROJECT_CONTEXT.md

## Project Overview

**Investisizer** is a React-based investment and property analysis application that helps users calculate and visualize wealth growth over time. It supports comprehensive multi-asset analysis including investments and properties, sophisticated property-investment linking with cash flow integration, rental property management, property sale planning, and provides both nominal and real (inflation-adjusted) projections with advanced portfolio management capabilities.

## Architecture Overview

### Core Technologies
- **React 19.1.0** - Latest React with improved performance
- **TypeScript** - Strict type checking with ES2022 target
- **MobX 6.13.7** - Reactive state management with computed properties
- **Vite 5.4.11** - Fast development and optimized builds
- **Tailwind CSS 3.4.0** - Utility-first styling with dark mode support
- **UUID 11.1.0** - Unique identifier generation for assets
- **Jest + React Testing Library** - Comprehensive testing

### State Management Philosophy

The application uses **MobX with reactive computed properties** following these principles:

1. **Computed Properties**: All derived state (like results) are computed properties that auto-update when dependencies change
2. **Action Methods**: Store mutations are explicit actions (e.g., `setInitialAmount`)
3. **Observer Components**: React components wrapped with `observer` auto-update on store changes
4. **No Manual Calculations**: Eliminated imperative `calculateProjection()` calls in favor of reactive data flow
5. **Cross-Store Reactivity**: Store context injection enables reactive property-investment linking

### Store Architecture

**Root Store Pattern** with clear separation:

```
RootStore
├── PortfolioStore (Central orchestrator)
│   ├── Investment[] (Reactive asset instances with property cash flow integration)
│   ├── Property[] (Reactive asset instances with mortgage, rental, and sale planning)
│   ├── Combined portfolio calculations and asset breakdown
│   └── Property-investment linking with automatic cash flow transfers
└── ThemeStore (Dark/light theme with system preference detection)
```

**Key Store Features:**
- **PortfolioStore**: Central state management, asset orchestration, combined calculations
- **Investment**: Asset class with property cash flow integration and reactive projections  
- **Property**: Complex asset class with mortgage amortization, rental income/expenses, and sale planning
- **Store Context Injection**: Assets receive portfolioStore context for cross-asset reactivity
- **LocalStorage Integration**: Automatic persistence with unsaved changes tracking
- **Asset Factory**: Type-safe asset creation with Investment/Property union types

## File Organization

### Feature-Based Architecture

The codebase follows a **domain-driven feature-based structure**:

```
src/
├── features/
│   ├── core/                    # Core application infrastructure
│   │   ├── stores/             # RootStore, hooks, context management
│   │   ├── components/         # Layout, ThemeToggle, UnsavedChangesIndicator
│   │   └── theme/              # ThemeStore (dark/light mode)
│   │
│   ├── portfolio/              # Portfolio management & orchestration
│   │   ├── stores/             # PortfolioStore (central state)
│   │   ├── components/         # Combined views, multi-asset summaries
│   │   ├── navigation/         # TabBar, Tab components
│   │   └── factories/          # AssetFactory (type creation & checking)
│   │
│   ├── investment/             # Investment analysis feature
│   │   ├── stores/             # Investment class & reactive logic
│   │   └── components/         # InvestmentAnalysis, forms, tables, summaries
│   │
│   ├── property/               # Property analysis feature
│   │   ├── stores/             # Property class & comprehensive property calculations
│   │   └── components/         # Property forms, mortgage, rental, sales, expenses
│   │
│   └── shared/                 # Cross-feature utilities
│       ├── types/              # BaseAsset interface definitions
│       └── components/         # CollapsibleSection, ProjectionChart, DisplayOptions
│
├── App.tsx                     # Application root
├── main.tsx                    # Entry point with StoreProvider
└── ...
```

### Import Rules & Dependencies

**Dependency Flow:**
- **Core**: Can be imported by any feature (foundational)
- **Shared**: Can be imported by any feature (utilities)
- **Portfolio**: Can import from any feature (orchestrator)
- **Investment/Property**: Can only import from core and shared
- **No circular dependencies** between Investment and Property

**Import Patterns:**
- Use `@/` alias for all internal imports: `@/features/investment/stores/Investment`
- Direct imports from specific files (no index.ts barrel exports)
- TypeScript path mapping configured in tsconfig.app.json and vite.config.ts

## Coding Standards & Patterns

### TypeScript Usage
- **Strict mode enabled** with comprehensive type checking
- **Interface-based design** with BaseAsset defining common contracts
- **Union types** for Asset = Investment | Property
- **Type guards** (isInvestment, isProperty) for runtime type checking
- **No explicit any types** - proper type definitions throughout

### React Patterns
- **Functional components** with hooks
- **MobX observer** wrapper for reactive components
- **Custom hooks** (usePortfolioStore, useThemeStore) for store access
- **Controlled components** with form state managed in stores
- **Props interfaces** with descriptive naming (InvestmentAnalysisProps)

### MobX Reactive Patterns
```typescript
// ✅ Computed properties for derived state
get results(): InvestmentResult[] {
  return this.calculateProjection(this.startingYear, this.linkedPropertyWithdrawals);
}

// ✅ Actions for mutations
setInitialAmount = action((value: string) => {
  this.inputs.initialAmount = value;
  // Results update automatically via computed
});

// ✅ Observer components
export const InvestmentAnalysis: React.FC<Props> = observer(({ asset }) => {
  // Auto-updates when asset.results changes
  return <div>{asset.results.map(...)}</div>;
});
```

### Component Organization
- **Feature-specific components** in appropriate feature directories
- **Shared components** in features/shared/components/
- **Form components** handle their own input state via store actions
- **Summary components** display computed values reactively
- **Analysis components** orchestrate form + results + charts

### Business Logic Patterns

**Property-Investment Linking:**
- Properties can link to investments for automatic cash flow transfers
- Reactive computed property chain: Property calculations → PortfolioStore.getLinkedPropertyCashFlows() → Investment.linkedPropertyCashFlows → Investment.results  
- Automatic recalculation when any linked component changes
- Property sale proceeds can be reinvested into target investments

**Advanced Property Features:**
- **Mortgage Amortization**: Full monthly payment calculations with early payoff detection
- **Rental Income/Expenses**: Vacancy rates, rent growth, maintenance costs, property management fees  
- **Property Sale Planning**: Configurable sale timing, price methods, and proceeds reinvestment
- **Realistic Expense Modeling**: Tenant turnover frequency calculations for listing fees

**Nominal vs Real Values:**
- All calculations maintain both nominal and inflation-adjusted values
- Dynamic UI switching based on user preferences  
- Consistent naming: `balance` (nominal) vs `realBalance` (inflation-adjusted)

**Form State Management:**
- Input values stored as strings for form compatibility
- Parsed to numbers for calculations with fallback defaults
- Comprehensive validation through TypeScript and input constraints
- Collapsible form sections for organized user experience

## Testing Strategy

### Test Organization
- **Tests colocated** with source files (.test.ts/.test.tsx)
- **Store tests** focus on business logic and reactive behavior
- **Component tests** focus on user interactions and rendering
- **Integration tests** for complex property-investment linking scenarios

### Testing Patterns
```typescript
// ✅ Reactive behavior testing
it('should auto-update results when inputs change', () => {
  investment.updateInput('rateOfReturn', '10');
  // Results automatically recompute via computed property
  expect(investment.finalResult?.balance).toBeGreaterThan(initialBalance);
});

// ✅ Cross-store reactivity testing
it('should maintain property linkage when investment inputs change', () => {
  property.updateInput('linkedInvestmentId', investmentId);
  investment.updateInput('rateOfReturn', '10');
  // Property withdrawals automatically factor into new calculation
  expect(investment.results[1].annualContribution).toBe(expectedNetContribution);
});
```

### Test Configuration
- **Jest** with ts-jest for TypeScript support
- **@testing-library/react** for component testing
- **jsdom** environment for browser API simulation
- **Path mapping** configured for `@/` alias support
- **Coverage reporting** available via `npm run test:coverage`

## Build & Development

### Development Workflow
```bash
npm run dev          # Vite dev server at localhost:5173
npm run test         # Jest test suite
npm run test:watch   # TDD mode
npm run lint         # ESLint checking
npm run build        # TypeScript + production build
```

### Key Configuration Files
- **tsconfig.app.json**: TypeScript configuration with path mapping
- **vite.config.ts**: Build configuration with `@/` alias
- **jest.config.js**: Test configuration with module mapping
- **tailwind.config.js**: Styling configuration with dark mode

### Performance Considerations
- **MobX computed caching** eliminates redundant calculations
- **Reactive updates** only re-render affected components
- **Vite code splitting** for optimized bundle sizes
- **Lazy loading** patterns for complex calculations

## Deployment

### Firebase Integration
- **Firebase Hosting** for static site deployment
- **GitHub Actions** for automated CI/CD
- **Preview deployments** for pull requests
- **Manual deployment**: `npm run deploy`

### Production Builds
- **TypeScript compilation** ensures type safety
- **Vite optimization** with tree shaking and minification
- **Asset hashing** for cache busting
- **Environment-specific configurations**

## Security & Best Practices

### Code Security
- **No exposed secrets** or API keys in codebase
- **Client-side only** calculations (no external API dependencies)
- **Input validation** through TypeScript and form constraints
- **XSS protection** through React's built-in escaping

### Code Quality
- **ESLint** with TypeScript rules for code consistency
- **Prettier** integration for code formatting
- **Strict TypeScript** configuration prevents common errors
- **Comprehensive test coverage** for business logic

## Future Scalability

### Adding New Asset Types
1. Create new feature directory: `src/features/newAssetType/`
2. Implement BaseAsset interface in store class with computed properties for results
3. Add type to AssetFactory union type and isAssetType() type guard
4. Create feature-specific components using CollapsibleSection pattern
5. Update PortfolioStore for new asset integration and cross-asset linking
6. Add comprehensive test coverage following existing patterns

### Extending Functionality
- **Additional calculation methods** can be added as computed properties with reactive updates
- **New UI components** can be integrated through shared CollapsibleSection pattern
- **Enhanced linking** between asset types through reactive property-investment patterns
- **Complex financial scenarios** supported through advanced property features like sales and rental management
- **Plugin architecture** possible through feature-based organization and factory patterns

This architecture provides a robust foundation for maintaining and extending the comprehensive investment and property analysis application while ensuring code quality, type safety, reactive performance, and sophisticated financial modeling capabilities.