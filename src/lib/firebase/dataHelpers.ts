// Funções auxiliares para combinar dados mockados com dados do Firestore
import { Category, Group, Transaction } from '@/types';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES, MOCK_GROUPS, getTransactionsByGroup } from '@/data/mockData';
import { getUserCategories } from './categories';
import { getUserGroups } from './groups';
import { getUserTransactions } from './transactions';

// Combinar categorias mockadas com categorias do Firestore
export const getCombinedCategories = async (
  userId: string | null, 
  type: 'income' | 'expense'
): Promise<Category[]> => {
  // Sempre incluir categorias mockadas
  const mockCategories = type === 'income' ? MOCK_INCOME_CATEGORIES : MOCK_EXPENSE_CATEGORIES;
  
  // Se não houver usuário, retornar apenas mockadas
  if (!userId) {
    return mockCategories;
  }

  // Buscar categorias do Firestore
  const firestoreResult = await getUserCategories(userId, type);
  
  if (firestoreResult.success && firestoreResult.data) {
    // Combinar: mockadas + Firestore (Firestore vem depois para ter prioridade em caso de duplicatas)
    const combined = [...mockCategories];
    
    // Adicionar categorias do Firestore que não estão nas mockadas
    firestoreResult.data.forEach(firestoreCategory => {
      if (!combined.find(cat => cat.id === firestoreCategory.id)) {
        combined.push(firestoreCategory);
      }
    });
    
    return combined;
  }

  return mockCategories;
};

// Combinar grupos mockados com grupos do Firestore
export const getCombinedGroups = async (userId: string | null): Promise<Group[]> => {
  // Sempre incluir grupos mockados
  const mockGroups = [...MOCK_GROUPS];
  
  // Se não houver usuário, retornar apenas mockados
  if (!userId) {
    return mockGroups;
  }

  // Buscar grupos do Firestore
  const firestoreResult = await getUserGroups(userId);
  
  if (firestoreResult.success && firestoreResult.data) {
    // Combinar: mockados + Firestore
    const combined = [...mockGroups];
    
    // Adicionar grupos do Firestore que não estão nos mockados
    firestoreResult.data.forEach(firestoreGroup => {
      if (!combined.find(group => group.id === firestoreGroup.id)) {
        combined.push(firestoreGroup);
      }
    });
    
    return combined;
  }

  return mockGroups;
};

// Combinar transações mockadas com transações do Firestore
export const getCombinedTransactions = async (
  userId: string | null,
  groupId: string
): Promise<Transaction[]> => {
  // Sempre incluir transações mockadas do grupo
  const mockTransactions = getTransactionsByGroup(groupId);
  
  // Se não houver usuário, retornar apenas mockadas
  if (!userId) {
    return mockTransactions;
  }

  // Buscar transações do Firestore para o grupo específico
  const firestoreResult = await getUserTransactions(userId, groupId);
  
  if (firestoreResult.success && firestoreResult.data) {
    // Combinar: mockadas + Firestore
    const combined = [...mockTransactions];
    
    // Adicionar transações do Firestore que não estão nas mockadas (baseado no ID)
    firestoreResult.data.forEach(firestoreTransaction => {
      if (!combined.find(trans => trans.id === firestoreTransaction.id)) {
        combined.push(firestoreTransaction);
      }
    });
    
    // Ordenar por data (mais recentes primeiro)
    combined.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return combined;
  }

  return mockTransactions;
};

