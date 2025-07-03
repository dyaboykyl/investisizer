import { createContext } from 'react';
import { InvestmentStore } from './InvestmentStore';

export const StoreContext = createContext<InvestmentStore | undefined>(undefined); 