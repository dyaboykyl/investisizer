import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CalculationResult {
  year: number;
  balance: number;
  realBalance: number;
  annualContribution: number;
  realAnnualContribution: number;
  totalEarnings: number;
  realTotalEarnings: number;
  yearlyGain: number;
  realYearlyGain: number;
}

interface InvestmentState {
  // Input parameters
  initialAmount: string;
  years: string;
  rateOfReturn: string;
  inflationRate: string;
  annualContribution: string;
  
  // Calculation results
  results: CalculationResult[];
  
  // UI state
  showBalance: boolean;
  showContributions: boolean;
  showNetGain: boolean;
  showNominal: boolean;
  showReal: boolean;
}

const initialState: InvestmentState = {
  initialAmount: '10000',
  years: '10',
  rateOfReturn: '7',
  inflationRate: '2.5',
  annualContribution: '5000',
  results: [],
  showBalance: true,
  showContributions: true,
  showNetGain: true,
  showNominal: true,
  showReal: true,
};

const investmentSlice = createSlice({
  name: 'investment',
  initialState,
  reducers: {
    setInitialAmount: (state, action: PayloadAction<string>) => {
      state.initialAmount = action.payload;
    },
    setYears: (state, action: PayloadAction<string>) => {
      state.years = action.payload;
    },
    setRateOfReturn: (state, action: PayloadAction<string>) => {
      state.rateOfReturn = action.payload;
    },
    setInflationRate: (state, action: PayloadAction<string>) => {
      state.inflationRate = action.payload;
    },
    setAnnualContribution: (state, action: PayloadAction<string>) => {
      state.annualContribution = action.payload;
    },
    calculateProjection: (state) => {
      const projections: CalculationResult[] = [];
      const initialAmountNum = parseFloat(state.initialAmount) || 0;
      const yearsNum = parseInt(state.years) || 1;
      const rateOfReturnNum = parseFloat(state.rateOfReturn) || 0;
      const inflationRateNum = parseFloat(state.inflationRate) || 0;
      const annualContributionNum = parseFloat(state.annualContribution) || 0;
      
      let balance = initialAmountNum;
      let totalContributions = initialAmountNum;
      
      for (let year = 1; year <= yearsNum; year++) {
        const previousBalance = balance;
        balance = balance * (1 + rateOfReturnNum / 100) + annualContributionNum;
        totalContributions += annualContributionNum;
        const totalEarnings = balance - totalContributions;
        const yearlyGain = balance - previousBalance - annualContributionNum;
        
        // Calculate real values (adjusted for inflation)
        const inflationFactor = Math.pow(1 + inflationRateNum / 100, year);
        const realBalance = balance / inflationFactor;
        const realTotalEarnings = totalEarnings / inflationFactor;
        const realAnnualContribution = annualContributionNum / inflationFactor;
        const realYearlyGain = yearlyGain / inflationFactor;
        
        projections.push({
          year,
          balance: Math.round(balance * 100) / 100,
          realBalance: Math.round(realBalance * 100) / 100,
          annualContribution: annualContributionNum,
          realAnnualContribution: Math.round(realAnnualContribution * 100) / 100,
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          realTotalEarnings: Math.round(realTotalEarnings * 100) / 100,
          yearlyGain: Math.round(yearlyGain * 100) / 100,
          realYearlyGain: Math.round(realYearlyGain * 100) / 100
        });
      }
      
      state.results = projections;
    },
    setShowBalance: (state, action: PayloadAction<boolean>) => {
      state.showBalance = action.payload;
    },
    setShowContributions: (state, action: PayloadAction<boolean>) => {
      state.showContributions = action.payload;
    },
    setShowNetGain: (state, action: PayloadAction<boolean>) => {
      state.showNetGain = action.payload;
    },
    setShowNominal: (state, action: PayloadAction<boolean>) => {
      state.showNominal = action.payload;
    },
    setShowReal: (state, action: PayloadAction<boolean>) => {
      state.showReal = action.payload;
    },
  },
});

export const {
  setInitialAmount,
  setYears,
  setRateOfReturn,
  setInflationRate,
  setAnnualContribution,
  calculateProjection,
  setShowBalance,
  setShowContributions,
  setShowNetGain,
  setShowNominal,
  setShowReal,
} = investmentSlice.actions;

export default investmentSlice.reducer;