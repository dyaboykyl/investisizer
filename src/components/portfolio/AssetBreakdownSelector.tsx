import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../../stores/PortfolioStore';
import { usePortfolioStore } from '../../stores/hooks';

interface AssetBreakdownSelectorProps {
  finalResult: CombinedResult | undefined;
}

export const AssetBreakdownSelector: React.FC<AssetBreakdownSelectorProps> = observer(({ finalResult }) => {
  const portfolioStore = usePortfolioStore();
  const { assetsList } = portfolioStore;

  // Find the breakdown data for each asset
  const getAssetBreakdown = (assetId: string) => {
    return finalResult?.assetBreakdown.find(breakdown => breakdown.assetId === assetId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Asset Portfolio & Breakdown
      </h2>
      
      <div className="space-y-3">
        {assetsList.map((asset) => {
          const breakdown = getAssetBreakdown(asset.id);
          const isEnabled = asset.enabled;
          
          // Check for linked relationships
          const linkedInvestment = asset.type === 'property' && asset.inputs.linkedInvestmentId ? 
            portfolioStore.investments.find(inv => inv.id === asset.inputs.linkedInvestmentId) : null;
          const linkedProperties = asset.type === 'investment' ? 
            portfolioStore.properties.filter(prop => prop.inputs.linkedInvestmentId === asset.id && prop.enabled) : [];
          
          return (
            <div key={asset.id} className={`p-4 rounded-lg border transition-all ${
              isEnabled 
                ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' 
                : 'bg-gray-25 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-60'
            }`}>
              {/* Header with checkbox and asset info */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => {
                    asset.setEnabled(e.target.checked);
                    portfolioStore.markAsChanged();
                  }}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 dark:text-white font-medium">{asset.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.type === 'investment' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {asset.type === 'investment' ? 'Investment' : 'Property'}
                      </span>
                      
                      {/* Show linking indicators */}
                      {linkedInvestment && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Linked to {linkedInvestment.name}
                        </span>
                      )}
                      
                      {linkedProperties.length > 0 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          {linkedProperties.length} linked propert{linkedProperties.length === 1 ? 'y' : 'ies'}
                        </span>
                      )}
                    </div>
                    
                    {/* Final balance/equity on the right */}
                    {isEnabled && breakdown && (
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${breakdown.balance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {((breakdown.balance / (finalResult?.totalBalance || 1)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </label>
              
              {/* Detailed breakdown when enabled */}
              {isEnabled && breakdown && (
                <div className="mt-3 pl-7 border-l-2 border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {breakdown.assetType === 'investment' ? (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Annual Contribution:</span>
                          <span>${breakdown.contribution.toLocaleString()}</span>
                        </div>
                        {linkedProperties.length > 0 && (
                          <div className="flex justify-between text-red-600 dark:text-red-400">
                            <span>Property Withdrawals:</span>
                            <span>-${(linkedProperties.reduce((total, prop) => {
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
                    ) : (
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
                    )}
                  </div>
                </div>
              )}
              
              {/* Disabled state message */}
              {!isEnabled && (
                <div className="mt-2 pl-7 text-sm text-gray-500 dark:text-gray-500">
                  Excluded from net wealth calculations
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {assetsList.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>No assets created yet. Use the + button in the tab bar to add your first asset.</p>
        </div>
      )}
    </div>
  );
});