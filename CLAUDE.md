# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Investisizer is a React-based investment analysis application that helps users calculate and visualize investment growth over time. It supports multiple asset types, portfolio management, and provides both nominal and real (inflation-adjusted) projections.

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
- `RootStore` (src/stores/RootStore.ts) - Central store containing:
  - `InvestmentStore` - Core investment calculations and results
  - `PortfolioStore` - Multi-asset portfolio management
  - `ThemeStore` - Dark/light theme preferences

Stores are provided via React Context (`StoreContext`) and accessed with the `useStore()` hook.

### Component Structure
Components are organized by feature domain:
- `src/components/investment/` - Single investment calculator UI
- `src/components/asset/` - Asset-specific analysis components
- `src/components/portfolio/` - Portfolio management and multi-asset views
- `src/components/tabs/` - Tab navigation between features

### Key Design Patterns
1. **Computed Values**: MobX computed properties calculate derived state (e.g., investment projections)
2. **Action Methods**: Store mutations are explicit actions (e.g., `setInitialAmount`)
3. **Observer Components**: React components wrapped with `observer` auto-update on store changes
4. **Form State**: Input values stored as strings, parsed for calculations
5. **Persistence**: LocalStorage integration for theme and potentially user data

## Testing Approach

Tests use Jest with React Testing Library:
- Unit tests for stores: Test business logic in isolation
- Component tests: Focus on user interactions and rendered output
- Test files colocated with source files (`.test.ts` or `.test.tsx`)

Run a single test file:
```bash
npm test -- src/stores/InvestmentStore.test.ts
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
- **MobX 6.13.7** - Reactive state management
- **Vite 5.4.11** - Fast development and optimized builds
- **Tailwind CSS 3.4.0** - Utility-first styling with dark mode
- **Chart.js** - Investment projection visualizations

## Firebase Integration

The app deploys to Firebase Hosting:
- Configuration in `firebase.json` with SPA rewrites
- GitHub Actions workflow for automated deployments
- Service account authentication for CI/CD
- Preview channels for pull requests