import React from 'react';

interface DataItem {
  label: string;
  value: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
}

interface MobileDataCardProps {
  title: string;
  data: DataItem[];
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Mobile-optimized data card for displaying complex information
 */
export const MobileDataCard: React.FC<MobileDataCardProps> = ({
  title,
  data,
  className = '',
  onEdit,
  onDelete
}) => {
  // Filter out low priority items for mobile
  const visibleData = data.filter(item => item.priority !== 'low');
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h3>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 ml-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                aria-label="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                aria-label="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Data Items */}
      <div className="space-y-2">
        {visibleData.map((item, index) => (
          <div
            key={index}
            className={`flex justify-between items-center py-1 ${
              item.priority === 'high' ? 'font-medium' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <span className="text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}:
              </span>
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Mobile card specifically for financial data
 */
export const MobileFinancialCard: React.FC<{
  title: string;
  year: number;
  balance: React.ReactNode;
  earnings: React.ReactNode;
  contributions?: React.ReactNode;
  realBalance?: React.ReactNode;
  className?: string;
}> = ({
  title,
  year,
  balance,
  earnings,
  contributions,
  realBalance,
  className = ''
}) => {
  const data: DataItem[] = [
    { label: 'Year', value: year, priority: 'high' as const },
    { label: 'Balance', value: balance, priority: 'high' as const },
    { label: 'Earnings', value: earnings, priority: 'medium' as const },
    ...(contributions ? [{ label: 'Contributions', value: contributions, priority: 'medium' as const }] : []),
    ...(realBalance ? [{ label: 'Real Balance', value: realBalance, priority: 'low' as const }] : []),
  ];
  
  return (
    <MobileDataCard
      title={title}
      data={data}
      className={className}
    />
  );
};

/**
 * Mobile card for property data
 */
export const MobilePropertyCard: React.FC<{
  title: string;
  year: number;
  value: React.ReactNode;
  rentalIncome?: React.ReactNode;
  mortgagePayment?: React.ReactNode;
  cashFlow?: React.ReactNode;
  equity?: React.ReactNode;
  roi?: React.ReactNode;
  className?: string;
}> = ({
  title,
  year,
  value,
  rentalIncome,
  mortgagePayment,
  cashFlow,
  equity,
  roi,
  className = ''
}) => {
  const data: DataItem[] = [
    { label: 'Year', value: year, priority: 'high' as const },
    { label: 'Value', value: value, priority: 'high' as const },
    ...(rentalIncome ? [{ label: 'Rental Income', value: rentalIncome, priority: 'medium' as const }] : []),
    ...(mortgagePayment ? [{ label: 'Mortgage Payment', value: mortgagePayment, priority: 'medium' as const }] : []),
    ...(cashFlow ? [{ label: 'Cash Flow', value: cashFlow, priority: 'high' as const }] : []),
    ...(equity ? [{ label: 'Equity', value: equity, priority: 'medium' as const }] : []),
    ...(roi ? [{ label: 'ROI', value: roi, priority: 'low' as const }] : []),
  ];
  
  return (
    <MobileDataCard
      title={title}
      data={data}
      className={className}
    />
  );
};