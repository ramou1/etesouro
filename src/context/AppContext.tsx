'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FinancialData, Transaction, Group, Category } from '@/types';
import { 
  MOCK_GROUPS,
  MOCK_INCOME_CATEGORIES,
  MOCK_EXPENSE_CATEGORIES,
  getFinancialDataByGroup
} from '@/data/mockData';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { registerWithEmail, loginWithEmail, signOut as firebaseSignOut } from '@/lib/firebase/auth';
import { getUserData, saveUserData, updateUserName } from '@/lib/firebase/user';
import { getCombinedCategories, getCombinedGroups, getCombinedTransactions } from '@/lib/firebase/dataHelpers';
import { saveTransaction, deleteTransaction, updateTransaction as updateTransactionFirebase } from '@/lib/firebase/transactions';

interface AppContextType {
  user: User | null;
  financialData: FinancialData;
  activeGroup: Group;
  setActiveGroup: (group: Group) => void;
  groups: Group[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  reloadCategoriesAndGroups: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, allowGroupInvites?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (name: string) => Promise<{ success: boolean; error?: string }>;
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
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(MOCK_INCOME_CATEGORIES);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(MOCK_EXPENSE_CATEGORIES);

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
          // Se não houver dados no Firestore, tentar usar displayName ou email como fallback
          const fallbackName = firebaseUser.displayName || 
                               (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Usuário');
          
          appUser = {
            id: firebaseUser.uid,
            name: fallbackName,
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || undefined,
            isAuthenticated: true,
          };
          
          // Salvar dados no Firestore (para migrar usuários antigos)
          await saveUserData({
            id: firebaseUser.uid,
            name: fallbackName,
            email: appUser.email,
            avatar: appUser.avatar,
          });
          
          // Tentar buscar novamente do Firestore após salvar (pode ter sido uma condição de corrida)
          const retryUserData = await getUserData(firebaseUser.uid);
          if (retryUserData.success && retryUserData.data) {
            appUser = {
              id: retryUserData.data.id,
              name: retryUserData.data.name,
              email: retryUserData.data.email,
              avatar: retryUserData.data.avatar,
              isAuthenticated: true,
            };
          }
        }
        
        setUser(appUser);
        localStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem('user');
        // Limpar dados quando não há usuário
        setGroups(MOCK_GROUPS);
        setIncomeCategories(MOCK_INCOME_CATEGORIES);
        setExpenseCategories(MOCK_EXPENSE_CATEGORIES);
      }
    });

    return () => unsubscribe();
  }, []);

  // Função para carregar categorias e grupos do Firestore
  const loadCategoriesAndGroups = React.useCallback(async () => {
    if (!user?.id) {
      // Se não há usuário, usar apenas dados mockados
      setGroups(MOCK_GROUPS);
      // Ordenar categorias mockadas por título
      const sortedMockIncome = [...MOCK_INCOME_CATEGORIES].sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
      const sortedMockExpense = [...MOCK_EXPENSE_CATEGORIES].sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
      setIncomeCategories(sortedMockIncome);
      setExpenseCategories(sortedMockExpense);
      return;
    }

    try {
      // Carregar e combinar categorias de receitas
      const combinedIncomeCategories = await getCombinedCategories(user.id, 'income');
      // Ordenar por título em ordem crescente
      const sortedIncomeCategories = [...combinedIncomeCategories].sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
      setIncomeCategories(sortedIncomeCategories);

      // Carregar e combinar categorias de despesas
      const combinedExpenseCategories = await getCombinedCategories(user.id, 'expense');
      // Ordenar por título em ordem crescente
      const sortedExpenseCategories = [...combinedExpenseCategories].sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
      setExpenseCategories(sortedExpenseCategories);

      // Carregar e combinar grupos
      const combinedGroups = await getCombinedGroups(user.id);
      setGroups(combinedGroups);

      // Se o grupo ativo não estiver mais na lista, usar o primeiro (se houver grupos)
      setActiveGroup(prevActiveGroup => {
        if (combinedGroups.length > 0) {
          // Se o grupo ativo ainda existe na lista, mantê-lo
          const stillExists = combinedGroups.find(g => g.id === prevActiveGroup.id);
          if (stillExists) {
            return prevActiveGroup;
          }
          // Caso contrário, usar o primeiro grupo da lista
          return combinedGroups[0];
        }
        // Se não houver grupos, manter o grupo anterior (pode ser mockado)
        // O Dashboard vai verificar se há grupos e mostrar mensagem apropriada
        return prevActiveGroup;
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Em caso de erro, retornar arrays vazios (apenas dados do banco)
      setGroups([]);
      setIncomeCategories([]);
      setExpenseCategories([]);
    }
  }, [user?.id]);

  // Carregar categorias e grupos do Firestore quando o usuário mudar
  useEffect(() => {
    loadCategoriesAndGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Função para recarregar categorias e grupos (útil após criar novos)
  const reloadCategoriesAndGroups = async () => {
    await loadCategoriesAndGroups();
  };

  // Carregar transações do Firestore quando o grupo ativo ou usuário mudar
  useEffect(() => {
    const loadTransactions = async () => {
      if (!activeGroup?.id) return;

      try {
        // Buscar apenas transações do Firestore
        const transactions = await getCombinedTransactions(user?.id || null, activeGroup.id);
        
        // Calcular totais
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setFinancialData({
          transactions,
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
        });
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        // Em caso de erro, retornar dados vazios (apenas dados do banco)
        setFinancialData({
          transactions: [],
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
        });
      }
    };

    loadTransactions();
  }, [activeGroup.id, user?.id]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginWithEmail(email, password);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      return { success: false, error: errorMessage };
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

  const register = async (name: string, email: string, password: string, allowGroupInvites: boolean = true): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerWithEmail(name, email, password, allowGroupInvites);
      // O estado do usuário será atualizado automaticamente pelo onAuthStateChanged
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  const removeTransaction = async (id: string) => {
    // Se houver usuário, deletar no Firestore
    if (user?.id) {
      try {
        const firestoreResult = await deleteTransaction(id, user.id);
        
        if (!firestoreResult.success) {
          console.error('Erro ao deletar transação no Firestore:', firestoreResult.error);
          // Continuar mesmo com erro, para não bloquear a UI
        }
      } catch (error) {
        console.error('Erro ao deletar transação:', error);
        // Continuar mesmo com erro
      }
    }

    // Remover localmente
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

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const transactionWithGroupId: Omit<Transaction, 'id'> = {
      ...transaction,
      groupId: activeGroup.id,
    };

    // Se houver usuário, salvar no Firestore
    if (user?.id) {
      try {
        const firestoreResult = await saveTransaction(transactionWithGroupId, user.id);
        
        if (!firestoreResult.success) {
          console.error('Erro ao salvar transação no Firestore:', firestoreResult.error);
          // Continuar mesmo com erro, para não bloquear a UI
        }
      } catch (error) {
        console.error('Erro ao salvar transação:', error);
        // Continuar mesmo com erro
      }
    }

    // Adicionar localmente (mockado ou do Firestore)
    const newTransaction: Transaction = {
      ...transactionWithGroupId,
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

  const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => {
    // Se houver usuário, atualizar no Firestore
    if (user?.id) {
      try {
        const firestoreResult = await updateTransactionFirebase(id, transaction, user.id);
        
        if (!firestoreResult.success) {
          console.error('Erro ao atualizar transação no Firestore:', firestoreResult.error);
          // Continuar mesmo com erro, para não bloquear a UI
        }
      } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        // Continuar mesmo com erro
      }
    }

    // Atualizar localmente
    setFinancialData(prev => {
      const updatedTransactions = prev.transactions.map(t => {
        if (t.id === id) {
          return {
            ...t,
            ...transaction,
            updatedAt: new Date(),
          };
        }
        return t;
      });

      const totalIncome = updatedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = updatedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        transactions: updatedTransactions,
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

  const updateUserProfile = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      // Atualizar no Firebase se estiver configurado
      if (auth) {
        const result = await updateUserName(user.id, name.trim());
        if (result.success) {
          // Atualizar estado local
          const updatedUser = { ...user, name: name.trim() };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return result;
      } else {
        // Modo mock: apenas atualizar localStorage
        const updatedUser = { ...user, name: name.trim() };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      return { success: false, error: errorMessage };
    }
  };

  const getFilteredFinancialData = (): FinancialData => {
    // Se nenhum participante está desabilitado, retorna os dados completos do grupo ativo
    if (selectedParticipants.length === 0) {
      return financialData;
    }

    // Filtra as transações removendo as dos participantes desabilitados
    // Usa o ID do responsável (responsible.id) ao invés de userId
    const filteredTransactions = financialData.transactions.filter(
      transaction => !selectedParticipants.includes(transaction.responsible.id)
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
        groups,
        incomeCategories,
        expenseCategories,
        reloadCategoriesAndGroups,
        login, 
        logout,
        register,
        updateUserProfile,
        addTransaction,
        updateTransaction,
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