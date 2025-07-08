import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';

interface VacancyImpactDisplayProps {
  asset: Property;
}

export const VacancyImpactDisplay: React.FC<VacancyImpactDisplayProps> = observer(({ asset }) => {
  const latestResult = asset.finalResult;
  const hasResults = asset.inputs.isRentalProperty && asset.hasResults && latestResult;
  
  // Calculate vacancy impact for display
  const monthlyRent = parseFloat(asset.inputs.monthlyRent || '0');
  const rentGrowthRate = parseFloat(asset.inputs.rentGrowthRate || '0');
  const vacancyRate = parseFloat(asset.inputs.vacancyRate || '0');
  
  let grossAnnualRent = 0;
  let vacancyLoss = 0;
  if (hasResults) {
    const finalYear = latestResult!.year;
    const grownMonthlyRent = monthlyRent * Math.pow(1 + rentGrowthRate / 100, finalYear);
    grossAnnualRent = grownMonthlyRent * 12;
    vacancyLoss = grossAnnualRent * (vacancyRate / 100);
  }

  if (!hasResults) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
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
            ${grossAnnualRent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Vacancy Loss:</span>
          <div className="font-semibold text-red-600 dark:text-red-400">
            -${vacancyLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <span className="text-yellow-700 dark:text-yellow-300">Net Rental Income:</span>
          <div className="font-semibold text-green-600 dark:text-green-400">
            ${latestResult!.annualRentalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
});