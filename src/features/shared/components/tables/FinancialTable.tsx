import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { Table } from './Table';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { type TableProps } from './types';

interface FinancialTableProps<T> extends Omit<TableProps<T>, 'children'> {
  children?: React.ReactNode;
}

export const FinancialTable = observer(<T,>({
  data,
  columns = [],
  dualValueColumns = [],
  title,
  icon,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  stickyHeader = false,
  alternatingRows = true,
  hover = true,
  defaultExpanded = false,
  children
}: FinancialTableProps<T>) => {
  const portfolioStore = usePortfolioStore();

  // Enhanced table with portfolio store integration
  return (
    <Table
      data={data}
      columns={columns}
      dualValueColumns={dualValueColumns}
      title={title}
      icon={icon}
      loading={loading}
      emptyMessage={emptyMessage}
      className={className}
      stickyHeader={stickyHeader}
      alternatingRows={alternatingRows}
      hover={hover}
      defaultExpanded={defaultExpanded}
    >
      {children || (
        <>
          <TableHeader
            columns={columns}
            dualValueColumns={dualValueColumns}
            showNominal={portfolioStore.showNominal}
            showReal={portfolioStore.showReal}
            stickyHeader={stickyHeader}
          />
          <TableBody
            data={data}
            columns={columns}
            dualValueColumns={dualValueColumns}
            showNominal={portfolioStore.showNominal}
            showReal={portfolioStore.showReal}
            alternatingRows={alternatingRows}
            hover={hover}
          />
        </>
      )}
    </Table>
  );
});