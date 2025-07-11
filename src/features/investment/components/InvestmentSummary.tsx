import { observer } from 'mobx-react-lite';
import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { CurrencyDisplay } from '@/features/shared/components/CurrencyDisplay';

interface InvestmentSummaryProps {
  asset: Investment;
}

export const InvestmentSummary: React.FC<InvestmentSummaryProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  const finalResult = asset.finalResult;
  const summary = asset.summaryData;

  if (!finalResult || !summary) {
    return null;
  }

  const {
    initialAmount,
    totalManualContributed,
    totalManualWithdrawn,
    totalPropertyCashFlow,
    totalContributed,
    totalWithdrawn,
    netContributions,
    totalEarnings,
    totalReturn,
    finalNetGain,
    realFinalNetGain,
    linkedProperties
  } = summary;

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Asset Summary" icon={icon} defaultExpanded={true}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Final Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Final Balance
          </h3>
          {!portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - swap to show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.realBalance}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay amount={finalResult.balance} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={finalResult.balance}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.realBalance} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Initial Investment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Initial Investment
          </h3>
          <CurrencyDisplay
            amount={Math.round(initialAmount)}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalContributed > 0 && (
              <div>Manual added: <CurrencyDisplay amount={Math.round(totalContributed)} className="inline" /></div>
            )}
            {totalWithdrawn > 0 && (
              <div>Total withdrawn: <CurrencyDisplay amount={Math.round(totalWithdrawn)} className="inline" /></div>
            )}
            {linkedProperties.length > 0 && (
              <div className="text-purple-600 dark:text-purple-400">
                {linkedProperties.length} linked propert{linkedProperties.length === 1 ? 'y' : 'ies'}
              </div>
            )}
            {totalContributed === 0 && totalWithdrawn === 0 && linkedProperties.length === 0 && (
              <div>Starting amount only</div>
            )}
          </div>
        </div>

        {/* Net Deposits/Withdrawals */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Net Cash Flow
          </h3>
          <CurrencyDisplay
            amount={Math.round(netContributions)}
            options={{ showPositiveSign: true }}
            className={`text-2xl font-bold ${netContributions >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
            {totalManualContributed > 0 && (
              <div className="flex justify-between">
                <span>Manual contributions:</span>
                <CurrencyDisplay
                  amount={Math.round(totalManualContributed)}
                  options={{ showPositiveSign: true }}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            )}
            {totalManualWithdrawn > 0 && (
              <div className="flex justify-between">
                <span>Manual withdrawals:</span>
                <CurrencyDisplay
                  amount={-Math.round(totalManualWithdrawn)}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
            )}
            {totalPropertyCashFlow > 0 && (
              <div className="flex justify-between">
                <span>Property cash flows:</span>
                <CurrencyDisplay
                  amount={-Math.round(totalPropertyCashFlow)}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
            )}
            {netContributions === 0 && totalManualContributed === 0 && totalPropertyCashFlow === 0 && (
              <span>No cash flows</span>
            )}
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Earnings
          </h3>
          {!portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - swap to show real prominently
            <>
              <CurrencyDisplay
                amount={finalResult.realTotalEarnings}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay amount={Math.round(totalEarnings)} className="inline" />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={Math.round(totalEarnings)}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay amount={finalResult.realTotalEarnings} className="inline" />
              </p>
            </>
          )}
        </div>

        {/* Total Return */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Return
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalReturn.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {asset.inputs.rateOfReturn}% annual
          </p>
        </div>

        {/* Final Net Gain */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Final Net Gain
          </h3>
          {!portfolioStore.showNominal && portfolioStore.showReal ? (
            // Only real selected - swap to show real prominently
            <>
              <CurrencyDisplay
                amount={Math.round(realFinalNetGain)}
                options={{ showPositiveSign: true }}
                className={`text-2xl font-bold ${realFinalNetGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Nominal: <CurrencyDisplay
                  amount={Math.round(finalNetGain)}
                  options={{ showPositiveSign: true }}
                  className="inline"
                />
              </p>
            </>
          ) : (
            // Nominal only or both selected - show nominal prominently with real underneath
            <>
              <CurrencyDisplay
                amount={Math.round(finalNetGain)}
                options={{ showPositiveSign: true }}
                className={`text-2xl font-bold ${finalNetGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Real: <CurrencyDisplay
                  amount={Math.round(realFinalNetGain)}
                  options={{ showPositiveSign: true }}
                  className="inline"
                />
              </p>
            </>
          )}
        </div>
      </div>

      {/* Linked Properties Section */}
      {linkedProperties.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Linked Properties ({linkedProperties.length})
          </h3>
          <div className="space-y-3">
            {linkedProperties.map((property: any) => {
              const monthlyPayment = parseFloat(property.inputs.monthlyPayment) || property.calculatedPrincipalInterestPayment;
              const annualPayment = monthlyPayment * 12;
              const totalPayments = annualPayment * parseInt(portfolioStore.years.toString());
              
              return (
                <div key={property.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <CurrencyDisplay amount={monthlyPayment} className="inline" />/month • <CurrencyDisplay amount={annualPayment} className="inline" />/year
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay
                      amount={-totalPayments}
                      className="font-semibold text-red-600 dark:text-red-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total over {portfolioStore.years} years
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-orange-800 dark:text-orange-200">
                <p className="font-medium">Property Payment Impact</p>
                <p className="mt-1">
                  These property payments are automatically withdrawn from this investment each month, 
                  reducing the available balance for growth. The total impact over {portfolioStore.years} years is 
                  <CurrencyDisplay
                    amount={-Math.round(totalPropertyCashFlow)}
                    className="font-semibold inline"
                  />.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
});