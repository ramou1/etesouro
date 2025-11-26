'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FinancialData, Transaction, Group } from '@/types';
import { 
  MOCK_USER, 
  MOCK_GROUPS,
  getFinancialDataByGroup
} from '@/data/mockData';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { registerWithEmail, loginWithEmail, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { getUserData, saveUserData } from '@/lib/firebase/user';

interface AppContextType {
  user: User | null;
  financialData: FinancialData;
  activeGroup: Group;
  setActiveGroup: (group: Group) => void;
  groups: Group[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removeTransaction: (id: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  selectedParticipants: string[];
  toggleParticipant: (participantId: string) => void;
  getFilteredFinancialData: () => FinancialData;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group>(MOCK_GROUPS[0]);
  const [financialData, setFinancialData] = useState<FinancialData>(getFinancialDataByGroup(MOCK_GROUPS[0].id));
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  // Monitorar estado de autenticação do Firebase
  useEffect(() => {
    if (!auth) {
      // Se Firebase não estiver configurado, tenta carregar do localStorage (modo mock)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Erro ao carregar usuário do localStorage:', error);
        }
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Tentar buscar dados do usuário no Firestore
        const userDataResult = await getUserData(firebaseUser.uid);
        
        let appUser: User;
        
        if (userDataResult.success && userDataResult.data) {
          // Usar dados do Firestore se existirem
          appUser = {
            id: userDataResult.data.id,
            name: userDataResult.data.name,
            email: userDataResult.data.email,
            avatar: userDataResult.data.avatar,
            isAuthenticated: true,
          };
        } else {
          // Se não houver dados no Firestore, criar com dados do Auth
          appUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || undefined,
            isAuthenticated: true,
          };
          
          // Salvar dados no Firestore (para migrar usuários antigos)
          await saveUserData({
            id: firebaseUser.uid,
            name: appUser.name,
            email: appUser.email,
            avatar: appUser.avatar,
          });
        }
        
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, []);

  // Atualizar financialData quando o grupo ativo mudar
  useEffect(() => {
    const newFinancialData = getFinancialDataByGroup(activeGroup.id);
    setFinancialData(newFinancialData);
  }, [activeGroup]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginWithEmail(email, password);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut();
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerWithEmail(name, email, password);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      return { success: false, error: error.message || 'Erro ao criar conta' };
    }
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
      groupId: activeGroup.id,
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
    // Se nenhum participante está desabilitado, retorna os dados completos do grupo ativo
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
        activeGroup,
        setActiveGroup,
        groups: MOCK_GROUPS,
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