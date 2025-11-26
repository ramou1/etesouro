// Serviço para gerenciar categorias no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
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
  userId: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Salvar nova categoria no Firestore
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
    const categoryId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const categoryRef = doc(db, 'categories', categoryId);

    await setDoc(categoryRef, {
      id: categoryId,
      title: title,
      color: color,
      type: type,
      userId: userId,
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

// Buscar categorias do usuário no Firestore
export const getUserCategories = async (userId: string, type?: 'income' | 'expense'): Promise<{ success: boolean; data?: Category[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const categoriesRef = collection(db, 'categories');
    let q = query(categoriesRef, where('userId', '==', userId));
    
    if (type) {
      q = query(categoriesRef, where('userId', '==', userId), where('type', '==', type));
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

