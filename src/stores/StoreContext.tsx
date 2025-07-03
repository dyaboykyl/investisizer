import React from 'react';
import { investmentStore } from './InvestmentStore';
import { StoreContext } from './context';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={investmentStore}>
      {children}
    </StoreContext.Provider>
  );
};