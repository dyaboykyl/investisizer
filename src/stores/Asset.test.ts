import { Asset } from './Asset';

describe('Asset', () => {
  let asset: Asset;

  beforeEach(() => {
    asset = new Asset('Test Asset');
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(asset.name).toBe('Test Asset');
      expect(asset.enabled).toBe(true);
      expect(asset.inputs.initialAmount).toBe('10000');
      expect(asset.inputs.years).toBe('10');
      expect(asset.inputs.rateOfReturn).toBe('7');
      expect(asset.inputs.inflationRate).toBe('2.5');
      expect(asset.inputs.annualContribution).toBe('5000');
    });

    it('should have a unique id', () => {
      const asset2 = new Asset('Another Asset');
      expect(asset.id).toBeTruthy();
      expect(asset2.id).toBeTruthy();
      expect(asset.id).not.toBe(asset2.id);
    });

    it('should calculate initial projection', () => {
      expect(asset.results.length).toBeGreaterThan(0);
      expect(asset.hasResults).toBe(true);
    });

    it('should accept custom initial inputs', () => {
      const customAsset = new Asset('Custom', {
        initialAmount: '20000',
        years: '15',
        rateOfReturn: '8'
      });
      expect(customAsset.inputs.initialAmount).toBe('20000');
      expect(customAsset.inputs.years).toBe('15');
      expect(customAsset.inputs.rateOfReturn).toBe('8');
      // Should keep defaults for unspecified values
      expect(customAsset.inputs.inflationRate).toBe('2.5');
      expect(customAsset.inputs.annualContribution).toBe('5000');
    });
  });

  describe('Actions', () => {
    it('should update name', () => {
      asset.setName('New Name');
      expect(asset.name).toBe('New Name');
    });

    it('should update enabled status', () => {
      asset.setEnabled(false);
      expect(asset.enabled).toBe(false);
      asset.setEnabled(true);
      expect(asset.enabled).toBe(true);
    });

    it('should update inputs and recalculate', () => {
      const initialResultsLength = asset.results.length;
      asset.updateInput('initialAmount', '25000');
      expect(asset.inputs.initialAmount).toBe('25000');
      expect(asset.results.length).toBe(initialResultsLength);
      expect(asset.results[0].balance).toBe(25000); // Year 0 is just the initial amount
      expect(asset.results[1].balance).toBeGreaterThan(25000); // Year 1 should have growth
    });

    it('should update display options', () => {
      asset.setShowBalance(false);
      expect(asset.showBalance).toBe(false);
      
      asset.setShowContributions(false);
      expect(asset.showContributions).toBe(false);
      
      asset.setShowNetGain(false);
      expect(asset.showNetGain).toBe(false);
      
      asset.setShowNominal(false);
      expect(asset.showNominal).toBe(false);
      
      asset.setShowReal(false);
      expect(asset.showReal).toBe(false);
    });
  });

  describe('Calculations', () => {
    it('should calculate compound growth correctly', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '10');
      asset.updateInput('rateOfReturn', '7');
      asset.updateInput('annualContribution', '0');
      
      const finalBalance = asset.finalResult?.balance;
      // 10000 * (1.07)^10 ≈ 19671.51
      expect(finalBalance).toBeCloseTo(19671.51, 0);
    });

    it('should handle annual contributions', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '5');
      asset.updateInput('rateOfReturn', '5');
      asset.updateInput('annualContribution', '1000');
      
      const results = asset.results;
      expect(results.length).toBe(6); // Now includes year 0
      
      // Verify year 0 has no contribution
      expect(results[0].annualContribution).toBe(0);
      
      // Verify years 1-5 have contributions
      results.slice(1).forEach(result => {
        expect(result.annualContribution).toBe(1000);
      });
    });

    it('should calculate inflation-adjusted values', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '10');
      asset.updateInput('rateOfReturn', '7');
      asset.updateInput('inflationRate', '2');
      asset.updateInput('annualContribution', '0');
      
      const finalResult = asset.finalResult;
      expect(finalResult?.realBalance).toBeLessThan(finalResult?.balance || 0);
      // Real balance should be nominal / (1.02)^10
      const expectedReal = (finalResult?.balance || 0) / Math.pow(1.02, 10);
      expect(finalResult?.realBalance).toBeCloseTo(expectedReal, 0);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      asset.setName('Test Asset');
      asset.updateInput('initialAmount', '15000');
      
      const json = asset.toJSON();
      expect(json.id).toBe(asset.id);
      expect(json.name).toBe('Test Asset');
      expect(json.enabled).toBe(true);
      expect(json.inputs.initialAmount).toBe('15000');
      expect(json.showBalance).toBe(true);
    });

    it('should deserialize from JSON correctly', () => {
      const json = {
        id: 'test-id-123',
        name: 'Loaded Asset',
        enabled: false,
        inputs: {
          initialAmount: '30000',
          years: '20',
          rateOfReturn: '8',
          inflationRate: '3',
          annualContribution: '6000'
        },
        inflationAdjustedContributions: false,
        showBalance: false,
        showContributions: true,
        showNetGain: false,
        showNominal: true,
        showReal: false
      };
      
      const loadedAsset = Asset.fromJSON(json);
      expect(loadedAsset.id).toBe('test-id-123');
      expect(loadedAsset.name).toBe('Loaded Asset');
      expect(loadedAsset.enabled).toBe(false);
      expect(loadedAsset.inputs.initialAmount).toBe('30000');
      expect(loadedAsset.inputs.years).toBe('20');
      expect(loadedAsset.showBalance).toBe(false);
      expect(loadedAsset.showReal).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should return correct annualContributionNumber', () => {
      asset.updateInput('annualContribution', '5500.50');
      expect(asset.annualContributionNumber).toBe(5500.50);
      
      asset.updateInput('annualContribution', 'invalid');
      expect(asset.annualContributionNumber).toBe(0);
    });

    it('should have finalResult when results exist', () => {
      expect(asset.finalResult).toBeTruthy();
      expect(asset.finalResult?.year).toBe(10);
    });
  });

  describe('Inflation-Adjusted Contributions', () => {
    it('should default inflationAdjustedContributions to false', () => {
      expect(asset.inflationAdjustedContributions).toBe(false);
    });

    it('should toggle inflationAdjustedContributions setting', () => {
      asset.setInflationAdjustedContributions(true);
      expect(asset.inflationAdjustedContributions).toBe(true);
      
      asset.setInflationAdjustedContributions(false);
      expect(asset.inflationAdjustedContributions).toBe(false);
    });

    it('should calculate contributions without inflation adjustment when disabled', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '5');
      asset.updateInput('rateOfReturn', '0'); // 0% return to simplify calculation
      asset.updateInput('inflationRate', '3');
      asset.updateInput('annualContribution', '1000');
      asset.setInflationAdjustedContributions(false);
      
      const results = asset.results;
      // Year 0 has no contribution
      expect(results[0].annualContribution).toBe(0);
      // Years 1-5 should all have exactly $1000 contribution
      for (let i = 1; i <= 5; i++) {
        expect(results[i].annualContribution).toBe(1000);
      }
      
      // Final balance should be initial + (contribution * years)
      expect(results[5].balance).toBe(10000 + 1000 * 5);
    });

    it('should calculate contributions with inflation adjustment when enabled', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '5');
      asset.updateInput('rateOfReturn', '0'); // 0% return to simplify calculation
      asset.updateInput('inflationRate', '3');
      asset.updateInput('annualContribution', '1000');
      asset.setInflationAdjustedContributions(true);
      
      const results = asset.results;
      // Year 0 has no contribution
      expect(results[0].annualContribution).toBe(0);
      
      // Nominal contributions increase each year to maintain purchasing power
      // Year 1: $1000 * 1.03^1 = $1030
      expect(results[1].annualContribution).toBe(1030);
      
      // Year 2: $1000 * 1.03^2 = $1060.90
      expect(results[2].annualContribution).toBe(1060.9);
      
      // Year 3: $1000 * 1.03^3 = $1092.73
      expect(results[3].annualContribution).toBe(1092.73);
      
      // Year 4: $1000 * 1.03^4 = $1125.51
      expect(results[4].annualContribution).toBe(1125.51);
      
      // Year 5: $1000 * 1.03^5 = $1159.27
      expect(results[5].annualContribution).toBe(1159.27);
      
      // Real contributions should stay constant at $1000
      expect(results[1].realAnnualContribution).toBe(1000);
      expect(results[2].realAnnualContribution).toBe(1000);
      expect(results[3].realAnnualContribution).toBe(1000);
      expect(results[4].realAnnualContribution).toBe(1000);
      expect(results[5].realAnnualContribution).toBe(1000);
      
      // Final balance should be sum of all contributions
      const totalContributions = 10000 + 1030 + 1060.9 + 1092.73 + 1125.51 + 1159.27;
      expect(results[5].balance).toBeCloseTo(totalContributions, 2);
    });

    it('should handle negative contributions (withdrawals) with inflation adjustment', () => {
      asset.updateInput('initialAmount', '100000');
      asset.updateInput('years', '3');
      asset.updateInput('rateOfReturn', '0'); // 0% return to simplify calculation
      asset.updateInput('inflationRate', '2');
      asset.updateInput('annualContribution', '-5000'); // Withdrawal
      asset.setInflationAdjustedContributions(true);
      
      const results = asset.results;
      
      // Nominal withdrawals increase each year to maintain purchasing power
      // Year 1: -$5000 * 1.02^1 = -$5100
      expect(results[1].annualContribution).toBe(-5100);
      
      // Year 2: -$5000 * 1.02^2 = -$5202
      expect(results[2].annualContribution).toBe(-5202);
      
      // Year 3: -$5000 * 1.02^3 = -$5306.04
      expect(results[3].annualContribution).toBe(-5306.04);
      
      // Real withdrawals should stay constant at -$5000
      expect(results[1].realAnnualContribution).toBe(-5000);
      expect(results[2].realAnnualContribution).toBe(-5000);
      expect(results[3].realAnnualContribution).toBe(-5000);
      
      // Final balance should account for increasing withdrawals
      const expectedBalance = 100000 - 5100 - 5202 - 5306.04;
      expect(results[3].balance).toBe(expectedBalance);
    });

    it('should recalculate projection when toggling inflationAdjustedContributions', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '2');
      asset.updateInput('rateOfReturn', '0');
      asset.updateInput('inflationRate', '5');
      asset.updateInput('annualContribution', '1000');
      
      // Without inflation adjustment
      asset.setInflationAdjustedContributions(false);
      const resultsWithout = [...asset.results];
      expect(resultsWithout[2].balance).toBe(12000); // 10000 + 1000 + 1000
      
      // With inflation adjustment
      asset.setInflationAdjustedContributions(true);
      const resultsWith = [...asset.results];
      // Year 1: 1000 * 1.05 = 1050, Year 2: 1000 * 1.05^2 = 1102.5
      expect(resultsWith[2].balance).toBe(12152.5); // 10000 + 1050 + 1102.5
    });

    it('should persist inflationAdjustedContributions in JSON serialization', () => {
      asset.setInflationAdjustedContributions(true);
      const json = asset.toJSON();
      expect(json.inflationAdjustedContributions).toBe(true);
      
      const loadedAsset = Asset.fromJSON(json);
      expect(loadedAsset.inflationAdjustedContributions).toBe(true);
    });

    it('should handle inflationAdjustedContributions correctly with compound growth', () => {
      asset.updateInput('initialAmount', '10000');
      asset.updateInput('years', '3');
      asset.updateInput('rateOfReturn', '5');
      asset.updateInput('inflationRate', '2');
      asset.updateInput('annualContribution', '2000');
      asset.setInflationAdjustedContributions(true);
      
      const results = asset.results;
      
      // Year 1: Start with 10000, grow by 5%, add 2000 * 1.02^1 = 2040
      const year1Balance = 10000 * 1.05 + 2000 * 1.02;
      expect(results[1].balance).toBeCloseTo(year1Balance, 2);
      
      // Year 2: Previous balance grows by 5%, add 2000 * 1.02^2 = 2080.8
      const year2Balance = year1Balance * 1.05 + 2000 * Math.pow(1.02, 2);
      expect(results[2].balance).toBeCloseTo(year2Balance, 2);
      
      // Year 3: Previous balance grows by 5%, add 2000 * 1.02^3 = 2122.42
      const year3Balance = year2Balance * 1.05 + 2000 * Math.pow(1.02, 3);
      expect(results[3].balance).toBeCloseTo(year3Balance, 2);
    });

    it('should maintain constant real contributions when inflation-adjusted', () => {
      asset.updateInput('initialAmount', '0');
      asset.updateInput('years', '3');
      asset.updateInput('rateOfReturn', '0');
      asset.updateInput('inflationRate', '2.5');
      asset.updateInput('annualContribution', '5000');
      
      // Without inflation adjustment
      asset.setInflationAdjustedContributions(false);
      const resultsWithout = asset.results;
      
      // Nominal contributions stay the same, real contributions decline
      expect(resultsWithout[1].annualContribution).toBe(5000);
      expect(resultsWithout[2].annualContribution).toBe(5000);
      expect(resultsWithout[3].annualContribution).toBe(5000);
      
      expect(resultsWithout[1].realAnnualContribution).toBeCloseTo(4878, 0); // 5000/1.025
      expect(resultsWithout[2].realAnnualContribution).toBeCloseTo(4759, 0); // 5000/1.025^2
      expect(resultsWithout[3].realAnnualContribution).toBeCloseTo(4643, 0); // 5000/1.025^3
      
      // With inflation adjustment - this is what the user wants
      asset.setInflationAdjustedContributions(true);
      const resultsAdjusted = asset.results;
      
      // Nominal contributions increase each year
      expect(resultsAdjusted[1].annualContribution).toBe(5125);      // 5000 * 1.025^1
      expect(resultsAdjusted[2].annualContribution).toBe(5253.13);   // 5000 * 1.025^2
      expect(resultsAdjusted[3].annualContribution).toBe(5384.45);   // 5000 * 1.025^3
      
      // But real contributions stay constant at the entered amount (5000)
      expect(resultsAdjusted[1].realAnnualContribution).toBe(5000);
      expect(resultsAdjusted[2].realAnnualContribution).toBe(5000);
      expect(resultsAdjusted[3].realAnnualContribution).toBe(5000);
    });

    it('should demonstrate real value of inflation-adjusted contributions over time', () => {
      asset.updateInput('initialAmount', '0');
      asset.updateInput('years', '3');
      asset.updateInput('rateOfReturn', '0');
      asset.updateInput('inflationRate', '3');
      asset.updateInput('annualContribution', '1000');
      
      // Without inflation adjustment
      asset.setInflationAdjustedContributions(false);
      const resultsWithout = asset.results;
      
      // All nominal contributions are $1000
      expect(resultsWithout[1].annualContribution).toBe(1000);
      expect(resultsWithout[2].annualContribution).toBe(1000);
      expect(resultsWithout[3].annualContribution).toBe(1000);
      
      // Real values decrease each year due to inflation
      expect(resultsWithout[1].realAnnualContribution).toBeCloseTo(970.87, 2); // 1000/1.03
      expect(resultsWithout[2].realAnnualContribution).toBeCloseTo(942.60, 2); // 1000/1.03^2
      expect(resultsWithout[3].realAnnualContribution).toBeCloseTo(915.14, 2); // 1000/1.03^3
      
      // With inflation adjustment
      asset.setInflationAdjustedContributions(true);
      const resultsWith = asset.results;
      
      // Nominal contributions increase with inflation
      expect(resultsWith[1].annualContribution).toBe(1030);      // Year 1: 1000 * 1.03^1
      expect(resultsWith[2].annualContribution).toBe(1060.9);    // Year 2: 1000 * 1.03^2
      expect(resultsWith[3].annualContribution).toBe(1092.73);   // Year 3: 1000 * 1.03^3
      
      // Real contributions maintain purchasing power at the entered amount
      expect(resultsWith[1].realAnnualContribution).toBe(1000);  // Constant real value
      expect(resultsWith[2].realAnnualContribution).toBe(1000);  // Constant real value
      expect(resultsWith[3].realAnnualContribution).toBe(1000);  // Constant real value
    });
  });
});