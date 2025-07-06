import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface PropertyResultsTableProps {
  asset: Property;
}

export const PropertyResultsTable: React.FC<PropertyResultsTableProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  if (!asset.hasResults) {
    return null;
  }

  const showNominal = portfolioStore.showNominal;
  const showReal = portfolioStore.showReal;
  const isRentalProperty = asset.inputs.isRentalProperty;

  // Helper function to format currency values
  const formatCurrency = (value: number, isPositive?: boolean) => {
    const formatted = Math.abs(value).toLocaleString();
    if (isPositive === undefined) {
      return value >= 0 ? `$${formatted}` : `-$${formatted}`;
    }
    return isPositive ? `+$${formatted}` : `-$${formatted}`;
  };

  // Helper function to get column span based on display settings
  const getColSpan = () => {
    if (showNominal && showReal) return 2;
    return 1;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 md:p-6 mt-6 border border-gray-200 dark:border-gray-700 animate-slide-up animation-delay-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Property Results
        </h2>
      </div>

      <div className="overflow-x-auto -mx-3 md:mx-0 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              {/* First row - main categories */}
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <th rowSpan={2} className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-700 z-10">
                  Year
                </th>
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Property Value
                </th>
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Mortgage Payment
                </th>
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Principal
                </th>
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Interest
                </th>
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Mortgage Balance
                </th>
                {isRentalProperty && (
                  <>
                    <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                      Rental Income
                    </th>
                    <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                      Rental Expenses
                    </th>
                  </>
                )}
                <th colSpan={getColSpan()} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l border-gray-200 dark:border-gray-600">
                  Cash Flow
                </th>
              </tr>
              {/* Second row - nominal/real headers */}
              <tr>
                {/* Property Value */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
                {/* Mortgage Payment */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
                {/* Principal */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
                {/* Interest */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
                {/* Mortgage Balance */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
                {/* Rental Income */}
                {isRentalProperty && (
                  <>
                    {showNominal && (
                      <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                        Nominal
                      </th>
                    )}
                    {showReal && (
                      <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        Real
                      </th>
                    )}
                  </>
                )}
                {/* Rental Expenses */}
                {isRentalProperty && (
                  <>
                    {showNominal && (
                      <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                        Nominal
                      </th>
                    )}
                    {showReal && (
                      <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        Real
                      </th>
                    )}
                  </>
                )}
                {/* Cash Flow */}
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 border-l border-gray-200 dark:border-gray-600">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className={`px-3 md:px-6 py-2 text-left text-xs font-medium text-gray-400 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                    Real
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {asset.results.map((result, index) => {
                const inflationRate = parseFloat(asset.inputs.inflationRate || '0') || 0;
                const inflationFactor = Math.pow(1 + inflationRate / 100, result.year);
                
                // Calculate real values
                const realMortgagePayment = result.monthlyPayment * 12 / inflationFactor;
                const realPrincipal = result.principalPaid / inflationFactor;
                const realInterest = result.interestPaid / inflationFactor;
                const realMortgageBalance = result.mortgageBalance / inflationFactor;
                const realRentalIncome = result.annualRentalIncome / inflationFactor;
                const realRentalExpenses = result.annualRentalExpenses / inflationFactor;
                const realCashFlow = result.annualCashFlow / inflationFactor;

                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {result.year}
                    </td>
                    
                    {/* Property Value */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-600">
                        {formatCurrency(result.balance)}
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        {formatCurrency(result.realBalance)}
                      </td>
                    )}
                    
                    {/* Mortgage Payment */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-600">
                        {formatCurrency(result.monthlyPayment * 12)}
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        {formatCurrency(realMortgagePayment)}
                      </td>
                    )}
                    
                    {/* Principal */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-600">
                        {formatCurrency(result.principalPaid)}
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        {formatCurrency(realPrincipal)}
                      </td>
                    )}
                    
                    {/* Interest */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 border-l border-gray-200 dark:border-gray-600">
                        {formatCurrency(result.interestPaid)}
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-300 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        {formatCurrency(realInterest)}
                      </td>
                    )}
                    
                    {/* Mortgage Balance */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium border-l border-gray-200 dark:border-gray-600">
                        <span className={`${result.mortgageBalance === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                          {formatCurrency(result.mortgageBalance)}
                        </span>
                        {result.mortgageBalance === 0 && (
                          <span className="ml-2 text-green-600 dark:text-green-400 text-xs">
                            PAID OFF
                          </span>
                        )}
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        {formatCurrency(realMortgageBalance)}
                      </td>
                    )}
                    
                    {/* Rental Income */}
                    {isRentalProperty && (
                      <>
                        {showNominal && (
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 border-l border-gray-200 dark:border-gray-600">
                            {formatCurrency(result.annualRentalIncome)}
                          </td>
                        )}
                        {showReal && (
                          <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-green-500 dark:text-green-300 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                            {formatCurrency(realRentalIncome)}
                          </td>
                        )}
                      </>
                    )}
                    
                    {/* Rental Expenses */}
                    {isRentalProperty && (
                      <>
                        {showNominal && (
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 border-l border-gray-200 dark:border-gray-600">
                            {formatCurrency(result.annualRentalExpenses)}
                          </td>
                        )}
                        {showReal && (
                          <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-red-300 ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                            {formatCurrency(realRentalExpenses)}
                          </td>
                        )}
                      </>
                    )}
                    
                    {/* Cash Flow */}
                    {showNominal && (
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium border-l border-gray-200 dark:border-gray-600">
                        <span className={`${
                          result.annualCashFlow >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {result.annualCashFlow >= 0 ? '+' : ''}{formatCurrency(result.annualCashFlow)}
                        </span>
                      </td>
                    )}
                    {showReal && (
                      <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-sm ${!showNominal ? 'border-l border-gray-200 dark:border-gray-600' : ''}`}>
                        <span className={`${
                          realCashFlow >= 0 
                            ? 'text-green-500 dark:text-green-300' 
                            : 'text-red-500 dark:text-red-300'
                        }`}>
                          {realCashFlow >= 0 ? '+' : ''}{formatCurrency(realCashFlow)}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});