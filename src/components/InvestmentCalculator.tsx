import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  setInitialAmount,
  setYears,
  setRateOfReturn,
  setInflationRate,
  setAnnualContribution,
  calculateProjection,
  setShowBalance,
  setShowContributions,
  setShowNetGain,
  setShowNominal,
  setShowReal
} from '../store/slices/investmentSlice';
import {
  selectInitialAmount,
  selectYears,
  selectRateOfReturn,
  selectInflationRate,
  selectAnnualContribution,
  selectResults,
  selectShowBalance,
  selectShowContributions,
  selectShowNetGain,
  selectShowNominal,
  selectShowReal,
  selectHasResults,
  selectFinalResult,
  selectAnnualContributionNumber
} from '../store/selectors/investmentSelectors';
import { ProjectionChart } from './ProjectionChart';

export const InvestmentCalculator: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Select state from Redux
  const initialAmount = useAppSelector(selectInitialAmount);
  const years = useAppSelector(selectYears);
  const rateOfReturn = useAppSelector(selectRateOfReturn);
  const inflationRate = useAppSelector(selectInflationRate);
  const annualContribution = useAppSelector(selectAnnualContribution);
  const results = useAppSelector(selectResults);
  const showBalance = useAppSelector(selectShowBalance);
  const showContributions = useAppSelector(selectShowContributions);
  const showNetGain = useAppSelector(selectShowNetGain);
  const showNominal = useAppSelector(selectShowNominal);
  const showReal = useAppSelector(selectShowReal);
  const hasResults = useAppSelector(selectHasResults);
  const finalResult = useAppSelector(selectFinalResult);
  const annualContributionNumber = useAppSelector(selectAnnualContributionNumber);

  const handleCalculate = () => {
    dispatch(calculateProjection());
  };

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
              value={initialAmount}
              onChange={(e) => dispatch(setInitialAmount(e.target.value))}
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
              value={years}
              onChange={(e) => dispatch(setYears(e.target.value))}
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
              value={rateOfReturn}
              onChange={(e) => dispatch(setRateOfReturn(e.target.value))}
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
              value={inflationRate}
              onChange={(e) => dispatch(setInflationRate(e.target.value))}
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
              value={annualContribution}
              onChange={(e) => dispatch(setAnnualContribution(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Use negative values for withdrawals</p>
          </div>
        </div>
        
        <button
          onClick={handleCalculate}
          className="mt-6 w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Calculate Projection
        </button>
      </div>
      
      {hasResults && (
        <>
          <ProjectionChart data={results} />
          
          <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold mb-2 sm:mb-0">Projection Results</h2>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 border-r pr-2">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={showNominal}
                    onChange={(e) => {
                      if (!e.target.checked && !showReal) {
                        dispatch(setShowReal(true));
                      }
                      dispatch(setShowNominal(e.target.checked));
                    }}
                    className="mr-1"
                  />
                  Nominal
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={showReal}
                    onChange={(e) => {
                      if (!e.target.checked && !showNominal) {
                        dispatch(setShowNominal(true));
                      }
                      dispatch(setShowReal(e.target.checked));
                    }}
                    className="mr-1"
                  />
                  Real
                </label>
              </div>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showBalance}
                  onChange={(e) => dispatch(setShowBalance(e.target.checked))}
                  className="mr-1"
                />
                Balance
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showContributions}
                  onChange={(e) => dispatch(setShowContributions(e.target.checked))}
                  className="mr-1"
                />
                Contributions
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showNetGain}
                  onChange={(e) => dispatch(setShowNetGain(e.target.checked))}
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
                  {showBalance && (
                    <th colSpan={(showNominal && showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-r">Balance</th>
                  )}
                  {showContributions && (
                    <th colSpan={(showNominal && showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-r">Annual Contribution</th>
                  )}
                  {showNetGain && (
                    <th colSpan={(showNominal && showReal) ? 2 : 1} className="px-4 py-2 text-center text-sm font-medium text-gray-700">Net Gain</th>
                  )}
                </tr>
                <tr className="bg-gray-50">
                  {showBalance && (
                    <>
                      {showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600 border-r">Real</th>}
                    </>
                  )}
                  {showContributions && (
                    <>
                      {showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600 border-r">Real</th>}
                    </>
                  )}
                  {showNetGain && (
                    <>
                      {showNominal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Nominal</th>}
                      {showReal && <th className="px-4 py-2 text-right text-xs font-normal text-gray-600">Real</th>}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.year} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm border-r">{result.year}</td>
                    {showBalance && (
                      <>
                        {showNominal && <td className="px-4 py-2 text-sm text-right">${result.balance.toLocaleString()}</td>}
                        {showReal && <td className="px-4 py-2 text-sm text-right border-r">${result.realBalance.toLocaleString()}</td>}
                      </>
                    )}
                    {showContributions && (
                      <>
                        {showNominal && <td className="px-4 py-2 text-sm text-right">${result.annualContribution.toLocaleString()}</td>}
                        {showReal && <td className="px-4 py-2 text-sm text-right border-r">${result.realAnnualContribution.toLocaleString()}</td>}
                      </>
                    )}
                    {showNetGain && (
                      <>
                        {showNominal && <td className="px-4 py-2 text-sm text-right">${result.yearlyGain.toLocaleString()}</td>}
                        {showReal && <td className="px-4 py-2 text-sm text-right">${result.realYearlyGain.toLocaleString()}</td>}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {finalResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <div className="text-sm text-blue-800">
                <p>Final Nominal Balance: ${finalResult.balance.toLocaleString()}</p>
                <p>Final Real Balance: ${finalResult.realBalance.toLocaleString()}</p>
                <p>Annual Contribution: ${annualContributionNumber.toLocaleString()}</p>
                <p>Total Nominal Earnings: ${finalResult.totalEarnings.toLocaleString()}</p>
                <p>Total Real Earnings: ${finalResult.realTotalEarnings.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};