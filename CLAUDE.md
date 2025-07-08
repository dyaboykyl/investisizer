# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Investisizer is a React-based investment and property analysis application that helps users calculate and visualize wealth growth over time. It supports multiple asset types (investments and properties), comprehensive portfolio management, property-investment linking, and provides both nominal and real (inflation-adjusted) projections with advanced property analysis including rental income, expenses, mortgage calculations, and sale planning.

## Essential Commands

```bash
# Development
npm run dev          # Start Vite dev server at http://localhost:5173

# Testing
npm run test         # Run all Jest tests
npm run test:watch   # Run tests in watch mode for TDD
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
npm run build        # TypeScript check + production build

# Deployment
npm run deploy       # Build, test, and deploy to Firebase
firebase deploy --only hosting  # Manual deploy after build
```

## Architecture Overview

### State Management
The application uses MobX with a root store pattern:
- `RootStore` (src/features/core/stores/RootStore.ts) - Central store containing:
  - `PortfolioStore` - Unified management of investments, properties, and portfolio calculations
  - `ThemeStore` - Dark/light theme preferences

Individual asset classes:
- `Investment` - Investment analysis with linked property cash flows
- `Property` - Property analysis with mortgage, rental, and sale planning

Stores are provided via React Context (`StoreContext`) and accessed with the `usePortfolioStore()` and `useThemeStore()` hooks.

### Component Structure
Components are organized by feature domain in a feature-based architecture:
- `src/features/core/` - Core application infrastructure (Layout, ThemeToggle, stores)
- `src/features/investment/` - Investment analysis UI and business logic
- `src/features/property/` - Property analysis UI including rental, mortgage, and sales
- `src/features/portfolio/` - Portfolio management and multi-asset views
- `src/features/shared/` - Shared components (CollapsibleSection, ProjectionChart)

Key component categories:
- **Analysis Views**: Main asset analysis pages with collapsible sections
- **Input Forms**: Modular input sections for different asset configurations
- **Summary Components**: Display computed financial metrics and projections
- **Results Tables**: Detailed year-by-year breakdowns with filtering options

### Key Design Patterns
1. **Computed Values**: MobX computed properties calculate derived state (e.g., investment projections, property cash flows)
2. **Action Methods**: Store mutations are explicit actions (e.g., `updateInput`, `setSaleEnabled`)
3. **Observer Components**: React components wrapped with `observer` auto-update on store changes
4. **Form State**: Input values stored as strings, parsed for calculations with validation
5. **Persistence**: LocalStorage integration for portfolio data with unsaved changes tracking
6. **Collapsible UI**: Modular collapsible sections for organized, user-friendly interfaces
7. **Property-Investment Linking**: Reactive cash flow integration between property and investment assets
8. **Asset Factory Pattern**: Type-safe asset creation and management through factory functions

## Testing Approach

Tests use Jest with React Testing Library:
- Unit tests for stores: Test business logic in isolation
- Component tests: Focus on user interactions and rendered output
- Test files colocated with source files (`.test.ts` or `.test.tsx`)

Run specific test files:
```bash
npm test -- src/features/investment/stores/Investment.test.ts
npm test -- src/features/property/stores/Property.test.ts
npm test -- src/features/portfolio/stores/PortfolioStore.test.ts
```

## Development Workflow

1. **Feature Development**:
   - Create/modify components in appropriate feature directory
   - Update relevant MobX store with new state/actions
   - Add computed properties for derived values
   - Write tests alongside implementation

2. **Before Committing**:
   - Run `npm run lint` to catch style issues
   - Run `npm run build` to verify TypeScript compilation
   - Run `npm test` to ensure all tests pass

3. **Deployment**:
   - PR merges to main auto-deploy via GitHub Actions
   - Preview deployments created for PRs
   - Manual deploy: `npm run build && firebase deploy --only hosting`

## TypeScript Configuration

