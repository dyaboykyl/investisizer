import React from 'react';
import { observer } from 'mobx-react-lite';
import { useInvestmentStore } from '../stores/StoreContext';
import { ProjectionChart } from './ProjectionChart';

export const InvestmentCalculator: React.FC = observer(() => {
  const store = useInvestmentStore();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Investment Portfolio Projection</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Amount ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={store.initialAmount}
              onChange={(e) => store.setInitialAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Period (Years)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={store.years}
              onChange={(e) => store.setYears(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Rate of Return (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={store.rateOfReturn}
              onChange={(e) => store.setRateOfReturn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Inflation Rate (%)
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={store.inflationRate}
              onChange={(e) => store.setInflationRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Contribution/Withdrawal ($)
            </label>
            <input
              type="text"
              inputMode="decimal"
              pattern="[\-]?[0-9]*[.]?[0-9]*"
              value={store.annualContribution}
              onChange={(e) => store.setAnnualContribution(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Use negative values for withdrawals</p>
          </div>
        </div>
        
        <button
          onClick={() => store.calculateProjection()}
          className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Calculate Projection
        </button>
      </div>
      
      {store.hasResults && (
        <>
          <ProjectionChart data={store.results} />
          
          <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Projection Results</h2>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 border-r pr-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={store.showNominal}
                    onChange={(e) => {
                      if (!e.target.checked && !store.showReal) {
                        store.setShowReal(true);
                      }
                      store.setShowNominal(e.target.checked);
                    }}
                    className="mr-1"
                  />
                  Nominal
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={store.showReal}
                    onChange={(e) => {
                      if (!e.target.checked && !store.showNominal) {
                        store.setShowNominal(true);
                      }
                      store.setShowReal(e.target.checked);
                    }}
                    className="mr-1"
                  />
                  Real
                </label>
              </div>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={store.showBalance}
                  onChange={(e) => store.setShowBalance(e.target.checked)}
                  className="mr-1"
                />
                Balance
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={store.showContributions}
                  onChange={(e) => store.setShowContributions(e.target.checked)}
                  className="mr-1"
                />
                Contributions
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={store.showNetGain}
                  onChange={(e) => store.setShowNetGain(e.target.checked)}
                  className="mr-1"
                />
                Net Gain
              </label>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th rowSpan={2} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r">Year</th>
                  {store.showBalance && (
                    <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-r">Balance</th>
                  )}
                  {store.showContributions && (
                    <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-r">Annual Contribution</th>
                  )}
                  {store.showNetGain && (
                    <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700">Net Gain</th>
                  )}
                </tr>
                <tr className="bg-gray-50">
                  {store.showBalance && (
                    <>
                      {store.showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {store.showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600 border-r">Real</th>}
                    </>
                  )}
                  {store.showContributions && (
                    <>
                      {store.showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {store.showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600 border-r">Real</th>}
                    </>
                  )}
                  {store.showNetGain && (
                    <>
                      {store.showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {store.showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Real</th>}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {store.results.map((result) => (
                  <tr key={result.year} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-r">{result.year}</td>
                    {store.showBalance && (
                      <>
                        {store.showNominal && <td className="px-4 py-2 text-sm text-right">${result.balance.toLocaleString()}</td>}
                        {store.showReal && <td className="px-4 py-2 text-sm text-right border-r">${result.realBalance.toLocaleString()}</td>}
                      </>
                    )}
                    {store.showContributions && (
                      <>
                        {store.showNominal && <td className="px-4 py-2 text-sm text-right">${result.annualContribution.toLocaleString()}</td>}
                        {store.showReal && <td className="px-4 py-2 text-sm text-right border-r">${result.realAnnualContribution.toLocaleString()}</td>}
                      </>
                    )}
                    {store.showNetGain && (
                      <>
                        {store.showNominal && <td className="px-4 py-2 text-sm text-right">${result.yearlyGain.toLocaleString()}</td>}
                        {store.showReal && <td className="px-4 py-2 text-sm text-right">${result.realYearlyGain.toLocaleString()}</td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {store.finalResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <div className="text-sm text-blue-800">
                <p>Final Nominal Balance: ${store.finalResult.balance.toLocaleString()}</p>
                <p>Final Real Balance: ${store.finalResult.realBalance.toLocaleString()}</p>
                <p>Annual Contribution: ${store.annualContributionNumber.toLocaleString()}</p>
                <p>Total Nominal Earnings: ${store.finalResult.totalEarnings.toLocaleString()}</p>
                <p>Total Real Earnings: ${store.finalResult.realTotalEarnings.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
});