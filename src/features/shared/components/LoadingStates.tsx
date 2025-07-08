import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
  height?: string;
  animate?: boolean;
}

/**
 * Base skeleton component for loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  animate = true 
}) => {
  return (
    <div 
      className={`
        bg-gray-200 dark:bg-gray-700 rounded 
        ${animate ? 'animate-pulse' : ''} 
        ${height} 
        ${className}
      `} 
    />
  );
};

/**
 * Table skeleton for loading table data
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-3">
      {/* Table header skeleton */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-6" />
        ))}
      </div>
      
      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`} 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Chart skeleton for loading chart components
 */
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`relative ${height} bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700`}>
      <div className="absolute inset-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`y-label-${index}`} className="h-3 w-12" />
          ))}
        </div>
        
        {/* Chart area */}
        <div className="ml-20 mr-4 h-full relative">
          <Skeleton className="absolute bottom-8 left-0 right-0 h-32" />
          
          {/* Chart line approximation */}
          <div className="absolute bottom-8 left-0 right-0 h-32">
            <svg className="w-full h-full">
              <path
                d="M0,100 Q25,80 50,60 Q75,40 100,20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-300 dark:text-gray-600 animate-pulse"
                vectorEffect="non-scaling-stroke"
                style={{ strokeDasharray: '5,5' }}
              />
            </svg>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-20 right-4 flex justify-between">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`x-label-${index}`} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Summary card skeleton for loading summary components
 */
export const SummarySkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div 
          key={`summary-card-${index}`}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Form skeleton for loading form components
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 6 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={`field-${index}`} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
};

/**
 * Full page skeleton for loading entire pages
 */
export const PageSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <FormSkeleton fields={8} />
        </div>
        <div className="space-y-6">
          <SummarySkeleton cards={1} />
          <ChartSkeleton />
        </div>
      </div>
      
      {/* Table skeleton */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <TableSkeleton rows={8} columns={5} />
      </div>
    </div>
  );
};

/**
 * Loading overlay for components that need to show loading state over existing content
 */
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}> = ({ isLoading, children, skeleton }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
          {skeleton || (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Calculating...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Pulse loading indicator
 */
export const PulseLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`} />
  );
};

/**
 * Dots loading indicator
 */
export const DotsLoader: React.FC = () => {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-2 w-2 bg-primary-600 rounded-full animate-bounce"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
};