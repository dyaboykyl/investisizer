import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '../../stores/Property';

interface PropertySummaryProps {
  asset: Property;
}

export const PropertySummary: React.FC<PropertySummaryProps> = observer(({ asset }) => {
  const finalResult = asset.finalResult;

  if (!finalResult) {
    return null;
  }

  const purchasePrice = parseFloat(asset.inputs.purchasePrice || '0') || 0;
  const downPaymentPercentage = parseFloat(asset.inputs.downPaymentPercentage || '20') || 20;
  const interestRate = parseFloat(asset.inputs.interestRate || '0') || 0;
  const loanTerm = parseInt(asset.inputs.loanTerm || '30') || 30;
  
  const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
  const loanAmount = purchasePrice - downPaymentAmount;
  const monthlyPayment = finalResult.monthlyPayment || 0;
  const remainingBalance = finalResult.mortgageBalance || 0;
  const totalPaid = monthlyPayment * 12 * loanTerm;
  const totalInterest = totalPaid - loanAmount;
  const paidOff = remainingBalance === 0;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Property Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {/* Purchase Price */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Purchase Price
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${purchasePrice.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Down: ${downPaymentAmount.toLocaleString()} ({downPaymentPercentage}%)
          </p>
        </div>

        {/* Loan Amount */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Loan Amount
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${loanAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {interestRate}% for {loanTerm} years
          </p>
        </div>

        {/* Yearly Payment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Yearly Payment
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${(monthlyPayment * 12).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monthly: ${monthlyPayment.toLocaleString()}
          </p>
        </div>

        {/* Remaining Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Remaining Balance
          </h3>
          <p className={`text-2xl font-bold ${paidOff ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
            ${remainingBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {paidOff ? 'Paid Off!' : `After ${finalResult.year} years`}
          </p>
        </div>

        {/* Total Interest */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Interest
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${totalInterest.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Over {loanTerm} years
          </p>
        </div>
      </div>
    </div>
  );
});