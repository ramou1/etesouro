// Serviço para gerenciar transações no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDocs, 
  getDoc,
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

// Salvar nova transação no Firestore
// Se a transação pertence a um grupo, salva em groups/{groupId}/transactions
// Se não pertence a um grupo, salva em users/{userId}/transactions
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

  const firestoreDb = db;

  try {
    // Gerar ID único para a transação
    const transactionId = `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Converter Date para Timestamp do Firestore
    let firestoreDate: Timestamp;
    if (transaction.date instanceof Date) {
      firestoreDate = Timestamp.fromDate(transaction.date);
    } else if (transaction.date) {
      firestoreDate = Timestamp.fromDate(new Date(transaction.date));
    } else {
      firestoreDate = Timestamp.now();
    }

    const transactionData = {
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
    };

    // Se a transação pertence a um grupo, salvar na subcoleção do grupo
    if (transaction.groupId) {
      const transactionRef = doc(firestoreDb, 'groups', transaction.groupId, 'transactions', transactionId);
      await setDoc(transactionRef, transactionData);
    } else {
      // Se não pertence a um grupo, salvar na subcoleção do usuário
      const transactionRef = doc(firestoreDb, 'users', userId, 'transactions', transactionId);
      await setDoc(transactionRef, transactionData);
    }

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

// Buscar transações do Firestore
// Se groupId for fornecido, busca de groups/{groupId}/transactions
// Caso contrário, busca de users/{userId}/transactions
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

  const firestoreDb = db;

  try {
    let transactionsRef;
    let q;
    
    if (groupId) {
      // Buscar da subcoleção do grupo: groups/{groupId}/transactions
      transactionsRef = collection(firestoreDb, 'groups', groupId, 'transactions');
      q = query(transactionsRef, orderBy('date', 'desc'));
    } else {
      // Buscar da subcoleção do usuário: users/{userId}/transactions
      transactionsRef = collection(firestoreDb, 'users', userId, 'transactions');
      q = query(transactionsRef, orderBy('date', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Converter Timestamp do Firestore para Date
      const date = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : undefined);
      
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
        updatedAt: updatedAt,
      });
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error: unknown) {
    // Se for erro de permissões, pode ser que o usuário ainda não tenha aceitado o convite
    // ou que o grupo não exista mais. Retornar array vazio em vez de falhar completamente
    if (error instanceof Error && error.message.includes('permissions')) {
      console.warn('Permissão negada ao buscar transações. Pode ser que o usuário ainda não tenha aceitado o convite do grupo ou o grupo não exista mais.');
      return {
        success: true,
        data: [], // Retornar array vazio em vez de erro
      };
    }
    
    console.error('Erro ao buscar transações:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar transações';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Atualizar transação existente no Firestore
// Se a transação pertence a um grupo, atualiza em groups/{groupId}/transactions
// Caso contrário, atualiza em users/{userId}/transactions
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

  const firestoreDb = db;

  try {
    // Primeiro, tentar encontrar a transação no grupo (se tiver groupId)
    let currentTransactionRef: ReturnType<typeof doc> | null = null;
    let groupId: string | undefined = transaction.groupId;

    // Se temos groupId, buscar no grupo primeiro
    if (groupId) {
      currentTransactionRef = doc(firestoreDb, 'groups', groupId, 'transactions', transactionId);
      const groupTransactionDoc = await getDoc(currentTransactionRef);
      if (groupTransactionDoc.exists()) {
        const data = groupTransactionDoc.data();
        groupId = data.groupId || groupId;
      } else {
        // Se não encontrou no grupo, tentar no usuário
        currentTransactionRef = doc(firestoreDb, 'users', userId, 'transactions', transactionId);
        const userTransactionDoc = await getDoc(currentTransactionRef);
        if (userTransactionDoc.exists()) {
          const data = userTransactionDoc.data();
          groupId = data.groupId;
          // Se a transação tem groupId mas estava no usuário, mover para o grupo
          if (data.groupId && data.groupId !== '') {
            currentTransactionRef = doc(firestoreDb, 'groups', data.groupId, 'transactions', transactionId);
          }
        } else {
          return {
            success: false,
            error: 'Transação não encontrada.',
          };
        }
      }
    } else {
      // Sem groupId, buscar no usuário
      currentTransactionRef = doc(firestoreDb, 'users', userId, 'transactions', transactionId);
      const userTransactionDoc = await getDoc(currentTransactionRef);
      if (!userTransactionDoc.exists()) {
        return {
          success: false,
          error: 'Transação não encontrada.',
        };
      }
      const data = userTransactionDoc.data();
      groupId = data.groupId;
    }

    if (!currentTransactionRef) {
      return {
        success: false,
        error: 'Transação não encontrada.',
      };
    }

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

    // Atualizar a transação
    await updateDoc(currentTransactionRef, updateData);

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

// Deletar todas as transações de um grupo
// Deleta de groups/{groupId}/transactions
export const deleteGroupTransactions = async (
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  const firestoreDb = db;

  try {
    // Verificar se o grupo existe
    const groupRef = doc(firestoreDb, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      return { success: true }; // Grupo não existe, não há transações para deletar
    }

    // Buscar todas as transações do grupo
    const transactionsRef = collection(firestoreDb, 'groups', groupId, 'transactions');
    const querySnapshot = await getDocs(transactionsRef);
    
    // Deletar cada transação encontrada
    const deletePromises = querySnapshot.docs.map(async (docSnap) => {
      await deleteDoc(docSnap.ref);
    });
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao deletar transações do grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar transações do grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Deletar transação do Firestore
// Se a transação pertence a um grupo, deleta de groups/{groupId}/transactions
// Caso contrário, deleta de users/{userId}/transactions
// Aceita groupId opcional para melhor performance
export const deleteTransaction = async (
  transactionId: string,
  userId: string,
  groupId?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  const firestoreDb = db;

  try {
    let transactionRef: ReturnType<typeof doc> | null = null;
    let found = false;

    // Se temos groupId, tentar deletar do grupo primeiro
    if (groupId && groupId !== '') {
      transactionRef = doc(firestoreDb, 'groups', groupId, 'transactions', transactionId);
      const groupTransactionDoc = await getDoc(transactionRef);
      if (groupTransactionDoc.exists()) {
        found = true;
      }
    }

    // Se não encontrou no grupo (ou não temos groupId), tentar no usuário
    if (!found) {
      const userTransactionRef = doc(firestoreDb, 'users', userId, 'transactions', transactionId);
      const userTransactionDoc = await getDoc(userTransactionRef);
      
      if (userTransactionDoc.exists()) {
        const data = userTransactionDoc.data();
        const transGroupId = data.groupId;
        
        if (transGroupId && transGroupId !== '') {
          // Se tem groupId, deletar do grupo
          transactionRef = doc(firestoreDb, 'groups', transGroupId, 'transactions', transactionId);
          const groupTransactionDoc = await getDoc(transactionRef);
          if (groupTransactionDoc.exists()) {
            found = true;
            // Deletar também do usuário (pode ser uma transação antiga)
            await deleteDoc(userTransactionRef);
          } else {
            // Se não encontrou no grupo, deletar do usuário mesmo
            transactionRef = userTransactionRef;
            found = true;
          }
        } else {
          // Sem groupId, deletar do usuário
          transactionRef = userTransactionRef;
          found = true;
        }
      }
    }

    if (!found || !transactionRef) {
      return {
        success: false,
        error: 'Transação não encontrada.',
      };
    }

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

