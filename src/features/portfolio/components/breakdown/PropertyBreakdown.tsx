import React from 'react';
import type { CombinedResult } from '@/features/portfolio/stores/PortfolioStore';

interface PropertyBreakdownProps {
  breakdown: CombinedResult['assetBreakdown'][0];
}

export const PropertyBreakdown: React.FC<PropertyBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span>Property Value:</span>
        <span>${(breakdown.propertyValue || 0).toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Mortgage Balance:</span>
        <span className="text-red-600 dark:text-red-400">
          ${(breakdown.mortgageBalance || 0).toLocaleString()}
        </span>
      </div>
      <div className="flex justify-between font-medium">
        <span>Net Equity:</span>
        <span>${breakdown.balance.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Monthly Payment:</span>
        <span>${(breakdown.monthlyPayment || 0).toLocaleString()}</span>
      </div>
      {breakdown.principalInterestPayment && breakdown.otherFeesPayment && (
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          <div className="flex justify-between">
            <span>• Principal & Interest:</span>
            <span>${breakdown.principalInterestPayment.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>• Taxes & Other Fees:</span>
            <span>${breakdown.otherFeesPayment.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};