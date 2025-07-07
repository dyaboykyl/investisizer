# Investisizer Project Context

This document provides a high-level overview of the Investisizer web application, its technical stack, and development conventions.

## Overview

Investisizer is a financial analysis tool for modeling and projecting investments, with a focus on real estate and securities portfolios. It is a single-page application built with React and TypeScript.

## Tech Stack

- **Framework:** React, Vite
- **Language:** TypeScript
- **State Management:** MobX
- **Styling:** Tailwind CSS
- **Testing:** Jest, React Testing Library
- **Linting:** ESLint
- **Deployment:** Firebase Hosting

## Key Commands

- **`npm run dev`**: Starts the local development server.
- **`npm run test`**: Executes the test suite using Jest.
- **`npm run lint`**: Lints the codebase with ESLint.
- **`npm run build`**: Compiles TypeScript and builds the application for production.
- **`npm run deploy`**: Builds, tests, and deploys the application to Firebase Hosting.

## Code Architecture

The project employs a **feature-sliced architecture** organized under `src/features`. Each feature (e.g., `property`, `portfolio`) encapsulates its own UI (`components/`), state (`stores/`), and logic. Global state is managed by a central MobX `RootStore` that composes feature-specific stores, which are then observed by React components for reactive updates. This design promotes modularity and a clear separation of concerns.

## Core Features

- **Investment Analysis:** General-purpose investment modeling and projection.
- **Property Analysis:** Detailed modeling for real estate assets, including mortgage, expenses, rental income, and sale scenarios.
- **Portfolio Management:** Combined analysis of multiple assets.
- **Tax Calculation:** Integrated federal and state tax calculations, including capital gains and Section 121 exclusion for property sales.
