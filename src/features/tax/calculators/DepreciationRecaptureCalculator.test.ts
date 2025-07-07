import { DepreciationRecaptureCalculator } from './DepreciationRecaptureCalculator';

describe('DepreciationRecaptureCalculator', () => {
  describe('calculateRecapture', () => {
    it('should calculate no recapture when no depreciation taken', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 0,
        annualIncome: 100000,
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(false);
      expect(result.recaptureAmount).toBe(0);
      expect(result.recaptureTax).toBe(0);
      expect(result.notes).toContain('No depreciation recapture');
    });

    it('should calculate recapture at 25% for high income taxpayer', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 100000,
        annualIncome: 500000, // High income - should hit 25% cap
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureAmount).toBe(100000);
      expect(result.recaptureRate).toBe(0.25); // Capped at 25%
      expect(result.recaptureTax).toBe(25000); // $100k * 25%
      expect(result.notes).toContain('25%');
    });

    it('should calculate recapture at ordinary income rate for lower bracket', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 50000,
        annualIncome: 75000, // Should be in 22% bracket
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureAmount).toBe(50000);
      expect(result.recaptureRate).toBe(0.22); // 22% bracket, less than 25% cap
      expect(result.recaptureTax).toBe(11000); // $50k * 22%
    });

    it('should handle married filing jointly brackets', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 80000,
        annualIncome: 150000, // Should be in 22% bracket for married joint
        filingStatus: 'married_joint'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureRate).toBe(0.22);
      expect(result.recaptureTax).toBe(17600); // $80k * 22%
    });

    it('should handle edge case with minimal depreciation', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 1000,
        annualIncome: 50000,
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureAmount).toBe(1000);
      expect(result.recaptureTax).toBeGreaterThan(0);
    });
  });

  describe('calculateAnnualDepreciation', () => {
    it('should calculate residential rental depreciation over 27.5 years', () => {
      const annualDepreciation = DepreciationRecaptureCalculator.calculateAnnualDepreciation(
        550000, // Property value
        100000, // Land value
        true    // Residential
      );

      // ($550k - $100k) / 27.5 years = $16,363.64
      expect(annualDepreciation).toBeCloseTo(16363.64, 2);
    });

    it('should calculate commercial depreciation over 39 years', () => {
      const annualDepreciation = DepreciationRecaptureCalculator.calculateAnnualDepreciation(
        1000000, // Property value
        200000,  // Land value
        false    // Commercial
      );

      // ($1M - $200k) / 39 years = $20,512.82
      expect(annualDepreciation).toBeCloseTo(20512.82, 2);
    });

    it('should handle zero land value', () => {
      const annualDepreciation = DepreciationRecaptureCalculator.calculateAnnualDepreciation(
        400000, // Property value
        0,      // No land value
        true    // Residential
      );

      // $400k / 27.5 years = $14,545.45
      expect(annualDepreciation).toBeCloseTo(14545.45, 2);
    });
  });

  describe('calculateTotalDepreciation', () => {
    it('should calculate total depreciation over ownership period', () => {
      const totalDepreciation = DepreciationRecaptureCalculator.calculateTotalDepreciation(
        500000, // Property value
        100000, // Land value
        5,      // Years owned
        true    // Residential
      );

      // Annual: ($500k - $100k) / 27.5 = $14,545.45
      // Total: $14,545.45 * 5 = $72,727.27
      expect(totalDepreciation).toBeCloseTo(72727.27, 2);
    });

    it('should handle partial years correctly', () => {
      const totalDepreciation = DepreciationRecaptureCalculator.calculateTotalDepreciation(
        600000, // Property value
        120000, // Land value
        3.5,    // 3.5 years owned
        true    // Residential
      );

      // Annual: ($600k - $120k) / 27.5 = $17,454.55
      // Total: $17,454.55 * 3.5 = $61,090.91
      expect(totalDepreciation).toBeCloseTo(61090.91, 2);
    });
  });

  describe('estimateLandValue', () => {
    it('should estimate land value as 20% by default', () => {
      const landValue = DepreciationRecaptureCalculator.estimateLandValue(500000);
      expect(landValue).toBe(100000); // 20% of $500k
    });

    it('should allow custom land percentage', () => {
      const landValue = DepreciationRecaptureCalculator.estimateLandValue(500000, 0.25);
      expect(landValue).toBe(125000); // 25% of $500k
    });

    it('should handle zero land percentage', () => {
      const landValue = DepreciationRecaptureCalculator.estimateLandValue(500000, 0);
      expect(landValue).toBe(0);
    });
  });

  describe('edge cases and validation', () => {
    it('should handle negative depreciation amounts', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: -10000,
        annualIncome: 100000,
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(false);
      expect(result.recaptureTax).toBe(0);
    });

    it('should handle zero income', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 50000,
        annualIncome: 0,
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureRate).toBe(0.10); // Lowest bracket
    });

    it('should handle very high income (top bracket)', () => {
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 200000,
        annualIncome: 1000000, // Top bracket
        filingStatus: 'single'
      });

      expect(result.recaptureRate).toBe(0.25); // Capped at 25%
      expect(result.recaptureTax).toBe(50000); // $200k * 25%
    });
  });

  describe('real-world scenarios', () => {
    it('should calculate realistic investment property scenario', () => {
      // Investment property: $600k purchase, 20% land, 5 years owned
      const propertyValue = 600000;
      const landValue = DepreciationRecaptureCalculator.estimateLandValue(propertyValue, 0.20);
      const totalDepreciation = DepreciationRecaptureCalculator.calculateTotalDepreciation(
        propertyValue,
        landValue,
        5,
        true
      );

      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: totalDepreciation,
        annualIncome: 150000,
        filingStatus: 'married_joint'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureAmount).toBeCloseTo(87272.73, 2); // 5 years of depreciation
      expect(result.recaptureRate).toBe(0.22); // 22% bracket for married joint at $150k
      expect(result.recaptureTax).toBeCloseTo(19200, 0); // ~$87k * 22%
    });

    it('should handle small rental property scenario', () => {
      // Small rental: $300k, minimal land value, 3 years
      const result = DepreciationRecaptureCalculator.calculateRecapture({
        totalDepreciationTaken: 30000, // Manual entry
        annualIncome: 80000,
        filingStatus: 'single'
      });

      expect(result.hasRecapture).toBe(true);
      expect(result.recaptureRate).toBe(0.22); // 22% bracket
      expect(result.recaptureTax).toBe(6600); // $30k * 22%
    });
  });
});