import React from 'react';
import { type TableCellProps } from './types';

export const TableCell: React.FC<TableCellProps> = ({
  value,
  type = 'text',
  alignment = 'left',
  sticky = false,
  colorize,
  className = '',
  children
}) => {
  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    
    switch (type) {
      case 'currency':
        return typeof val === 'number' ? val.toLocaleString() : val;
      case 'percentage':
        return typeof val === 'number' ? `${val}%` : val;
      case 'year':
        return val.toString();
      default:
        return val.toString();
    }
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getStickyClass = () => {
    if (sticky) {
      return 'sticky left-0 z-10 bg-white dark:bg-gray-800';
    }
    return '';
  };

  const getColorClass = () => {
    if (colorize) {
      return colorize;
    }
    
    // Default color logic for currency values
    if (type === 'currency' && typeof value === 'number') {
      if (value > 0) {
        return 'text-green-600 dark:text-green-400';
      } else if (value < 0) {
        return 'text-red-600 dark:text-red-400';
      }
    }
    
    return 'text-gray-900 dark:text-gray-100';
  };

  const baseClasses = 'px-3 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700';
  const combinedClasses = `${baseClasses} ${getAlignmentClass()} ${getStickyClass()} ${getColorClass()} ${className}`.trim();

  return (
    <td className={combinedClasses}>
      {children || formatValue(value)}
    </td>
  );
};