// Serviço para gerenciar dados do usuário no Firestore
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { User } from '@/types';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Criar ou atualizar dados do usuário no Firestore
export const saveUserData = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const userRef = doc(db, 'users', userData.id);
    
    // Verificar se o documento já existe
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Atualizar documento existente
      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || null,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Criar novo documento
      await setDoc(userRef, {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar dados do usuário:', error);
    return {
      success: false,
      error: error.message || 'Erro ao salvar dados do usuário',
    };
  }
};

// Buscar dados do usuário no Firestore
export const getUserData = async (userId: string): Promise<{ success: boolean; data?: UserData; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      };
    } else {
      return {
        success: false,
        error: 'Usuário não encontrado no banco de dados',
      };
    }
  } catch (error: any) {
    console.error('Erro ao buscar dados do usuário:', error);
    return {
      success: false,
      error: error.message || 'Erro ao buscar dados do usuário',
    };
  }
};

// Atualizar apenas o avatar do usuário
export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      avatar: avatarUrl,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar avatar:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar avatar',
    };
  }
};

// Atualizar nome do usuário
export const updateUserName = async (userId: string, name: string): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      name: name,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar nome:', error);
    return {
      success: false,
      error: error.message || 'Erro ao atualizar nome',
    };
  }
};

