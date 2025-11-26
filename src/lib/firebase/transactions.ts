// Serviço para gerenciar transações no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Transaction, GroupMember } from '@/types';

export interface TransactionData {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Timestamp;
  groupId: string;
  userId: string;
  receipt?: string;
  responsible: GroupMember;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Salvar nova transação no Firestore (como subcoleção do usuário)
export const saveTransaction = async (
  transaction: Omit<Transaction, 'id'>,
  userId: string
): Promise<{ success: boolean; error?: string; transactionId?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Gerar ID único para a transação
    const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Salvar como subcoleção dentro do usuário: users/{userId}/transactions/{transactionId}
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);

    // Converter Date para Timestamp do Firestore
    let firestoreDate: Timestamp;
    if (transaction.date instanceof Date) {
      firestoreDate = Timestamp.fromDate(transaction.date);
    } else if (transaction.date) {
      firestoreDate = Timestamp.fromDate(new Date(transaction.date));
    } else {
      firestoreDate = Timestamp.now();
    }

    await setDoc(transactionRef, {
      id: transactionId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: firestoreDate,
      groupId: transaction.groupId || '',
      userId: transaction.userId,
      receipt: transaction.receipt || null,
      responsible: transaction.responsible,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, transactionId };
  } catch (error: unknown) {
    console.error('Erro ao salvar transação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar transação';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar transações do usuário no Firestore (da subcoleção do usuário)
export const getUserTransactions = async (
  userId: string, 
  groupId?: string
): Promise<{ success: boolean; data?: Transaction[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Buscar da subcoleção: users/{userId}/transactions
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    let q = query(transactionsRef, orderBy('date', 'desc'));
    
    if (groupId) {
      q = query(transactionsRef, where('groupId', '==', groupId), orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Converter Timestamp do Firestore para Date
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      
      transactions.push({
        id: data.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: date,
        groupId: data.groupId,
        userId: data.userId,
        receipt: data.receipt,
        responsible: data.responsible,
      });
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar transações:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar transações';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Atualizar transação existente no Firestore
export const updateTransaction = async (
  transactionId: string,
  transaction: Partial<Omit<Transaction, 'id'>>,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Atualizar na subcoleção: users/{userId}/transactions/{transactionId}
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);

    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.category !== undefined) updateData.category = transaction.category;
    if (transaction.date !== undefined) {
      updateData.date = transaction.date instanceof Date 
        ? Timestamp.fromDate(transaction.date)
        : serverTimestamp();
    }
    if (transaction.groupId !== undefined) updateData.groupId = transaction.groupId;
    if (transaction.receipt !== undefined) updateData.receipt = transaction.receipt || null;
    if (transaction.responsible !== undefined) updateData.responsible = transaction.responsible;

    await updateDoc(transactionRef, updateData);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar transação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar transação';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Deletar transação do Firestore
export const deleteTransaction = async (
  transactionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionRef);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao deletar transação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar transação';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

