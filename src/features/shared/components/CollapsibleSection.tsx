import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = observer(({
  title,
  icon,
  children,
  defaultExpanded = false,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-2xl mb-6 border border-gray-200 dark:border-gray-700 animate-slide-up ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 rounded-t-2xl hover:bg-gray-25 dark:hover:bg-gray-700/50 transition-all duration-200 group"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {icon && <span className="mr-3">{icon}</span>}
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
});