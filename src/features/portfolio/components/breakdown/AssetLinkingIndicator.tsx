import React from 'react';
import { Investment } from '@/features/investment/stores/Investment';
import { Property } from '@/features/property/stores/Property';

interface AssetLinkingIndicatorProps {
  linkedInvestment?: Investment | null;
  linkedProperties?: Property[];
}

export const AssetLinkingIndicator: React.FC<AssetLinkingIndicatorProps> = ({
  linkedInvestment,
  linkedProperties = []
}) => {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {linkedInvestment && (
        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="hidden sm:inline">Linked to {linkedInvestment.name}</span>
          <span className="sm:hidden">Linked</span>
        </span>
      )}

      {linkedProperties.length > 0 && (
        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="hidden sm:inline">{linkedProperties.length} linked propert{linkedProperties.length === 1 ? 'y' : 'ies'}</span>
          <span className="sm:hidden">{linkedProperties.length} linked</span>
        </span>
      )}
    </div>
  );
};