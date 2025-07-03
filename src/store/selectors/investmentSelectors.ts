import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Base selectors
export const selectInvestmentState = (state: RootState) => state.investment;

export const selectResults = createSelector(
  [selectInvestmentState],
  (investment) => investment.results
);

export const selectFinalResult = createSelector(
  [selectResults],
  (results) => results[results.length - 1] || null
);

// Input selectors
export const selectInitialAmount = createSelector(
  [selectInvestmentState],
  (investment) => investment.initialAmount
);

export const selectYears = createSelector(
  [selectInvestmentState],
  (investment) => investment.years
);

export const selectRateOfReturn = createSelector(
  [selectInvestmentState],
  (investment) => investment.rateOfReturn
);

export const selectInflationRate = createSelector(
  [selectInvestmentState],
  (investment) => investment.inflationRate
);

export const selectAnnualContribution = createSelector(
  [selectInvestmentState],
  (investment) => investment.annualContribution
);

// UI state selectors
export const selectShowBalance = createSelector(
  [selectInvestmentState],
  (investment) => investment.showBalance
);

export const selectShowContributions = createSelector(
  [selectInvestmentState],
  (investment) => investment.showContributions
);

export const selectShowNetGain = createSelector(
  [selectInvestmentState],
  (investment) => investment.showNetGain
);

export const selectShowNominal = createSelector(
  [selectInvestmentState],
  (investment) => investment.showNominal
);

export const selectShowReal = createSelector(
  [selectInvestmentState],
  (investment) => investment.showReal
);

// Computed selectors
export const selectHasResults = createSelector(
  [selectResults],
  (results) => results.length > 0
);

export const selectAnnualContributionNumber = createSelector(
  [selectAnnualContribution],
  (contribution) => parseFloat(contribution) || 0
);