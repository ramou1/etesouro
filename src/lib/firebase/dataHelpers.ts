// Funções auxiliares para retornar dados do Firestore
import { Category, Group, Transaction } from '@/types';
import { getUserCategories } from './categories';
import { getUserGroups } from './groups';
import { getUserTransactions } from './transactions';

// Retornar apenas categorias do Firestore (sem dados mockados)
export const getCombinedCategories = async (
  userId: string | null, 
  type: 'income' | 'expense'
): Promise<Category[]> => {
  // Se não houver usuário, retornar array vazio
  if (!userId) {
    return [];
  }

  // Buscar categorias do Firestore
  const firestoreResult = await getUserCategories(userId, type);
  
  if (firestoreResult.success && firestoreResult.data) {
    return firestoreResult.data;
  }

  return [];
};

// Retornar apenas grupos do Firestore (sem dados mockados)
export const getCombinedGroups = async (userId: string | null): Promise<Group[]> => {
  // Se não houver usuário, retornar array vazio
  if (!userId) {
    return [];
  }

  // Buscar grupos do Firestore
  const firestoreResult = await getUserGroups(userId);
  
  if (firestoreResult.success && firestoreResult.data) {
    return firestoreResult.data;
  }

  return [];
};

// Retornar apenas transações do Firestore (sem dados mockados)
export const getCombinedTransactions = async (
  userId: string | null,
  groupId: string
): Promise<Transaction[]> => {
  // Se não houver usuário, retornar array vazio
  if (!userId) {
    return [];
  }

  // Buscar transações do Firestore para o grupo específico
  const firestoreResult = await getUserTransactions(userId, groupId);
  
  if (firestoreResult.success && firestoreResult.data) {
    // Ordenar por data (mais recentes primeiro)
    const sorted = [...firestoreResult.data];
    sorted.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sorted;
  }

  return [];
};

