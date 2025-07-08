import React from 'react';
import { type TableRowProps } from './types';

export const TableRow: React.FC<TableRowProps> = ({
  index = 0,
  alternatingRows = true,
  hover = true,
  className = '',
  children
}) => {
  const getAlternatingClass = () => {
    if (alternatingRows) {
      return index % 2 === 0 
        ? 'bg-white dark:bg-gray-800' 
        : 'bg-gray-50 dark:bg-gray-900';
    }
    return 'bg-white dark:bg-gray-800';
  };

  const getHoverClass = () => {
    if (hover) {
      return 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150';
    }
    return '';
  };

  const combinedClasses = `${getAlternatingClass()} ${getHoverClass()} ${className}`.trim();

  return (
    <tr className={combinedClasses}>
      {children}
    </tr>
  );
};