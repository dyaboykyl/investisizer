import React from 'react';

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  showCloseButton = true,
  className = ''
}) => {
  return (
    <div className={`flex justify-between items-center mb-4 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      {showCloseButton && onClose && (
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-2xl leading-none"
          aria-label="Close modal"
        >
          ×
        </button>
      )}
    </div>
  );
};