// Serviço para gerenciar feedback dos usuários no Firestore
import { doc, setDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore';
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
