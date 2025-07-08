import React from 'react';
import { type TableHeaderProps } from './types';

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns = [],
  dualValueColumns = [],
  showNominal = true,
  showReal = true,
  className = '',
  stickyHeader = false,
  children
}) => {
  const getStickyClass = () => {
    if (stickyHeader) {
      return 'sticky top-0 z-20';
    }
    return '';
  };

  const renderCustomHeader = () => {
    if (children) {
      return children;
    }
    
    const hasDualValues = dualValueColumns.length > 0 && (showNominal || showReal);
    
    return (
      <>
        {/* Main header row */}
        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                column.sticky ? 'sticky left-0 z-10 bg-gray-50 dark:bg-gray-900' : ''
              }`}
            >
              {column.label}
            </th>
          ))}
          {dualValueColumns.map((column) => (
            <th
              key={column.key}
              colSpan={
                showNominal && showReal ? 2 : 1
              }
              className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700"
            >
              {column.label}
            </th>
          ))}
        </tr>
        
        {/* Sub-header row for dual values */}
        {hasDualValues && (
          <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {columns.map((column) => (
              <th key={`${column.key}-sub`} />
            ))}
            {dualValueColumns.map((column) => (
              <React.Fragment key={`${column.key}-sub`}>
                {showNominal && (
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700">
                    Nominal
                  </th>
                )}
                {showReal && (
                  <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700">
                    Real
                  </th>
                )}
              </React.Fragment>
            ))}
          </tr>
        )}
      </>
    );
  };

  const combinedClasses = `${getStickyClass()} ${className}`.trim();

  return (
    <thead className={combinedClasses}>
      {renderCustomHeader()}
    </thead>
  );
};