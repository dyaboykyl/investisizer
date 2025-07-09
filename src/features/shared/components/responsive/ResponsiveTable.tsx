import React from 'react';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveTableCellProps {
  children?: React.ReactNode;
  value?: any;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
  mobileLabel?: string;
  type?: 'currency' | 'text' | 'percentage' | 'year';
  alignment?: 'left' | 'center' | 'right';
  sticky?: boolean;
  colorize?: string;
}

/**
 * Responsive table that adapts to different screen sizes
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full">
        {children}
      </table>
    </div>
  );
};

/**
 * Responsive table header - hidden on mobile
 */
export const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) return null;
  
  return (
    <thead className={className}>
      {children}
    </thead>
  );
};

/**
 * Responsive table body - renders as cards on mobile
 */
export const ResponsiveTableBody: React.FC<ResponsiveTableBodyProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

/**
 * Responsive table row - renders as card on mobile
 */
export const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({
  children,
  className = ''
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  return (
    <tr className={className}>
      {children}
    </tr>
  );
};

/**
 * Responsive table cell - renders with label on mobile
 */
export const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({
  children,
  value,
  className = '',
  priority = 'medium',
  mobileLabel,
  type: _type,
  alignment = 'left',
  sticky: _sticky,
  colorize
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const content = children || value;
  
  // Check if we should hide this cell on mobile before any conditional rendering
  if (isMobile && priority === 'low') {
    return null;
  }
  
  if (isMobile) {
    
    return (
      <div className={`flex justify-between items-center py-1 ${className}`}>
        {mobileLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {mobileLabel}:
          </span>
        )}
        <div className={`text-sm text-gray-900 dark:text-gray-100 ${colorize || ''}`}>
          {content}
        </div>
      </div>
    );
  }
  
  const alignmentClass = alignment === 'right' ? 'text-right' : 
                        alignment === 'center' ? 'text-center' : 'text-left';
  
  return (
    <td className={`${className} ${alignmentClass} ${colorize || ''}`}>
      {content}
    </td>
  );
};