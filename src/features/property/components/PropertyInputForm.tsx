import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { PropertySaleConfig } from './PropertySaleConfig';

interface PropertyInputFormProps {
  asset: Property;
}

export const PropertyInputForm: React.FC<PropertyInputFormProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  // Get available investment assets for linking
  const availableInvestments = portfolioStore.investments.filter(inv => inv.id !== asset.id);
  
  const handleSave = () => {
    portfolioStore.saveToLocalStorage();
  };

  return (
    <>
      <PropertySaleConfig asset={asset} />
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700 animate-slide-up">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Property Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Years Ago Bought
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={asset.inputs.yearsBought || ''}
              onChange={(e) => {
                asset.updateInput('yearsBought', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">years</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Property Growth Rate (% per year)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.propertyGrowthRate || ''}
              onChange={(e) => {
                asset.updateInput('propertyGrowthRate', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Purchase Price ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.purchasePrice || ''}
              onChange={(e) => {
                asset.updateInput('purchasePrice', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Down Payment (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.downPaymentPercentage || ''}
              onChange={(e) => {
                asset.updateInput('downPaymentPercentage', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Interest Rate (%)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.interestRate || ''}
              onChange={(e) => {
                asset.updateInput('interestRate', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Loan Term (years)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={asset.inputs.loanTerm || ''}
              onChange={(e) => {
                asset.updateInput('loanTerm', e.target.value);
                portfolioStore.markAsChanged();
              }}
              className="w-full px-4 py-2 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">years</span>
            </div>
          </div>
        </div>

        <div className="group md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Total Monthly Payment ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">$</span>
            </div>
            <input
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={asset.inputs.monthlyPayment || asset.calculatedPrincipalInterestPayment.toString()}
              onChange={(e) => {
                asset.updateInput('monthlyPayment', e.target.value);
                portfolioStore.markAsChanged();
                // Investment results now update automatically via computed properties
              }}
              placeholder={`${asset.calculatedPrincipalInterestPayment.toLocaleString()} (calculated P+I)`}
              className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Auto-filled with calculated P+I. Edit to include taxes, insurance, and other fees.
          </p>
        </div>

        {/* Rental Property Toggle */}
        <div className="group md:col-span-2">
          <label className="flex items-center space-x-3 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            <input
              type="checkbox"
              checked={asset.inputs.isRentalProperty}
              onChange={(e) => {
                asset.updateInput('isRentalProperty', e.target.checked);
                portfolioStore.markAsChanged();
              }}
              className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span>This is a rental property</span>
            </div>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
            Enable to track rental income, expenses, and cash flow contributions to linked investments.
          </p>
        </div>

        {/* Rental Property Fields - Only show when rental property is enabled */}
        {asset.inputs.isRentalProperty && (
          <>
            <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-600 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Rental Property Settings
              </h3>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Monthly Rent ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.monthlyRent || ''}
                  onChange={(e) => {
                    asset.updateInput('monthlyRent', e.target.value);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rent Growth Rate (% per year)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.rentGrowthRate || ''}
                  onChange={(e) => {
                    asset.updateInput('rentGrowthRate', e.target.value);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Vacancy Rate (%)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.vacancyRate || ''}
                  onChange={(e) => {
                    asset.updateInput('vacancyRate', e.target.value);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expected percentage of time the property will be vacant.
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Annual Expenses ($)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.annualExpenses || ''}
                  onChange={(e) => {
                    asset.updateInput('annualExpenses', e.target.value);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total annual expenses (maintenance, taxes, insurance, management, etc.).
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Expense Growth Rate (% per year)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={asset.inputs.expenseGrowthRate || ''}
                  onChange={(e) => {
                    asset.updateInput('expenseGrowthRate', e.target.value);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">%</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="group md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Payment Source (Optional)
          </label>
          <select
            value={asset.inputs.linkedInvestmentId || ''}
            onChange={(e) => {
              asset.updateInput('linkedInvestmentId', e.target.value);
              portfolioStore.markAsChanged();
              // Investment results now update automatically via computed properties
            }}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="">Pay from external source (not tracked)</option>
            {availableInvestments.map((investment) => (
              <option key={investment.id} value={investment.id}>
                {asset.inputs.isRentalProperty 
                  ? `Link cash flows with "${investment.name}" investment`
                  : `Withdraw from "${investment.name}" investment`
                }
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {asset.inputs.isRentalProperty 
              ? "If selected, net cash flows (income - expenses - payments) will be contributed to or withdrawn from the chosen investment."
              : "If selected, monthly payments will be withdrawn from the chosen investment asset, reducing its balance."
            }
          </p>
          {availableInvestments.length === 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Create an investment asset first to link property payments to it.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 group"
      >
        <span>Save Property</span>
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
    </>
  );
});