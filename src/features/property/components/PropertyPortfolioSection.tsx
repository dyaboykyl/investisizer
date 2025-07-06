import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Property } from '@/features/property/stores/Property';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

interface PropertyPortfolioSectionProps {
  asset: Property;
}

export const PropertyPortfolioSection: React.FC<PropertyPortfolioSectionProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();
  
  // Get available investment assets for linking
  const availableInvestments = portfolioStore.investments.filter(inv => inv.id !== asset.id);

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );

  const handleSave = () => {
    portfolioStore.saveToLocalStorage();
  };

  return (
    <CollapsibleSection title="Portfolio Integration" icon={icon} defaultExpanded={false}>
      <div className="space-y-6">
        {/* Payment Source */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Payment Source (Optional)
          </label>
          <select
            value={asset.inputs.linkedInvestmentId || ''}
            onChange={(e) => {
              asset.updateInput('linkedInvestmentId', e.target.value);
            }}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="">Pay from external source (not tracked)</option>
            {availableInvestments.map((investment) => (
              <option key={investment.id} value={investment.id}>
                {asset.inputs.isRentalProperty
                  ? `Link cash flows with "${investment.name}" investment`
                  : `Withdraw from "${investment.name}" investment`
                }
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {asset.inputs.isRentalProperty
              ? "If selected, net cash flows (income - expenses - payments) will be contributed to or withdrawn from the chosen investment."
              : "If selected, monthly payments will be withdrawn from the chosen investment asset, reducing its balance."
            }
          </p>
          {availableInvestments.length === 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Create an investment asset first to link property payments to it.
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 group"
        >
          <span>Save Property</span>
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </CollapsibleSection>
  );
});