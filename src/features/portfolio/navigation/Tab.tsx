import { observer } from 'mobx-react-lite';
import React from 'react';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

interface TabProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: (id: string) => void;
  onClose?: (id: string) => void;
  closable?: boolean;
}

export const Tab: React.FC<TabProps> = observer(({
  id,
  label,
  isActive,
  onClick,
  onClose,
  closable = false
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.(id);
  };

  return (
    <button
      onClick={() => onClick(id)}
      className={`
        relative px-2 md:px-4 py-2 text-xs md:text-sm font-medium transition-colors duration-200
        border-b-2 hover:text-primary-600 dark:hover:text-primary-400
        ${isMobile ? 'text-center' : 'whitespace-nowrap'}
        ${isActive
          ? 'text-primary-600 dark:text-primary-400 border-primary-500 dark:border-primary-400'
          : 'text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${closable ? 'pr-6 md:pr-8' : ''}
      `}
    >
      <span className={`truncate inline-block ${isMobile ? 'max-w-full' : 'max-w-24 md:max-w-none'}`}>
        {label}
      </span>
      {closable && (
        <span
          onClick={handleClose}
          className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      )}
    </button>
  );
});