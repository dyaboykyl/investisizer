import React from 'react';

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
  justify = 'end'
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={`flex ${justifyClasses[justify]} gap-2 mt-4 ${className}`}>
      {children}
    </div>
  );
};