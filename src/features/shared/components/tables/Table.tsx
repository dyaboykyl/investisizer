import { observer } from 'mobx-react-lite';
import { type TableProps } from './types';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';

export const Table = observer(<T,>({
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
}: TableProps<T>) => {
  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      );
    }

    if (data.length === 0 && !children) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
          {children || (
            <>
              <TableHeader
                columns={columns}
                dualValueColumns={dualValueColumns}
                stickyHeader={stickyHeader}
              />
              <TableBody
                data={data}
                columns={columns}
                dualValueColumns={dualValueColumns}
                alternatingRows={alternatingRows}
                hover={hover}
              />
            </>
          )}
        </table>
      </div>
    );
  };

  if (title) {
    return (
      <CollapsibleSection 
        title={title}
        icon={icon}
        defaultExpanded={defaultExpanded}
      >
        {renderTable()}
      </CollapsibleSection>
    );
  }

  return renderTable();
});