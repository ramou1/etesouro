// Serviço para gerenciar limites de orçamento no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  serverTimestamp,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';
import { BudgetLimit } from '@/types';

export interface BudgetLimitData {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  type: 'essential' | 'fixed' | 'reserve' | 'sporadic' | 'uncategorized';
  groupId: string;
  categoryIds?: string[];
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;
}

// Limites padrão que serão criados para cada grupo
const DEFAULT_BUDGET_LIMITS: Omit<BudgetLimitData, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Fixo/Mensal/Essencial',
    description: 'Gastos essenciais mensais (aluguel, alimentação básica, saúde)',
    percentage: 0,
    color: 'bg-red-100 text-red-600',
    type: 'essential',
    categoryIds: []
  },
  {
    name: 'Fixo/Mensal',
    description: 'Gastos fixos mensais (internet, telefone, academia)',
    percentage: 0,
    color: 'bg-orange-100 text-orange-600',
    type: 'fixed',
    categoryIds: []
  },
  {
    name: 'Reserva Financeira',
    description: 'Para emergências e investimentos',
    percentage: 0,
    color: 'bg-green-100 text-green-600',
    type: 'reserve',
    categoryIds: []
  },
  {
    name: 'Esporádico',
    description: 'Gastos ocasionais e lazer',
    percentage: 0,
    color: 'bg-blue-100 text-blue-600',
    type: 'sporadic',
    categoryIds: []
  },
  {
    name: 'Sem Categoria',
    description: 'Despesas sem categoria escolhida',
    percentage: 0,
    color: 'bg-gray-100 text-gray-600',
    type: 'uncategorized',
    categoryIds: []
  }
];

// Criar limites padrão para um grupo
export const createDefaultBudgetLimits = async (
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const limitsRef = collection(db, 'users', userId, 'groups', groupId, 'budgetLimits');
    
    const createPromises = DEFAULT_BUDGET_LIMITS.map(async (limit) => {
      const limitId = `limit-${limit.type}-${groupId}`;
      const limitRef = doc(limitsRef, limitId);
      
      const limitData: BudgetLimitData = {
        id: limitId,
        ...limit,
        groupId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(limitRef, limitData);
    });

    await Promise.all(createPromises);
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao criar limites padrão:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar limites padrão';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar limites de orçamento de um grupo
export const getGroupBudgetLimits = async (
  groupId: string,
  userId: string
): Promise<{ success: boolean; data?: BudgetLimit[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const limitsRef = collection(db, 'users', userId, 'groups', groupId, 'budgetLimits');
    const querySnapshot = await getDocs(limitsRef);
    const limits: BudgetLimit[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      limits.push({
        id: data.id,
        name: data.name,
        description: data.description,
        percentage: data.percentage || 0,
        color: data.color,
        type: data.type,
        groupId: data.groupId,
        categoryIds: data.categoryIds || [],
      });
    });

    return {
      success: true,
      data: limits,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar limites de orçamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar limites de orçamento';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Salvar/Atualizar limites de orçamento de um grupo
export const saveGroupBudgetLimits = async (
  groupId: string,
  userId: string,
  limits: Omit<BudgetLimit, 'id' | 'groupId'>[]
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const limitsRef = collection(db, 'users', userId, 'groups', groupId, 'budgetLimits');
    
    const savePromises = limits.map(async (limit) => {
      // Usar o type como parte do ID para manter consistência
      const limitId = `limit-${limit.type}-${groupId}`;
      const limitRef = doc(limitsRef, limitId);
      
      const limitData: BudgetLimitData = {
        id: limitId,
        name: limit.name,
        description: limit.description,
        percentage: limit.percentage,
        color: limit.color,
        type: limit.type,
        groupId,
        categoryIds: limit.categoryIds || [],
        updatedAt: serverTimestamp(),
      };

      await setDoc(limitRef, limitData, { merge: true });
    });

    await Promise.all(savePromises);
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao salvar limites de orçamento:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar limites de orçamento';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

