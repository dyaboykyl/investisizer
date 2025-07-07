import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import type { FilingStatus } from '@/features/tax/types';
import { getStateChoices } from '@/features/tax/data/StateTaxRates';

interface PropertySaleConfigProps {
  asset: Property;
}

export const PropertySaleConfig: React.FC<PropertySaleConfigProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();

  // Get available investment assets for reinvestment target
  const availableInvestments = portfolioStore.investments.filter(inv => inv.id !== asset.id);

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
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={asset.inputs.saleConfig.isPlannedForSale}
            onChange={(e) => handleSaleToggle(e.target.checked)}
            className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Plan to sell this property
          </span>
        </label>

      {!asset.inputs.saleConfig.isPlannedForSale && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Enable sale planning to configure when and how you plan to sell this property.
          This will affect projected cash flows and linked investment contributions.
        </p>
      )}

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
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Year to Sell
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={portfolioStore.years}
                  value={asset.inputs.saleConfig.saleYear || ''}
                  onChange={(e) => handleSaleConfigUpdate('saleYear', parseInt(e.target.value) || null)}
                  className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">year</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Year within the {portfolioStore.years}-year projection period
              </p>
            </div>

            {/* Sale Month */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Month to Sell
              </label>
              <select
                value={asset.inputs.saleConfig.saleMonth}
                onChange={(e) => handleSaleConfigUpdate('saleMonth', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    Month {month} ({new Date(2000, month - 1).toLocaleString('default', { month: 'long' })})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Affects partial-year calculations for rental income and expenses
              </p>
            </div>

            {/* Sale Price Configuration */}
            <div className="group md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Sale Price Method
              </label>
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="radio"
                    checked={asset.inputs.saleConfig.useProjectedValue}
                    onChange={() => handleSaleConfigUpdate('useProjectedValue', true)}
                    className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use projected value: ${asset.projectedSalePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Based on {asset.inputs.propertyGrowthRate}% annual growth from {asset.inputs.propertyGrowthModel === 'purchase_price' ? 'purchase price' : 'current estimated value'}
                    </p>
                  </div>
                </label>
                <label className="flex items-start space-x-3">
                  <input
                    type="radio"
                    checked={!asset.inputs.saleConfig.useProjectedValue}
                    onChange={() => handleSaleConfigUpdate('useProjectedValue', false)}
                    className="mt-1 w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use custom sale price
                    </span>
                    {!asset.inputs.saleConfig.useProjectedValue && (
                      <div className="mt-2">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">$</span>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            value={asset.inputs.saleConfig.expectedSalePrice || ''}
                            onChange={(e) => handleSaleConfigUpdate('expectedSalePrice', parseFloat(e.target.value) || 0)}
                            placeholder="Enter expected sale price"
                            className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Selling Costs */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Selling Costs (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.saleConfig.sellingCostsPercentage}
                  onChange={(e) => handleSaleConfigUpdate('sellingCostsPercentage', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Real estate agent fees, closing costs, etc. (${asset.sellingCosts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </p>
            </div>

            {/* Capital Improvements */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Capital Improvements
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={asset.inputs.saleConfig.capitalImprovements}
                  onChange={(e) => handleSaleConfigUpdate('capitalImprovements', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Cost of improvements that increase property basis (reduces capital gains tax)
              </p>
            </div>

            {/* Original Buying Costs */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Original Buying Costs
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={asset.inputs.saleConfig.originalBuyingCosts}
                  onChange={(e) => handleSaleConfigUpdate('originalBuyingCosts', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Transaction costs from original purchase (legal, inspection, etc.)
              </p>
            </div>

            {/* Tax Profile Section */}
            <div className="group md:col-span-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                Tax Profile (Property-Specific)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filing Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Filing Status
                  </label>
                  <select
                    value={asset.inputs.saleConfig.filingStatus}
                    onChange={(e) => handleSaleConfigUpdate('filingStatus', e.target.value as FilingStatus)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="single">Single</option>
                    <option value="married_joint">Married Filing Jointly</option>
                    <option value="married_separate">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tax filing status at time of sale
                  </p>
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Annual Income
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={asset.inputs.saleConfig.annualIncome}
                      onChange={(e) => handleSaleConfigUpdate('annualIncome', e.target.value)}
                      placeholder="75000"
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Expected annual income in year of sale
                  </p>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    State/Location
                  </label>
                  <select
                    value={asset.inputs.saleConfig.state}
                    onChange={(e) => handleSaleConfigUpdate('state', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="">Select a state...</option>
                    {getStateChoices().map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Property location or state of residence for tax purposes
                  </p>
                </div>

                {/* Other Capital Gains */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Other Capital Gains
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={asset.inputs.saleConfig.otherCapitalGains}
                      onChange={(e) => handleSaleConfigUpdate('otherCapitalGains', e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Other capital gains for the year
                  </p>
                </div>

                {/* Carryover Losses */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Carryover Losses
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={asset.inputs.saleConfig.carryoverLosses}
                      onChange={(e) => handleSaleConfigUpdate('carryoverLosses', e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Capital loss carryovers from previous years
                  </p>
                </div>

                {/* State Tax Toggle */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={asset.inputs.saleConfig.enableStateTax}
                      onChange={(e) => handleSaleConfigUpdate('enableStateTax', e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Enable State Tax Calculations</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    Calculate state capital gains tax based on property location or residence
                  </p>
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
                <div>
                  <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={asset.inputs.saleConfig.enableSection121}
                      onChange={(e) => handleSaleConfigUpdate('enableSection121', e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Apply Section 121 Exclusion</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                    IRS Section 121 allows exclusion of up to $250k ($500k married) of capital gains on primary residence
                  </p>
                </div>

                {asset.inputs.saleConfig.enableSection121 && (
                  <div className="ml-7 space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Is Primary Residence */}
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={asset.inputs.saleConfig.isPrimaryResidence}
                            onChange={(e) => handleSaleConfigUpdate('isPrimaryResidence', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span>This is my primary residence</span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                          Property must qualify as your main home
                        </p>
                      </div>

                      {/* Years Owned */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Years Owned
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            value={asset.inputs.saleConfig.yearsOwned}
                            onChange={(e) => handleSaleConfigUpdate('yearsOwned', e.target.value)}
                            placeholder="2.5"
                            className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">years</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Must own for at least 2 years
                        </p>
                      </div>

                      {/* Years Lived */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Years Lived In
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*[.]?[0-9]*"
                            value={asset.inputs.saleConfig.yearsLived}
                            onChange={(e) => handleSaleConfigUpdate('yearsLived', e.target.value)}
                            placeholder="2.5"
                            className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">years</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Must live in for at least 2 years
                        </p>
                      </div>

                      {/* Previous Exclusion Usage */}
                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={asset.inputs.saleConfig.hasUsedExclusionInLastTwoYears}
                            onChange={(e) => handleSaleConfigUpdate('hasUsedExclusionInLastTwoYears', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span>Used Section 121 exclusion in last 2 years</span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                          If checked, you may not be eligible for the full exclusion
                        </p>
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

            {/* Sale Proceeds Reinvestment */}
            <div className="group">
              <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <input
                  type="checkbox"
                  checked={asset.inputs.saleConfig.reinvestProceeds}
                  onChange={(e) => handleSaleConfigUpdate('reinvestProceeds', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span>Reinvest sale proceeds</span>
              </label>
              {asset.inputs.saleConfig.reinvestProceeds && (
                <div className="ml-7 mt-2">
                  <select
                    value={asset.inputs.saleConfig.targetInvestmentId || ''}
                    onChange={(e) => handleSaleConfigUpdate('targetInvestmentId', e.target.value || null)}
                    className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="">Select target investment...</option>
                    {availableInvestments.map((investment) => (
                      <option key={investment.id} value={investment.id}>
                        {investment.name}
                      </option>
                    ))}
                  </select>
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