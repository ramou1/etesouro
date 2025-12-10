// Serviço para gerenciar dados do usuário no Firestore
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from './config';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
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
  } catch (error: unknown) {
    console.error('Erro ao salvar dados do usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar dados do usuário';
    return {
      success: false,
      error: errorMessage,
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
  } catch (error: unknown) {
    console.error('Erro ao buscar dados do usuário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados do usuário';
    return {
      success: false,
      error: errorMessage,
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
  } catch (error: unknown) {
    console.error('Erro ao atualizar avatar:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar avatar';
    return {
      success: false,
      error: errorMessage,
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
  } catch (error: unknown) {
    console.error('Erro ao atualizar nome:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar nome';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar usuários por nome ou email
export const searchUsers = async (searchTerm: string, excludeUserId?: string): Promise<{ success: boolean; data?: UserData[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  if (!searchTerm || searchTerm.trim().length < 2) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const usersRef = collection(db, 'users');
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Buscar por nome (case-insensitive não é suportado diretamente, então vamos buscar todos e filtrar)
    // Para melhor performance, vamos limitar a busca e filtrar no cliente
    const usersQuery = query(usersRef, limit(50));
    const querySnapshot = await getDocs(usersQuery);
    
    const users: UserData[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserData;
      // Usar o ID do documento ou o campo id do documento
      const userId = data.id || docSnap.id;
      
      // Excluir o próprio usuário se fornecido
      if (excludeUserId && userId === excludeUserId) {
        return;
      }
      
      // Filtrar por nome ou email que contenha o termo de busca
      const nameMatch = data.name?.toLowerCase().includes(searchLower);
      const emailMatch = data.email?.toLowerCase().includes(searchLower);
      
      if (nameMatch || emailMatch) {
        users.push({
          id: userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });

    return {
      success: true,
      data: users,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar usuários:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuários';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

