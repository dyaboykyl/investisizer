import React from 'react';

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = '',
  scrollable = true
}) => {
  return (
    <div className={`${scrollable ? 'overflow-y-auto' : ''} ${className}`}>
      {children}
    </div>
  );
};