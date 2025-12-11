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

// Salvar nova transação no Firestore (como subcoleção do usuário)
// Se a transação pertence a um grupo, salva em todos os membros do grupo
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

    // Se a transação pertence a um grupo, buscar todos os membros e salvar em cada um
    if (transaction.groupId) {
      try {
        // Buscar o grupo para obter a lista de membros
        const groupRef = doc(db, 'users', userId, 'groups', transaction.groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          const members = groupData.members || [];
          
          // Salvar a transação em todos os membros do grupo
          const savePromises = members.map(async (member: { id: string }) => {
            try {
              const memberTransactionRef = doc(db, 'users', member.id, 'transactions', transactionId);
              await setDoc(memberTransactionRef, transactionData);
            } catch (error) {
              console.error(`Erro ao salvar transação para membro ${member.id}:`, error);
              // Continuar mesmo se houver erro em algum membro
            }
          });
          
          await Promise.allSettled(savePromises);
        } else {
          // Se o grupo não existir, salvar apenas para o usuário atual
          const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
          await setDoc(transactionRef, transactionData);
        }
      } catch (error) {
        console.error('Erro ao buscar grupo para sincronização:', error);
        // Se houver erro ao buscar o grupo, salvar apenas para o usuário atual
        const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
        await setDoc(transactionRef, transactionData);
      }
    } else {
      // Se não pertence a um grupo, salvar apenas para o usuário atual
      const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
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
// Se a transação pertence a um grupo, atualiza em todos os membros
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
    // Buscar a transação atual para obter o groupId
    const currentTransactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    const currentTransactionDoc = await getDoc(currentTransactionRef);
    
    if (!currentTransactionDoc.exists()) {
      return {
        success: false,
        error: 'Transação não encontrada.',
      };
    }

    const currentData = currentTransactionDoc.data();
    const groupId = currentData.groupId || transaction.groupId;

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

    // Se a transação pertence a um grupo, atualizar em todos os membros
    if (groupId) {
      try {
        const groupRef = doc(db, 'users', userId, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          const members = groupData.members || [];
          
          // Atualizar a transação em todos os membros do grupo
          const updatePromises = members.map(async (member: { id: string }) => {
            try {
              const memberTransactionRef = doc(db, 'users', member.id, 'transactions', transactionId);
              await updateDoc(memberTransactionRef, updateData);
            } catch (error) {
              console.error(`Erro ao atualizar transação para membro ${member.id}:`, error);
              // Continuar mesmo se houver erro em algum membro
            }
          });
          
          await Promise.allSettled(updatePromises);
        } else {
          // Se o grupo não existir, atualizar apenas para o usuário atual
          await updateDoc(currentTransactionRef, updateData);
        }
      } catch (error) {
        console.error('Erro ao buscar grupo para sincronização:', error);
        // Se houver erro, atualizar apenas para o usuário atual
        await updateDoc(currentTransactionRef, updateData);
      }
    } else {
      // Se não pertence a um grupo, atualizar apenas para o usuário atual
      await updateDoc(currentTransactionRef, updateData);
    }

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
// Se a transação pertence a um grupo, deleta de todos os membros
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
    // Buscar a transação atual para obter o groupId
    const currentTransactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    const currentTransactionDoc = await getDoc(currentTransactionRef);
    
    let groupId: string | undefined;
    if (currentTransactionDoc.exists()) {
      const currentData = currentTransactionDoc.data();
      groupId = currentData.groupId;
    }

    // Se a transação pertence a um grupo, deletar de todos os membros
    if (groupId) {
      try {
        const groupRef = doc(db, 'users', userId, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          const members = groupData.members || [];
          
          // Deletar a transação de todos os membros do grupo
          const deletePromises = members.map(async (member: { id: string }) => {
            try {
              const memberTransactionRef = doc(db, 'users', member.id, 'transactions', transactionId);
              await deleteDoc(memberTransactionRef);
            } catch (error) {
              console.error(`Erro ao deletar transação para membro ${member.id}:`, error);
              // Continuar mesmo se houver erro em algum membro
            }
          });
          
          await Promise.allSettled(deletePromises);
        } else {
          // Se o grupo não existir, deletar apenas do usuário atual
          await deleteDoc(currentTransactionRef);
        }
      } catch (error) {
        console.error('Erro ao buscar grupo para sincronização:', error);
        // Se houver erro, deletar apenas do usuário atual
        await deleteDoc(currentTransactionRef);
      }
    } else {
      // Se não pertence a um grupo, deletar apenas do usuário atual
      await deleteDoc(currentTransactionRef);
    }

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

