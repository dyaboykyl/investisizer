import { observer } from 'mobx-react-lite';
import { type TableProps } from './types';
import { TableHeader } from './TableHeader';
import { TableBody } from './TableBody';
import { CollapsibleSection } from '@/features/shared/components/CollapsibleSection';
import { useMediaQuery } from '@/features/shared/hooks/responsive';
import { useState, useRef, useEffect } from 'react';

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
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Check scroll position to show/hide shadows
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftShadow(scrollLeft > 0);
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
  };
  
  // Initialize shadow states
  useEffect(() => {
    if (isMobile) {
      handleScroll();
    }
  }, [isMobile, data]);
  
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

    // Enhanced mobile scrolling with better UX
    const scrollContainerClass = isMobile 
      ? "overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 scroll-smooth -webkit-overflow-scrolling-touch"
      : "overflow-x-auto";

    return (
      <div className="relative">
        {/* Left scroll shadow */}
        {isMobile && showLeftShadow && (
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right scroll shadow */}
        {isMobile && showRightShadow && (
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-gray-200 dark:from-gray-800 to-transparent z-10 pointer-events-none" />
        )}
        
        <div 
          ref={scrollContainerRef}
          className={scrollContainerClass}
          onScroll={handleScroll}
          style={{
            // Enable momentum scrolling on iOS
            WebkitOverflowScrolling: 'touch',
            // Ensure smooth scrolling
            scrollBehavior: 'smooth'
          }}
        >
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