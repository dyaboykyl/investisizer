import React, { createContext, useContext } from 'react';
import { investmentStore, InvestmentStore } from './InvestmentStore';

const StoreContext = createContext<InvestmentStore | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={investmentStore}>
      {children}
    </StoreContext.Provider>
  );
};

export const useInvestmentStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useInvestmentStore must be used within a StoreProvider');
  }
  return store;
};