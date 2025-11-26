// Funções auxiliares para combinar dados mockados com dados do Firestore
import { Category, Group } from '@/types';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES, MOCK_GROUPS } from '@/data/mockData';
import { getUserCategories } from './categories';
import { getUserGroups } from './groups';

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

