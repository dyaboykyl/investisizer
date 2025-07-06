import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';

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

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Property Sale Planning
        </h2>
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
      </div>

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
                  max={parseInt(asset.inputs.years) || 10}
                  value={asset.inputs.saleConfig.saleYear || ''}
                  onChange={(e) => handleSaleConfigUpdate('saleYear', parseInt(e.target.value) || null)}
                  className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">year</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Year within the {parseInt(asset.inputs.years) || 10}-year projection period
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
                      Use projected value: ${asset.projectedSalePrice.toLocaleString()}
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
                Real estate agent fees, closing costs, etc. (${asset.sellingCosts.toLocaleString()})
              </p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Sale Price:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${asset.effectiveSalePrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Selling Costs:</span>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    -${asset.sellingCosts.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Mortgage Payoff:</span>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    -{asset.results[asset.inputs.saleConfig.saleYear]?.preSaleMortgageBalance?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Net Proceeds:</span>
                  <div className={`font-medium ${asset.netSaleProceeds >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    ${asset.netSaleProceeds.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});