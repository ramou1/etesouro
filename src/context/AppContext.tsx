'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, FinancialData, User } from '@/data/mockData';
import { 
  MOCK_USER, 
  MOCK_FINANCIAL_DATA, 
  MOCK_TRANSACTIONS 
} from '@/data/mockData';

interface AppContextType {
  user: User | null;
  financialData: FinancialData;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  selectedParticipants: string[];
  toggleParticipant: (participantId: string) => void;
  getFilteredFinancialData: () => FinancialData;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>(MOCK_FINANCIAL_DATA);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === MOCK_USER.email) {
      setUser(MOCK_USER);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: String(Date.now()),
    };

    setFinancialData(prev => {
      const newTransactions = [...prev.transactions, newTransaction];
      const totalIncome = newTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = newTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        transactions: newTransactions,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      };
    });
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  const getFilteredFinancialData = (): FinancialData => {
    // Se nenhum participante está desabilitado, retorna os dados completos
    if (selectedParticipants.length === 0) {
      return financialData;
    }

    // Filtra as transações removendo as dos participantes desabilitados
    const filteredTransactions = financialData.transactions.filter(
      transaction => !selectedParticipants.includes(transaction.userId)
    );

    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions: filteredTransactions,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  };

  return (
    <AppContext.Provider 
      value={{ 
        user, 
        financialData, 
        login, 
        logout, 
        addTransaction,
        selectedParticipants,
        toggleParticipant,
        getFilteredFinancialData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}