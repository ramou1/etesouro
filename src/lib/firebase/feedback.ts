// Serviço para gerenciar feedback dos usuários no Firestore
import { doc, setDoc, getDocs, collection, query, limit, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
import { db } from './config';

export type FeedbackType = 'sugestão' | 'dúvida' | 'bug' | 'outro';

export interface FeedbackData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: FeedbackType;
  description: string;
  createdAt: Timestamp | FieldValue | null;
}

// Salvar feedback no Firestore
export const saveFeedback = async (
  userId: string,
  userName: string,
  userEmail: string,
  type: FeedbackType,
  description: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Gerar ID único para o feedback
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Salvar feedback na coleção feedbacks
    const feedbackRef = doc(db, 'feedbacks', feedbackId);

    const feedbackData: FeedbackData = {
      id: feedbackId,
      userId,
      userName,
      userEmail,
      type,
      description: description.trim(),
      createdAt: serverTimestamp(),
    };

    await setDoc(feedbackRef, feedbackData);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao salvar feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar feedback';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Listar feedbacks para painel admin (mais recentes primeiro)
export const getFeedbacksForAdmin = async (): Promise<{ success: boolean; data?: FeedbackData[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const feedbacksRef = collection(db, 'feedbacks');
    const q = query(feedbacksRef, limit(200));
    const querySnapshot = await getDocs(q);

    const feedbacks: FeedbackData[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FeedbackData;
      feedbacks.push({
        id: data.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        type: data.type,
        description: data.description,
        createdAt: data.createdAt,
      });
    });

    // Ordenar por data (mais recentes primeiro) em memória
    feedbacks.sort((a, b) => {
      const aTime = a.createdAt && typeof (a.createdAt as { toMillis?: () => number }).toMillis === 'function'
        ? (a.createdAt as { toMillis: () => number }).toMillis()
        : 0;
      const bTime = b.createdAt && typeof (b.createdAt as { toMillis?: () => number }).toMillis === 'function'
        ? (b.createdAt as { toMillis: () => number }).toMillis()
        : 0;
      return bTime - aTime;
    });

    return {
      success: true,
      data: feedbacks,
    };
  } catch (error: unknown) {
    console.error('Erro ao listar feedbacks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao listar feedbacks';
    return {
      success: false,
      error: errorMessage,
    };
  }
};
