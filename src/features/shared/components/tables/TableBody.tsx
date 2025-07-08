import React from 'react';
import { type TableBodyProps } from './types';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';

export const TableBody = <T,>({
  data,
  columns = [],
  dualValueColumns = [],
  showNominal = true,
  showReal = true,
  alternatingRows = true,
  hover = true,
  className = '',
  children
}: TableBodyProps<T>) => {
  const renderCustomBody = () => {
    if (children) {
      return children;
    }

    if (data.length === 0) {
      return (
        <TableRow index={0} alternatingRows={false} hover={false}>
          <TableCell 
            value="No data available" 
            alignment="center"
            className="py-8 text-gray-500 dark:text-gray-400"
          />
        </TableRow>
      );
    }

    return data.map((row, index) => {
      return (
        <TableRow
          key={index}
          index={index}
          alternatingRows={alternatingRows}
          hover={hover}
        >
          {columns.map((column) => {
            const value = (row as any)[column.key];
            const shouldRender = column.conditionalRender ? column.conditionalRender(row) : true;
            
            if (!shouldRender) {
              return null;
            }

            const displayValue = column.formatter ? column.formatter(value, row) : value;
            
            return (
              <TableCell
                key={column.key}
                value={displayValue}
                type={column.type}
                alignment={column.alignment}
                sticky={column.sticky}
                colorize={column.colorize ? column.colorize(value, row) : undefined}
              />
            );
          })}
          
          {dualValueColumns.map((column) => {
            const shouldRender = column.conditionalRender ? column.conditionalRender(row) : true;
            
            if (!shouldRender) {
              return null;
            }

            const nominalValue = (row as any)[column.nominalKey];
            const realValue = (row as any)[column.realKey];
            
            const nominalDisplay = column.formatter ? column.formatter(nominalValue, row) : nominalValue;
            const realDisplay = column.formatter ? column.formatter(realValue, row) : realValue;
            
            return (
              <React.Fragment key={column.key}>
                {showNominal && (
                  <TableCell
                    value={nominalDisplay}
                    type={column.type}
                    alignment={column.alignment}
                    colorize={column.colorize ? column.colorize(nominalValue, row) : undefined}
                    className="border-l border-gray-200 dark:border-gray-700"
                  />
                )}
                {showReal && (
                  <TableCell
                    value={realDisplay}
                    type={column.type}
                    alignment={column.alignment}
                    colorize={column.colorize ? column.colorize(realValue, row) : undefined}
                    className="border-l border-gray-200 dark:border-gray-700"
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableRow>
      );
    });
  };

  return (
    <tbody className={className}>
      {renderCustomBody()}
    </tbody>
  );
};