import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTaxProfileStore } from '@/features/core/stores/hooks';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import type { FilingStatus } from '@/features/tax/stores/TaxProfileStore';

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married Filing Jointly' },
  { value: 'married_separate', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
];

export const TaxConfigurationPanel: React.FC = observer(() => {
  const taxProfileStore = useTaxProfileStore();
  
  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <CollapsibleSection title="Tax Configuration" icon={icon}>
      <div className="space-y-6">
        {/* Tax Profile Settings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Tax Profile Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Filing Status */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filing Status
              </label>
              <select
                value={taxProfileStore.profile.filingStatus}
                onChange={(e) => taxProfileStore.updateProfile({ filingStatus: e.target.value as FilingStatus })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              >
                {FILING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Determines your capital gains tax brackets
              </p>
            </div>

            {/* Annual Income */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Annual Income
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={taxProfileStore.profile.annualIncome}
                  onChange={(e) => taxProfileStore.updateProfile({ annualIncome: e.target.value })}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="125000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Used to determine your tax bracket
              </p>
            </div>

            {/* State */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                value={taxProfileStore.profile.state}
                onChange={(e) => taxProfileStore.updateProfile({ state: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="CA"
                maxLength={2}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Two-letter state code (e.g., CA, NY, TX)
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Advanced Tax Settings
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Enable State Tax */}
            <div className="group">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={taxProfileStore.profile.enableStateTax}
                  onChange={(e) => taxProfileStore.updateProfile({ enableStateTax: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include state capital gains tax
                </span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
                Some states have no capital gains tax
              </p>
            </div>

            {/* Other Capital Gains */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Other Capital Gains This Year
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={taxProfileStore.profile.otherCapitalGains}
                  onChange={(e) => taxProfileStore.updateProfile({ otherCapitalGains: e.target.value })}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Other gains/losses that affect your total
              </p>
            </div>

            {/* Carryover Losses */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capital Loss Carryovers
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={taxProfileStore.profile.carryoverLosses}
                  onChange={(e) => taxProfileStore.updateProfile({ carryoverLosses: e.target.value })}
                  className="w-full px-4 py-2 pr-8 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">$</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Losses from previous years that reduce current gains
              </p>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Tax Calculation Information
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These settings apply to all property sales in your portfolio. Tax calculations use 2024 federal 
                capital gains brackets: 0% (up to {taxProfileStore.parsedProfile.filingStatus === 'married_joint' ? '$94,050' : '$47,025'}), 
                15% (middle bracket), and 20% (high income).
              </p>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
});