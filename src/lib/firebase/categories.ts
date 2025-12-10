// Serviço para gerenciar categorias no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Category } from '@/types';

export interface CategoryData {
  id: string;
  title: string;
  color: string;
  type: 'income' | 'expense';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Salvar nova categoria no Firestore (como subcoleção do usuário)
export const saveCategory = async (
  title: string, 
  color: string, 
  type: 'income' | 'expense', 
  userId: string
): Promise<{ success: boolean; error?: string; categoryId?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Gerar ID único para a categoria
    const categoryId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Salvar como subcoleção dentro do usuário: users/{userId}/categories/{categoryId}
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);

    await setDoc(categoryRef, {
      id: categoryId,
      title: title,
      color: color,
      type: type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, categoryId };
  } catch (error: unknown) {
    console.error('Erro ao salvar categoria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar categoria';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar categorias do usuário no Firestore (da subcoleção do usuário)
export const getUserCategories = async (userId: string, type?: 'income' | 'expense'): Promise<{ success: boolean; data?: Category[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Buscar da subcoleção: users/{userId}/categories
    const categoriesRef = collection(db, 'users', userId, 'categories');
    let q = query(categoriesRef);
    
    if (type) {
      q = query(categoriesRef, where('type', '==', type));
    }

    const querySnapshot = await getDocs(q);
    const categories: Category[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      categories.push({
        id: data.id,
        title: data.title,
        color: data.color,
        type: data.type,
      });
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar categorias:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar categorias';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Atualizar categoria existente no Firestore
export const updateCategory = async (
  categoryId: string,
  title: string,
  color: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Atualizar na subcoleção: users/{userId}/categories/{categoryId}
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);

    await updateDoc(categoryRef, {
      title: title,
      color: color,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar categoria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar categoria';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Deletar categoria do Firestore
export const deleteCategory = async (
  categoryId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(categoryRef);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao deletar categoria:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar categoria';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Salvar múltiplas categorias de uma vez (útil para setup inicial)
export const saveMultipleCategories = async (
  categories: Array<{ title: string; color: string; type: 'income' | 'expense' }>,
  userId: string
): Promise<{ success: boolean; error?: string; savedCount?: number }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  if (!categories || categories.length === 0) {
    return {
      success: true,
      savedCount: 0,
    };
  }

  try {
    const promises = categories.map(async (category, index) => {
      // Adicionar índice e timestamp único para garantir IDs únicos
      const categoryId = `cat-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
      
      await setDoc(categoryRef, {
        id: categoryId,
        title: category.title,
        color: category.color,
        type: category.type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await Promise.all(promises);

    return {
      success: true,
      savedCount: categories.length,
    };
  } catch (error: unknown) {
    console.error('Erro ao salvar múltiplas categorias:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar categorias';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

