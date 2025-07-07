import { PortfolioStore } from './PortfolioStore';
import { Investment } from '@/features/investment/stores/Investment';
import { Property } from '@/features/property/stores/Property';

describe('PortfolioStore - After-Tax Proceeds Integration', () => {
  let portfolioStore: PortfolioStore;
  let investment: Investment;
  let property: Property;

  beforeEach(() => {
    portfolioStore = new PortfolioStore();
    portfolioStore.assets.clear(); // Clear default assets
    portfolioStore.setYears('5');
    portfolioStore.setStartingYear('2024');
  });

  it('should use after-tax proceeds for property sale reinvestment', () => {
    // Create an investment
    const investmentId = portfolioStore.addInvestment('Target Investment', {
      initialAmount: '100000',
      annualContribution: '0',
      rateOfReturn: '7',
      inflationRate: '2.5'
    });

    // Create a property that will be sold and reinvested
    const propertyId = portfolioStore.addProperty('Property for Sale', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      inflationRate: '2.5',
      yearsBought: '0',
      propertyGrowthRate: '4',
      monthlyPayment: '2398',
      linkedInvestmentId: '', // Not directly linked
      propertyGrowthModel: 'purchase_price',
      currentEstimatedValue: '500000',
      isRentalProperty: false,
      monthlyRent: '0',
      rentGrowthRate: '3',
      vacancyRate: '5',
      maintenanceRate: '1',
      propertyManagementEnabled: false,
      listingFeeRate: '10',
      monthlyManagementFeeRate: '8',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 3,
        expectedSalePrice: 650000,
        useProjectedValue: false,
        sellingCostsPercentage: 6,
        reinvestProceeds: true,
        targetInvestmentId: investmentId,
        saleMonth: 6,
        capitalImprovements: '20000',
        originalBuyingCosts: '10000',
        filingStatus: 'single',
        annualIncome: '120000',
        state: 'CA',
        enableStateTax: true,
        otherCapitalGains: '',
        carryoverLosses: '',
        isPrimaryResidence: false,
        yearsOwned: '3',
        yearsLived: '0',
        hasUsedExclusionInLastTwoYears: false,
        enableSection121: true,
        // Depreciation Recapture fields
        enableDepreciationRecapture: false,
        totalDepreciationTaken: '',
        landValuePercentage: '20',
      }
    });

    investment = portfolioStore.assets.get(investmentId) as Investment;
    property = portfolioStore.assets.get(propertyId) as Property;

    // Verify sale year calculation
    expect(property.saleYear).toBe(3);
    expect(property.inputs.saleConfig.isPlannedForSale).toBe(true);

    // Get property results for sale year
    const propertyResults = property.results;
    const saleYearResult = propertyResults[3]; // Year 3 is the sale year
    
    expect(saleYearResult.isSaleYear).toBe(true);
    expect(saleYearResult.saleProceeds).toBeDefined();
    expect(saleYearResult.netSaleProceeds).toBeDefined();

    // Calculate expected tax amounts
    const capitalGain = property.capitalGain;
    const federalTax = property.federalTaxAmount;
    const stateTax = property.stateTaxAmount;
    const totalTax = property.totalTaxAmount;
    const netAfterTax = property.netAfterTaxProceeds;

    // Verify tax calculations
    expect(capitalGain).toBeGreaterThan(0);
    expect(federalTax).toBeGreaterThan(0);
    expect(stateTax).toBeGreaterThan(0);
    expect(totalTax).toBe(federalTax + stateTax);

    // Verify that saleProceeds in the result uses after-tax amount
    expect(saleYearResult.saleProceeds).toBeCloseTo(netAfterTax, 2);
    expect(saleYearResult.saleProceeds).toBeLessThan(saleYearResult.netSaleProceeds!);

    // Verify portfolio cash flow integration
    const linkedCashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
    const saleYearCashFlow = linkedCashFlows[2]; // Year 3 (0-indexed array)
    
    // The cash flow should equal the after-tax proceeds
    expect(saleYearCashFlow).toBeCloseTo(netAfterTax, 2);
    expect(saleYearCashFlow).toBeLessThan(saleYearResult.netSaleProceeds!);

    // Verify investment balance includes after-tax proceeds
    const investmentResults = investment.results;
    const investmentSaleYearResult = investmentResults[3];
    
    // The investment balance should reflect the after-tax contribution
    expect(investmentSaleYearResult.balance).toBeGreaterThan(investmentResults[2].balance);
  });

  it('should handle zero tax scenario correctly', () => {
    // Create an investment
    const investmentId = portfolioStore.addInvestment('Target Investment', {
      initialAmount: '100000',
      annualContribution: '0',
      rateOfReturn: '7',
      inflationRate: '2.5'
    });

    // Create a property with no tax liability (Texas, no gain)
    const propertyId = portfolioStore.addProperty('Texas Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      inflationRate: '2.5',
      yearsBought: '0',
      propertyGrowthRate: '0', // No appreciation
      monthlyPayment: '2398',
      linkedInvestmentId: '',
      propertyGrowthModel: 'purchase_price',
      currentEstimatedValue: '500000',
      isRentalProperty: false,
      monthlyRent: '0',
      rentGrowthRate: '3',
      vacancyRate: '5',
      maintenanceRate: '1',
      propertyManagementEnabled: false,
      listingFeeRate: '10',
      monthlyManagementFeeRate: '8',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 3,
        expectedSalePrice: 500000, // No gain
        useProjectedValue: false,
        sellingCostsPercentage: 6,
        reinvestProceeds: true,
        targetInvestmentId: investmentId,
        saleMonth: 6,
        capitalImprovements: '0',
        originalBuyingCosts: '0',
        filingStatus: 'single',
        annualIncome: '100000',
        state: 'TX', // No state tax
        enableStateTax: true,
        otherCapitalGains: '',
        carryoverLosses: '',
        isPrimaryResidence: false,
        yearsOwned: '3',
        yearsLived: '0',
        hasUsedExclusionInLastTwoYears: false,
        enableSection121: true,
        // Depreciation Recapture fields
        enableDepreciationRecapture: false,
        totalDepreciationTaken: '',
        landValuePercentage: '20',
      }
    });

    property = portfolioStore.assets.get(propertyId) as Property;

    // Verify no tax liability
    expect(property.capitalGain).toBeLessThanOrEqual(0);
    expect(property.federalTaxAmount).toBe(0);
    expect(property.stateTaxAmount).toBe(0);
    expect(property.totalTaxAmount).toBe(0);

    // Verify after-tax proceeds are being used (they should equal pre-tax since no tax)
    const propertyResults = property.results;
    const saleYearResult = propertyResults[3];
    
    expect(saleYearResult.saleProceeds).toBeCloseTo(property.netAfterTaxProceeds, 0);
    // When there are no taxes, after-tax should equal pre-tax
    expect(property.netAfterTaxProceeds).toBeCloseTo(property.netSaleProceeds, 0);
  });

  it('should handle Section 121 exclusion correctly in cash flow', () => {
    // Create an investment
    const investmentId = portfolioStore.addInvestment('Target Investment', {
      initialAmount: '100000',
      annualContribution: '0',
      rateOfReturn: '7',
      inflationRate: '2.5'
    });

    // Create a primary residence with Section 121 exclusion
    const propertyId = portfolioStore.addProperty('Primary Residence', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      inflationRate: '2.5',
      yearsBought: '0',
      propertyGrowthRate: '5',
      monthlyPayment: '1918',
      linkedInvestmentId: '',
      propertyGrowthModel: 'purchase_price',
      currentEstimatedValue: '400000',
      isRentalProperty: false,
      monthlyRent: '0',
      rentGrowthRate: '3',
      vacancyRate: '5',
      maintenanceRate: '1',
      propertyManagementEnabled: false,
      listingFeeRate: '10',
      monthlyManagementFeeRate: '8',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 3,
        expectedSalePrice: 550000, // $150k gain
        useProjectedValue: false,
        sellingCostsPercentage: 6,
        reinvestProceeds: true,
        targetInvestmentId: investmentId,
        saleMonth: 6,
        capitalImprovements: '10000',
        originalBuyingCosts: '8000',
        filingStatus: 'single',
        annualIncome: '100000',
        state: 'CA',
        enableStateTax: true,
        otherCapitalGains: '',
        carryoverLosses: '',
        isPrimaryResidence: true, // Primary residence
        yearsOwned: '3',
        yearsLived: '3',
        hasUsedExclusionInLastTwoYears: false,
        enableSection121: true,
        // Depreciation Recapture fields
        enableDepreciationRecapture: false,
        totalDepreciationTaken: '',
        landValuePercentage: '20',
      }
    });

    property = portfolioStore.assets.get(propertyId) as Property;

    // Verify Section 121 exclusion applies
    const exclusion = property.section121Exclusion;
    expect(exclusion.isEligible).toBe(true);
    expect(exclusion.appliedExclusion).toBeGreaterThan(0);

    // Capital gain should be around $99k ($550k - $33k selling costs - $400k - $10k - $8k)
    const capitalGain = property.capitalGain;
    expect(capitalGain).toBeGreaterThan(95000);
    expect(capitalGain).toBeLessThan(105000);

    // Should be fully excluded for single filer ($250k limit)
    expect(exclusion.remainingGain).toBe(0);
    expect(property.federalTaxAmount).toBe(0);
    expect(property.stateTaxAmount).toBe(0);

    // After-tax proceeds should equal pre-tax proceeds (no tax liability)
    const propertyResults = property.results;
    const saleYearResult = propertyResults[3];
    
    expect(saleYearResult.saleProceeds).toBeCloseTo(property.netAfterTaxProceeds, 0);
    // When there are no taxes, after-tax should equal pre-tax
    expect(property.netAfterTaxProceeds).toBeCloseTo(property.netSaleProceeds, 0);
  });
});