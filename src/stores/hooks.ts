import { useContext } from 'react';
import { StoreContext } from './context';
import { themeStore } from './ThemeStore';

export const useInvestmentStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useInvestmentStore must be used within a StoreProvider');
  }
  return store;
};

export const useThemeStore = () => {
  return themeStore;
}; 