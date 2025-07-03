import React from 'react';
import { rootStore } from './RootStore';
import { StoreContext } from './context';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};