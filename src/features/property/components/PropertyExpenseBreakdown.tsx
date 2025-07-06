import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface PropertyExpenseBreakdownProps {
  asset: Property;
}

export const PropertyExpenseBreakdown: React.FC<PropertyExpenseBreakdownProps> = observer(({ asset }) => {
  // Only show breakdown for rental properties
  if (!asset.inputs.isRentalProperty || !asset.hasResults) {
    return null;
  }

  const latestResult = asset.finalResult;
  if (!latestResult) {
    return null;
  }

  const hasPropertyManagement = asset.inputs.propertyManagementEnabled;
  const maintenanceRate = parseFloat(asset.inputs.maintenanceRate || '0');
  const listingFeeRate = parseFloat(asset.inputs.listingFeeRate || '0');
  const managementFeeRate = parseFloat(asset.inputs.monthlyManagementFeeRate || '0');
  const vacancyRate = parseFloat(asset.inputs.vacancyRate || '0');
  
  // Calculate vacancy impact for display
  const monthlyRent = parseFloat(asset.inputs.monthlyRent || '0');
  const rentGrowthRate = parseFloat(asset.inputs.rentGrowthRate || '0');
  const finalYear = latestResult.year;
  const grownMonthlyRent = monthlyRent * Math.pow(1 + rentGrowthRate / 100, finalYear);
  const grossAnnualRent = grownMonthlyRent * 12;
  const vacancyLoss = grossAnnualRent * (vacancyRate / 100);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700 animate-slide-up">
      <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        Rental Expense Breakdown
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
          (Final Year)
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Maintenance Expenses */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Maintenance
            </h4>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-orange-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">{maintenanceRate}%</span>
            </div>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${latestResult.maintenanceExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Based on property value
          </div>
        </div>

        {/* Listing Expenses */}
        {hasPropertyManagement && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Listing Fees
              </h4>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">{listingFeeRate}%</span>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${latestResult.listingExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Tenant placement fees
            </div>
          </div>
        )}

        {/* Management Expenses */}
        {hasPropertyManagement && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Management
              </h4>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">{managementFeeRate}%</span>
              </div>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${latestResult.monthlyManagementExpenses.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Of collected rent
            </div>
          </div>
        )}

        {/* Total Expenses */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-300">
              Total Expenses
            </h4>
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-xl font-bold text-red-900 dark:text-red-100">
            ${latestResult.totalRentalExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            Annual total
          </div>
        </div>
      </div>

      {/* Vacancy Impact Section */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
        <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          Vacancy Impact ({vacancyRate}% vacancy rate)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Gross Potential Rent:</span>
            <div className="font-semibold text-yellow-900 dark:text-yellow-100">
              ${grossAnnualRent.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Vacancy Loss:</span>
            <div className="font-semibold text-red-600 dark:text-red-400">
              -${vacancyLoss.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-yellow-700 dark:text-yellow-300">Net Rental Income:</span>
            <div className="font-semibold text-green-600 dark:text-green-400">
              ${latestResult.annualRentalIncome.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Rate Summary */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Expense Rate Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">As % of Rental Income:</span>
            <span className="font-semibold text-gray-900 dark:text-white ml-2">
              {latestResult.annualRentalIncome > 0 
                ? `${((latestResult.totalRentalExpenses / latestResult.annualRentalIncome) * 100).toFixed(1)}%`
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">As % of Property Value:</span>
            <span className="font-semibold text-gray-900 dark:text-white ml-2">
              {latestResult.balance > 0 
                ? `${((latestResult.totalRentalExpenses / latestResult.balance) * 100).toFixed(1)}%`
                : 'N/A'
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Net Operating Income:</span>
            <span className={`font-semibold ml-2 ${
              (latestResult.annualRentalIncome - latestResult.totalRentalExpenses) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ${(latestResult.annualRentalIncome - latestResult.totalRentalExpenses).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Expense Model Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Enhanced Expense Model:</strong> Maintenance scales with property value (unaffected by vacancy). 
              {hasPropertyManagement && ' Listing fees are calculated based on realistic tenant turnover frequency - higher vacancy rates mean shorter tenant stays and more frequent re-listing costs. Management fees are based on actual rent collected (vacancy reduces these fees).'}
              {!hasPropertyManagement && ' Enable property management to see vacancy-dependent listing and management fees.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});