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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [financialData, setFinancialData] = useState<FinancialData>(MOCK_FINANCIAL_DATA);

  // Carregar dados do localStorage apenas uma vez
  useEffect(() => {
    const savedUser = localStorage.getItem('e-tesouro-user');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verificar se o usuário tem nome válido, senão usar MOCK_USER
        if (userData.name && userData.name !== 'admin') {
          setUser(userData);
        } else {
          setUser(MOCK_USER);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('e-tesouro-user');
        setUser(MOCK_USER);
      }
    } else {
      // Se não há usuário salvo, usar MOCK_USER
      setUser(MOCK_USER);
    }
  }, []);

  // Salvar dados no localStorage quando mudarem (apenas se houver usuário logado)
  useEffect(() => {
    if (user?.isAuthenticated) {
      localStorage.setItem('e-tesouro-user', JSON.stringify(user));
      localStorage.setItem('e-tesouro-data', JSON.stringify(financialData));
    }
  }, [user, financialData]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
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
        balance: totalIncome - totalExpenses
      };
    });
  };

  const removeTransaction = (id: string) => {
    setFinancialData(prev => {
      const newTransactions = prev.transactions.filter(t => t.id !== id);
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
        balance: totalIncome - totalExpenses
      };
    });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulação de login - em produção, isso seria uma chamada para API
    if (email && password) {
      const newUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAuthenticated: true
      };
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('e-tesouro-user');
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulação de registro - em produção, isso seria uma chamada para API
    if (name && email && password) {
      const newUser: User = {
        id: '1',
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAuthenticated: true
      };
      setUser(newUser);
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      user,
      financialData,
      addTransaction,
      removeTransaction,
      login,
      logout,
      register
    }}>
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