The project uses strict TypeScript settings with:
- Strict null checks and type checking
- ES2022 target for modern JavaScript features
- Project references for app and node configs
- JSX preserved for React components

## Key Dependencies

- **React 19.1.0** - Latest React with improved performance
- **MobX 6.13.7** - Reactive state management with computed properties
- **Vite 5.4.11** - Fast development and optimized builds
- **Tailwind CSS 3.4.0** - Utility-first styling with dark mode support
- **TypeScript 5.6.2** - Strict type checking and modern JavaScript features
- **UUID 11.1.0** - Unique identifier generation for assets
- **Jest 29.7.0** - Testing framework with React Testing Library

## Core Features

### Investment Analysis
- **Projections**: Compound growth calculations with inflation adjustments
- **Contributions**: Annual contributions with optional inflation adjustment
- **Property Integration**: Automatic cash flow integration from linked properties
- **Results**: Year-by-year balance, earnings, and contribution tracking

### Property Analysis
- **Property Types**: Investment properties and rental properties
- **Mortgage Calculations**: Full amortization with custom payment options
- **Rental Income**: Monthly rent with growth rates and vacancy calculations
- **Expense Management**: Maintenance costs and professional property management fees
- **Property Sales**: Sale planning with reinvestment options and timing
- **Growth Models**: Purchase price vs. current value based appreciation

### Portfolio Management
- **Multi-Asset Views**: Combined portfolio projections and breakdowns
- **Asset Linking**: Properties can contribute to or withdraw from investments
- **Global Settings**: Shared inflation rates, projection periods, and starting years
- **Real vs Nominal**: Toggle between inflation-adjusted and nominal values

### User Experience
- **Collapsible Sections**: Organized input forms with expandable/collapsible sections
- **Dark Mode**: Full dark/light theme support with system preference detection
- **Unsaved Changes**: Real-time tracking and persistence of portfolio changes
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Firebase Integration

The app deploys to Firebase Hosting:
- Configuration in `firebase.json` with SPA rewrites
- GitHub Actions workflow for automated deployments
- Service account authentication for CI/CD
- Preview channels for pull requests

## AI Interaction Guidance

- **Tool Recommendations**:
  - Ask gemini when you need to analyze large parts of the codebase or large files

## Development Guidelines

### FeatureFlow Process

For every new feature or sub-feature, the AI coding agent will follow this **FeatureFlow** process:

1.  **Branch Creation:**
    * For a new feature, create and check out a new Git branch named `feature/<feature-name>`.
    * For a sub-feature, create and check out a new Git branch named `feature/<parent-feature-name>/<sub-feature-name>`.

2.  **Knowledge Directory Setup:**
    * For a new feature, create a new directory at `knowledge/<feature-name>/`.
    * For a sub-feature, create a new directory at `knowledge/<parent-feature-name>/<sub-feature-name>/`.

3.  **Documentation within Knowledge Directory:**
    * Inside the newly created knowledge directory, create two files:
        * `implementation_plan.md`: This file will detail the high-level plan for implementing the feature, including proposed solutions, potential challenges, and architectural considerations.
        * `task_progress.md`: This file will list individual tasks required to complete the feature and will be updated regularly to reflect task status (e.g., "To Do," "In Progress," "Done").

4.  **Feature Development and Progress Tracking:**
    * Proceed with the development of the feature.
    * Continuously update `task_progress.md` as tasks are completed.

5.  **Manual Confirmation and Approval:**
    * Once the feature development is complete and thoroughly tested, the agent will **wait for your manual confirmation and approval** to proceed.

6.  **Merge and Documentation Update:**
    * Upon receiving your approval, merge the feature branch into its parent branch (e.g., `main` or `develop` for features, or `feature/<parent-feature-name>` for sub-features).
    * Review the `implementation_plan.md` and `task_progress.md` in the knowledge directory of the *merged* branch. Update any information that needs to be refined or finalized based on the completed work.
