import React from 'react';
import { Property } from '@/features/property/stores/Property';
import type { CombinedResult } from '@/features/portfolio/stores/PortfolioStore';

interface InvestmentBreakdownProps {
  breakdown: CombinedResult['assetBreakdown'][0];
  linkedProperties: Property[];
}

export const InvestmentBreakdown: React.FC<InvestmentBreakdownProps> = ({
  breakdown,
  linkedProperties
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <span>Annual Contribution:</span>
        <span>${breakdown.contribution.toLocaleString()}</span>
      </div>
      {linkedProperties.length > 0 && (
        <div className="flex justify-between text-red-600 dark:text-red-400">
          <span>Property Cash Flows:</span>
          <span>-${(linkedProperties.reduce((total: number, prop) => {
            const monthlyPayment = parseFloat(prop.inputs.monthlyPayment) || prop.calculatedPrincipalInterestPayment;
            return total + (monthlyPayment * 12);
          }, 0)).toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Current Balance:</span>
        <span>${breakdown.balance.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Real Value:</span>
        <span>${breakdown.realBalance.toLocaleString()}</span>
      </div>
    </div>
  );
};