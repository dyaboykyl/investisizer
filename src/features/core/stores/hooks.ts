import { useContext } from 'react';
import { StoreContext } from './context';
import { themeStore } from '../theme/ThemeStore';

export const useRootStore = () => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useRootStore must be used within a StoreProvider');
  }
  return store;
};

export const usePortfolioStore = () => {
  const rootStore = useRootStore();
  return rootStore.portfolioStore;
};

export const useStorageStore = () => {
  const rootStore = useRootStore();
  return rootStore.storageStore;
};

export const useThemeStore = () => {
  return themeStore;
};

