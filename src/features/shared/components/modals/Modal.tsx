import React, { useEffect, useCallback } from 'react';
import { useKeyPress } from '@/features/shared/hooks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  backdrop?: 'default' | 'blur';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  backdrop = 'default',
  closeOnEscape = true,
  closeOnBackdrop = true,
  className = ''
}) => {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose, closeOnBackdrop]);

  useKeyPress('Escape', onClose, isOpen && closeOnEscape);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  const backdropClasses = {
    default: 'bg-black bg-opacity-50',
    blur: 'bg-gray-900 bg-opacity-60 backdrop-blur-sm'
  };

  return (
    <div 
      className={`fixed inset-0 ${backdropClasses[backdrop]} flex items-center justify-center z-50 p-4`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} mx-4 transform transition-all duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};