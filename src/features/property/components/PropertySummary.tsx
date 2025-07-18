import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { CurrencyDisplay } from '@/features/shared/components/CurrencyDisplay';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface PropertySummaryProps {
  asset: Property;
}

export const PropertySummary: React.FC<PropertySummaryProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  const finalResult = asset.finalResult;
  const summary = asset.summaryData;

  if (!finalResult || !summary) {
    return null;
  }

  // Calculate final year and projection period for title
  const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();
  const projectionYears = parseInt(portfolioStore.years) || 10;
  const finalYear = startingYear + projectionYears;

  const {
    purchasePrice,
    downPaymentPercentage,
    downPaymentAmount,
    loanAmount,
    interestRate,
    loanTerm,
    monthlyPayment,
    remainingBalance,
    totalInterest,
    paidOff,
    currentCashFlow,
    monthlyCashFlow,
    isPositiveCashFlow
  } = summary;

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  return (
    <CollapsibleSection title={`Property Summary for ${finalYear} (+${projectionYears} years)`} icon={icon} defaultExpanded={true}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Purchase Price */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Purchase Price
          </h3>
          <CurrencyDisplay
            amount={purchasePrice}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Down: <CurrencyDisplay amount={downPaymentAmount} className="inline" /> ({downPaymentPercentage}%)
          </p>
        </div>

        {/* Loan Amount */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Loan Amount
          </h3>
          <CurrencyDisplay
            amount={loanAmount}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {interestRate}% for {loanTerm} years
          </p>
        </div>

        {/* Yearly Payment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Yearly Payment
          </h3>
          <CurrencyDisplay
            amount={monthlyPayment * 12}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monthly: <CurrencyDisplay amount={monthlyPayment} className="inline" />
          </p>
        </div>

        {/* Remaining Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Remaining Balance
          </h3>
          <CurrencyDisplay
            amount={remainingBalance}
            className={`text-2xl font-bold ${paidOff ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {paidOff ? 'Paid Off!' : `After ${finalResult.year} years`}
          </p>
        </div>

        {/* Total Interest */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Interest
          </h3>
          <CurrencyDisplay
            amount={totalInterest}
            className="text-2xl font-bold text-red-600 dark:text-red-400"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Over {loanTerm} years
          </p>
        </div>

        {/* Annual Cash Flow */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center">
            Annual Cash Flow
            {asset.inputs.isRentalProperty && (
              <svg className="w-4 h-4 ml-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )}
          </h3>
          <CurrencyDisplay
            amount={currentCashFlow}
            options={{ showPositiveSign: true }}
            className={`text-2xl font-bold ${
              isPositiveCashFlow 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monthly: <CurrencyDisplay 
              amount={monthlyCashFlow} 
              options={{ showPositiveSign: true }}
              className="inline"
            />
          </p>
          {asset.inputs.isRentalProperty && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isPositiveCashFlow ? 'Income exceeds expenses' : 'Expenses exceed income'}
            </p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
});