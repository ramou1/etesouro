'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FinancialData, Transaction } from '@/types';
import { 
  MOCK_USER, 
  MOCK_FINANCIAL_DATA
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simula uma chamada assíncrona
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === MOCK_USER.email) {
          setUser(MOCK_USER);
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Implementação mock para registro
    return new Promise((resolve) => {
      setTimeout(() => {
        // Aqui você poderia implementar a lógica real de registro
        console.log('Tentativa de registro:', { name, email });
        resolve(false); // Sempre retorna false por enquanto
      }, 500);
    });
  };

  const removeTransaction = (id: string) => {
    setFinancialData(prev => {
      const filteredTransactions = prev.transactions.filter(t => t.id !== id);
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
    });
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
        register,
        addTransaction,
        removeTransaction,
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