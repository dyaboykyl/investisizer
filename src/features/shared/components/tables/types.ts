import { type ReactNode } from 'react';

export interface ColumnDefinition<T = any> {
  key: string;
  label: string;
  type: 'currency' | 'text' | 'year' | 'percentage';
  alignment?: 'left' | 'center' | 'right';
  sticky?: boolean;
  conditionalRender?: (data: T) => boolean;
  formatter?: (value: any, row: T) => string;
  colorize?: (value: any, row: T) => string;
  width?: string;
  minWidth?: string;
}

export interface DualValueColumn<T = any> {
  key: string;
  label: string;
  nominalKey: string;
  realKey: string;
  type: 'currency' | 'percentage';
  alignment?: 'left' | 'center' | 'right';
  conditionalRender?: (data: T) => boolean;
  colorize?: (value: any, row: T) => string;
  formatter?: (value: any, row: T) => string;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns?: ColumnDefinition<T>[];
  dualValueColumns?: DualValueColumn<T>[];
  title?: string;
  icon?: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  stickyHeader?: boolean;
  alternatingRows?: boolean;
  hover?: boolean;
  defaultExpanded?: boolean;
  children?: ReactNode;
}

export interface TableHeaderProps {
  columns?: ColumnDefinition[];
  dualValueColumns?: DualValueColumn[];
  showNominal?: boolean;
  showReal?: boolean;
  className?: string;
  stickyHeader?: boolean;
  children?: ReactNode;
}

export interface TableBodyProps<T = any> {
  data: T[];
  columns?: ColumnDefinition<T>[];
  dualValueColumns?: DualValueColumn<T>[];
  showNominal?: boolean;
  showReal?: boolean;
  alternatingRows?: boolean;
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface TableRowProps {
  index?: number;
  alternatingRows?: boolean;
  hover?: boolean;
  className?: string;
  children: ReactNode;
}

export interface TableCellProps {
  value?: any;
  type?: 'currency' | 'text' | 'year' | 'percentage';
  alignment?: 'left' | 'center' | 'right';
  sticky?: boolean;
  colorize?: string;
  className?: string;
  children?: ReactNode;
}