import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { ValidatedCheckboxInput, ValidatedNumberInput, ValidatedCurrencyInput, ValidatedPercentageInput, ValidatedSelectInput, ValidatedRadioInput } from '@/features/shared/components/forms';
import { createPropertyValidationConfig } from '@/features/shared/validation';
import { useFormValidation } from '@/features/shared/validation/hooks';
import type { FilingStatus } from '@/features/tax/types';
import { getStateChoices } from '@/features/tax/data/StateTaxRates';

interface PropertySaleConfigProps {
  asset: Property;
}

export const PropertySaleConfig: React.FC<PropertySaleConfigProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();

  // Get available investment assets for reinvestment target
  const availableInvestments = portfolioStore.investments.filter(inv => inv.id !== asset.id);

  // Set up validation
  const validationConfig = createPropertyValidationConfig();
  const validationContext = {
    isRentalProperty: asset.inputs.isRentalProperty,
    projectionYears: portfolioStore.years,
    propertyGrowthModel: asset.inputs.propertyGrowthModel,
    saleEnabled: asset.inputs.saleConfig.isPlannedForSale
  };
  
  // Setup validation (can be expanded for form-level validation)
  useFormValidation(validationConfig, validationContext);

  const handleSaleToggle = (enabled: boolean) => {
    asset.setSaleEnabled(enabled);
  };

  const handleSaleConfigUpdate = (key: string, value: string | number | boolean | null) => {
    asset.updateSaleConfig(key as keyof typeof asset.inputs.saleConfig, value);
  };

  // Show validation errors if any
  const validationErrors = asset.validationErrors;
  const hasErrors = validationErrors.length > 0;

  const icon = (
    <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  return (
    <CollapsibleSection title="Property Sale Planning" icon={icon} defaultExpanded={false}>
      <div className="space-y-6">
        <ValidatedCheckboxInput
          label="Plan to sell this property"
          checked={asset.inputs.saleConfig.isPlannedForSale}
          onChange={(checked) => handleSaleToggle(checked)}
          validationContext={validationContext}
          fieldName="isPlannedForSale"
          helpText="Enable sale planning to configure when and how you plan to sell this property. This will affect projected cash flows and linked investment contributions."
        />


      {asset.inputs.saleConfig.isPlannedForSale && (
        <div className="space-y-6">
          {/* Validation Errors */}
          {hasErrors && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Configuration Issues
                </h4>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sale Year */}
            <ValidatedNumberInput
              label="Year to Sell"
              value={asset.inputs.saleConfig.saleYear?.toString() || ''}
              onChange={(value) => handleSaleConfigUpdate('saleYear', parseInt(value) || null)}
              integerOnly={true}
              allowNegative={false}
              validationContext={validationContext}
              fieldName="saleYear"
              validateOnBlur={true}
              required={true}
              helpText={`Year within the ${portfolioStore.years}-year projection period`}
              minValue={1}
              maxValue={parseInt(portfolioStore.years)}
            />

            {/* Sale Month */}
            <ValidatedSelectInput
              label="Month to Sell"
              value={asset.inputs.saleConfig.saleMonth?.toString() || '1'}
              onChange={(value) => handleSaleConfigUpdate('saleMonth', parseInt(value))}
              options={Array.from({ length: 12 }, (_, i) => i + 1).map(month => ({
                value: month.toString(),
                label: `Month ${month} (${new Date(2000, month - 1).toLocaleString('default', { month: 'long' })})`
              }))}
              validationContext={validationContext}
              fieldName="saleMonth"
              validateOnBlur={true}
              required={true}
              helpText="Affects partial-year calculations for rental income and expenses"
            />

            {/* Sale Price Configuration */}
            <div className="group md:col-span-2">
              <ValidatedRadioInput
                label="Sale Price Method"
                value={asset.inputs.saleConfig.useProjectedValue ? 'projected' : 'custom'}
                onChange={(value) => handleSaleConfigUpdate('useProjectedValue', value === 'projected')}
                options={[
                  {
                    value: 'projected',
                    label: `Use projected value: $${asset.projectedSalePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    description: `Based on ${asset.inputs.propertyGrowthRate}% annual growth from ${asset.inputs.propertyGrowthModel === 'purchase_price' ? 'purchase price' : 'current estimated value'}`
                  },
                  {
                    value: 'custom',
                    label: 'Use custom sale price'
                  }
                ]}
                validationContext={validationContext}
                fieldName="saleMethod"
                validateOnBlur={true}
                required={true}
              />
              
              {/* Custom sale price input */}
              {!asset.inputs.saleConfig.useProjectedValue && (
                <div className="mt-4 ml-6">
                  <ValidatedCurrencyInput
                    label="Expected Sale Price"
                    value={asset.inputs.saleConfig.expectedSalePrice?.toString() || ''}
                    onChange={(value) => handleSaleConfigUpdate('expectedSalePrice', parseFloat(value) || 0)}
                    validationContext={validationContext}
                    fieldName="expectedSalePrice"
                    validateOnBlur={true}
                    required={true}
                    placeholder="Enter expected sale price"
                  />
                </div>
              )}
            </div>

            {/* Selling Costs */}
            <ValidatedPercentageInput
              label="Selling Costs (%)"
              value={asset.inputs.saleConfig.sellingCostsPercentage.toString()}
              onChange={(value) => handleSaleConfigUpdate('sellingCostsPercentage', parseFloat(value) || 0)}
              validationContext={validationContext}
              fieldName="sellingCostsPercentage"
              validateOnBlur={true}
              helpText={`Real estate agent fees, closing costs, etc. ($${asset.sellingCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
              highValueWarning={{ threshold: 10, message: 'Selling costs above 10% are very high' }}
            />

            {/* Capital Improvements */}
            <ValidatedCurrencyInput
              label="Capital Improvements"
              value={asset.inputs.saleConfig.capitalImprovements}
              onChange={(value) => handleSaleConfigUpdate('capitalImprovements', value)}
              validationContext={validationContext}
              fieldName="capitalImprovements"
              validateOnBlur={true}
              helpText="Cost of improvements that increase property basis (reduces capital gains tax)"
              placeholder="0"
            />

            {/* Original Buying Costs */}
            <ValidatedCurrencyInput
              label="Original Buying Costs"
              value={asset.inputs.saleConfig.originalBuyingCosts}
              onChange={(value) => handleSaleConfigUpdate('originalBuyingCosts', value)}
              validationContext={validationContext}
              fieldName="originalBuyingCosts"
              validateOnBlur={true}
              helpText="Transaction costs from original purchase (legal, inspection, etc.)"
              placeholder="0"
            />

            {/* Tax Profile Section */}
            <div className="group md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                Tax Profile (Property-Specific)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filing Status */}
                <ValidatedSelectInput
                  label="Filing Status"
                  value={asset.inputs.saleConfig.filingStatus}
                  onChange={(value) => handleSaleConfigUpdate('filingStatus', value as FilingStatus)}
                  options={[
                    { value: 'single', label: 'Single' },
                    { value: 'married_joint', label: 'Married Filing Jointly' },
                    { value: 'married_separate', label: 'Married Filing Separately' },
                    { value: 'head_of_household', label: 'Head of Household' }
                  ]}
                  validationContext={validationContext}
                  fieldName="filingStatus"
                  validateOnBlur={true}
                  required={true}
                  helpText="Tax filing status at time of sale"
                />

                {/* Annual Income */}
                <ValidatedCurrencyInput
                  label="Annual Income"
                  value={asset.inputs.saleConfig.annualIncome}
                  onChange={(value) => handleSaleConfigUpdate('annualIncome', value)}
                  validationContext={validationContext}
                  fieldName="annualIncome"
                  validateOnBlur={true}
                  helpText="Expected annual income in year of sale"
                  placeholder="75000"
                />

                {/* State */}
                <ValidatedSelectInput
                  label="State/Location"
                  value={asset.inputs.saleConfig.state}
                  onChange={(value) => handleSaleConfigUpdate('state', value)}
                  options={[
                    { value: '', label: 'Select a state...', disabled: true },
                    ...getStateChoices().map((state) => ({
                      value: state.value,
                      label: state.label
                    }))
                  ]}
                  validationContext={validationContext}
                  fieldName="state"
                  validateOnBlur={true}
                  helpText="Property location or state of residence for tax purposes"
                  placeholder="Select a state..."
                />

                {/* Other Capital Gains */}
                <ValidatedCurrencyInput
                  label="Other Capital Gains"
                  value={asset.inputs.saleConfig.otherCapitalGains}
                  onChange={(value) => handleSaleConfigUpdate('otherCapitalGains', value)}
                  validationContext={validationContext}
                  fieldName="otherCapitalGains"
                  validateOnBlur={true}
                  helpText="Other capital gains for the year"
                  placeholder="0"
                  allowNegative={true}
                />

                {/* Carryover Losses */}
                <ValidatedCurrencyInput
                  label="Carryover Losses"
                  value={asset.inputs.saleConfig.carryoverLosses}
                  onChange={(value) => handleSaleConfigUpdate('carryoverLosses', value)}
                  validationContext={validationContext}
                  fieldName="carryoverLosses"
                  validateOnBlur={true}
                  helpText="Capital loss carryovers from previous years"
                  placeholder="0"
                />

                {/* State Tax Toggle */}
                <div className="md:col-span-2">
                  <ValidatedCheckboxInput
                    label="Enable State Tax Calculations"
                    checked={asset.inputs.saleConfig.enableStateTax}
                    onChange={(checked) => handleSaleConfigUpdate('enableStateTax', checked)}
                    validationContext={validationContext}
                    fieldName="enableStateTax"
                    helpText="Calculate state capital gains tax based on property location or residence"
                  />
                </div>
              </div>
            </div>

            {/* Section 121 Primary Residence Exclusion */}
            <div className="group md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                Section 121 Primary Residence Exclusion
              </h4>
              <div className="space-y-4">
                {/* Enable Section 121 */}
                <ValidatedCheckboxInput
                  label="Apply Section 121 Exclusion"
                  checked={asset.inputs.saleConfig.enableSection121}
                  onChange={(checked) => handleSaleConfigUpdate('enableSection121', checked)}
                  validationContext={validationContext}
                  fieldName="enableSection121"
                  helpText="IRS Section 121 allows exclusion of up to $250k ($500k married) of capital gains on primary residence"
                />

                {asset.inputs.saleConfig.enableSection121 && (
                  <div className="ml-7 space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Is Primary Residence */}
                      <div className="md:col-span-2">
                        <ValidatedCheckboxInput
                          label="This is my primary residence"
                          checked={asset.inputs.saleConfig.isPrimaryResidence}
                          onChange={(checked) => handleSaleConfigUpdate('isPrimaryResidence', checked)}
                          validationContext={validationContext}
                          fieldName="isPrimaryResidence"
                          helpText="Property must qualify as your main home"
                        />
                      </div>

                      {/* Years Owned */}
                      <ValidatedNumberInput
                        label="Years Owned"
                        value={asset.inputs.saleConfig.yearsOwned}
                        onChange={(value) => handleSaleConfigUpdate('yearsOwned', value)}
                        allowNegative={false}
                        validationContext={validationContext}
                        fieldName="yearsOwned"
                        validateOnBlur={true}
                        helpText="Must own for at least 2 years"
                        placeholder="2.5"
                        minValue={0}
                      />

                      {/* Years Lived */}
                      <ValidatedNumberInput
                        label="Years Lived In"
                        value={asset.inputs.saleConfig.yearsLived}
                        onChange={(value) => handleSaleConfigUpdate('yearsLived', value)}
                        allowNegative={false}
                        validationContext={validationContext}
                        fieldName="yearsLived"
                        validateOnBlur={true}
                        helpText="Must live in for at least 2 years"
                        placeholder="2.5"
                        minValue={0}
                      />

                      {/* Previous Exclusion Usage */}
                      <div className="md:col-span-2">
                        <ValidatedCheckboxInput
                          label="Used Section 121 exclusion in last 2 years"
                          checked={asset.inputs.saleConfig.hasUsedExclusionInLastTwoYears}
                          onChange={(checked) => handleSaleConfigUpdate('hasUsedExclusionInLastTwoYears', checked)}
                          validationContext={validationContext}
                          fieldName="hasUsedExclusionInLastTwoYears"
                          helpText="If checked, you may not be eligible for the full exclusion"
                        />
                      </div>
                    </div>

                    {/* Section 121 Status Display */}
                    {asset.inputs.saleConfig.saleYear && (
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Section 121 Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              asset.section121Exclusion.isEligible 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {asset.section121Exclusion.isEligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                          </div>
                          {asset.section121Exclusion.isEligible && (
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <div>Exclusion Applied: ${asset.section121Exclusion.appliedExclusion.toLocaleString()}</div>
                              <div>Remaining Taxable Gain: ${asset.section121Exclusion.remainingGain.toLocaleString()}</div>
                            </div>
                          )}
                          {!asset.section121Exclusion.isEligible && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {asset.section121Exclusion.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Depreciation Recapture Section */}
            <div className="group md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                Depreciation Recapture (Section 1250)
              </h4>
              <div className="space-y-4">
                {/* Enable Depreciation Recapture */}
                <ValidatedCheckboxInput
                  label="Apply Depreciation Recapture"
                  checked={asset.inputs.saleConfig.enableDepreciationRecapture}
                  onChange={(checked) => handleSaleConfigUpdate('enableDepreciationRecapture', checked)}
                  validationContext={validationContext}
                  fieldName="enableDepreciationRecapture"
                  helpText="IRS Section 1250 requires recapture of depreciation taken on real property (taxed up to 25%)"
                />

                {asset.inputs.saleConfig.enableDepreciationRecapture && (
                  <div className="ml-7 space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Total Depreciation Taken */}
                      <ValidatedCurrencyInput
                        label="Total Depreciation Taken"
                        value={asset.inputs.saleConfig.totalDepreciationTaken}
                        onChange={(value) => handleSaleConfigUpdate('totalDepreciationTaken', value)}
                        validationContext={validationContext}
                        fieldName="totalDepreciationTaken"
                        validateOnBlur={true}
                        helpText="Cumulative depreciation deductions taken"
                        placeholder="0"
                      />

                      {/* Land Value Percentage */}
                      <ValidatedPercentageInput
                        label="Land Value %"
                        value={asset.inputs.saleConfig.landValuePercentage.toString()}
                        onChange={(value) => handleSaleConfigUpdate('landValuePercentage', value)}
                        validationContext={validationContext}
                        fieldName="landValuePercentage"
                        validateOnBlur={true}
                        helpText="Estimated land value (not depreciable)"
                        placeholder="20"
                        highValueWarning={{ threshold: 50, message: 'Land value above 50% is unusually high' }}
                      />
                    </div>

                    {/* Depreciation Helper Calculator */}
                    {asset.inputs.saleConfig.yearsOwned && (
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                        <div className="text-sm">
                          <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Depreciation Helper
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <div>Property Value: ${(parseFloat(asset.inputs.purchasePrice) || 0).toLocaleString()}</div>
                            <div>Land Value ({asset.inputs.saleConfig.landValuePercentage}%): ${((parseFloat(asset.inputs.purchasePrice) || 0) * (parseFloat(asset.inputs.saleConfig.landValuePercentage) || 20) / 100).toLocaleString()}</div>
                            <div>Depreciable Basis: ${((parseFloat(asset.inputs.purchasePrice) || 0) * (1 - (parseFloat(asset.inputs.saleConfig.landValuePercentage) || 20) / 100)).toLocaleString()}</div>
                            <div>Annual Depreciation (27.5 years): ${(((parseFloat(asset.inputs.purchasePrice) || 0) * (1 - (parseFloat(asset.inputs.saleConfig.landValuePercentage) || 20) / 100)) / 27.5).toLocaleString()}</div>
                            <div className="pt-1 border-t border-gray-200 dark:border-gray-600">
                              Estimated Total ({parseFloat(asset.inputs.saleConfig.yearsOwned) || 0} years): ${(((parseFloat(asset.inputs.purchasePrice) || 0) * (1 - (parseFloat(asset.inputs.saleConfig.landValuePercentage) || 20) / 100)) / 27.5 * (parseFloat(asset.inputs.saleConfig.yearsOwned) || 0)).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Depreciation Recapture Status Display */}
                    {asset.inputs.saleConfig.saleYear && (
                      <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Depreciation Recapture:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              asset.depreciationRecaptureCalculation.hasRecapture 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {asset.depreciationRecaptureCalculation.hasRecapture ? 'Tax Due' : 'No Recapture'}
                            </span>
                          </div>
                          {asset.depreciationRecaptureCalculation.hasRecapture && (
                            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              <div>Recapture Amount: ${asset.depreciationRecaptureCalculation.recaptureAmount.toLocaleString()}</div>
                              <div>Recapture Rate: {(asset.depreciationRecaptureCalculation.recaptureRate * 100).toFixed(1)}%</div>
                              <div className="font-medium text-yellow-600 dark:text-yellow-400">
                                Recapture Tax: ${asset.depreciationRecaptureCalculation.recaptureTax.toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sale Proceeds Reinvestment */}
            <div className="group">
              <ValidatedCheckboxInput
                label="Reinvest sale proceeds"
                checked={asset.inputs.saleConfig.reinvestProceeds}
                onChange={(checked) => handleSaleConfigUpdate('reinvestProceeds', checked)}
                validationContext={validationContext}
                fieldName="reinvestProceeds"
                helpText="Automatically reinvest the net proceeds from the sale into a selected investment"
              />
              {asset.inputs.saleConfig.reinvestProceeds && (
                <div className="ml-7 mt-2">
                  <ValidatedSelectInput
                    label="Target Investment"
                    value={asset.inputs.saleConfig.targetInvestmentId || ''}
                    onChange={(value) => handleSaleConfigUpdate('targetInvestmentId', value || null)}
                    options={[
                      { value: '', label: 'Select target investment...', disabled: true },
                      ...availableInvestments.map((investment) => ({
                        value: investment.id,
                        label: investment.name
                      }))
                    ]}
                    validationContext={validationContext}
                    fieldName="targetInvestmentId"
                    validateOnBlur={true}
                    required={asset.inputs.saleConfig.reinvestProceeds}
                    placeholder="Select target investment..."
                  />
                  {availableInvestments.length === 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      Create an investment asset first to reinvest proceeds into it.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sale Summary */}
          {asset.inputs.saleConfig.saleYear && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Sale Summary (Year {asset.inputs.saleConfig.saleYear})
              </h4>
              
              {/* Basic Sale Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sale Price:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${asset.effectiveSalePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Selling Costs:</span>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    -${asset.sellingCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Mortgage Payoff:</span>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    -${asset.results[asset.inputs.saleConfig.saleYear]?.preSaleMortgageBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Net Proceeds:</span>
                  <div className={`font-medium ${asset.netSaleProceeds >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${asset.netSaleProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Tax Calculation */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Tax Calculation
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Cost Basis:</span>
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      ${asset.adjustedCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Capital Gain/Loss:</span>
                    <div className={`font-medium ${asset.capitalGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${asset.capitalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  {/* Section 121 Exclusion */}
                  {asset.inputs.saleConfig.enableSection121 && asset.section121Exclusion.appliedExclusion > 0 && (
                    <>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Section 121 Exclusion:</span>
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          -${asset.section121Exclusion.appliedExclusion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Taxable Gain:</span>
                        <div className={`font-medium ${asset.section121Exclusion.remainingGain >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          ${asset.section121Exclusion.remainingGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Federal Tax */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Federal Tax ({asset.federalTaxCalculation.taxRate > 0 ? (asset.federalTaxCalculation.taxRate * 100).toFixed(0) + '%' : '0%'}):</span>
                    <div className={`font-medium ${asset.federalTaxAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      -${asset.federalTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  {/* State Tax */}
                  {asset.inputs.saleConfig.enableStateTax && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        State Tax ({asset.stateTaxCalculation.stateName}: {asset.stateTaxCalculation.hasCapitalGainsTax ? (asset.stateTaxCalculation.taxRate * 100).toFixed(1) + '%' : '0%'}):
                      </span>
                      <div className={`font-medium ${asset.stateTaxAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        -${asset.stateTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  
                  {/* Total Tax */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Total Tax:</span>
                    <div className={`font-medium ${asset.totalTaxAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      -${asset.totalTaxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Amount */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Final After-Tax Proceeds:</span>
                  <div className={`font-bold text-2xl ${asset.netAfterTaxProceeds >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${asset.netAfterTaxProceeds.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </CollapsibleSection>
  );
});