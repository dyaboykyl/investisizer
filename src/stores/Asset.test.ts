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
      expect(asset.results[0].balance).toBeGreaterThan(25000);
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
      expect(results.length).toBe(5);
      
      // Verify each year's contribution is recorded
      results.forEach(result => {
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
});