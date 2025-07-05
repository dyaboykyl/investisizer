import { createContext } from 'react';
import { RootStore } from './RootStore';

export const StoreContext = createContext<RootStore | undefined>(undefined); 