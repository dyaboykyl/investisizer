
import { type InvestmentInputs } from '../../investment/stores/Investment';
import { type PropertyInputs } from '../../property/stores/Property';

interface DefaultInvestment {
  type: 'investment';
  name: string;
  inputs: Partial<InvestmentInputs>;
  inflationAdjustedContributions?: boolean;
}

interface DefaultProperty {
  type: 'property';
  name: string;
  inputs: Partial<PropertyInputs>;
}

export const defaultPortfolioData = {
  assets: [
    {
      type: 'investment',
      name: "Growth Portfolio (S&P 500)",
      inputs: {
        initialAmount: "100000",
        rateOfReturn: "8.5",
        annualContribution: "35000"
      },
      inflationAdjustedContributions: true,
    },
    {
      type: 'investment',
      name: "Emergency Fund (High-Yield Savings)",
      inputs: {
        initialAmount: "25000",
        rateOfReturn: "4.2",
        annualContribution: "3000"
      },
      inflationAdjustedContributions: true,
    },
    {
      type: 'property',
      name: "Primary Residence",
      inputs: {
        purchasePrice: "450000",
        downPaymentPercentage: "20",
        interestRate: "6.8",
        loanTerm: "30",
        yearsBought: "2",
        propertyGrowthRate: "4",
        linkedInvestmentId: "[GROWTH_INVESTMENT_ID]",
        isRentalProperty: false,
      },
    },
    {
      type: 'property',
      name: "Rental Property - Duplex",
      inputs: {
        purchasePrice: "240000",
        downPaymentPercentage: "25",
        interestRate: "7.2",
        loanTerm: "30",
        yearsBought: "1",
        propertyGrowthRate: "3.5",
        linkedInvestmentId: "[GROWTH_INVESTMENT_ID]",
        isRentalProperty: true,
        monthlyRent: "3200",
        rentGrowthRate: "4",
        vacancyRate: "8",
        maintenanceRate: "1.5",
        propertyManagementEnabled: true,
        monthlyManagementFeeRate: "8",
        listingFeeRate: "75",
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 8,
          sellingCostsPercentage: 7,
          reinvestProceeds: true,
          targetInvestmentId: "[GROWTH_INVESTMENT_ID]",
        }
      },
    }
  ] as (DefaultInvestment | DefaultProperty)[],
  settings: {
    years: "15",
    inflationRate: "2.5",
    startingYear: "2024",
    activeTabId: "combined"
  }
};
