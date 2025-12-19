// Serviço para gerenciar dados do usuário no Firestore
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from './config';

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  allowGroupInvites?: boolean;
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
        allowGroupInvites: userData.allowGroupInvites ?? true,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Criar novo documento
      await setDoc(userRef, {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || null,
        allowGroupInvites: userData.allowGroupInvites ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Sincronizar dados públicos para busca
    await syncUserSearchData(userData);

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
          allowGroupInvites: data.allowGroupInvites,
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

    // Buscar email do usuário para sincronizar
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      // Sincronizar com userSearch
      await syncUserSearchData({
        id: userId,
        name: name,
        email: userData.email,
        avatar: userData.avatar,
        allowGroupInvites: userData.allowGroupInvites,
      });
    }

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

// Atualizar allowGroupInvites do usuário
export const updateAllowGroupInvites = async (userId: string, allowGroupInvites: boolean): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      allowGroupInvites: allowGroupInvites,
      updatedAt: serverTimestamp(),
    });

    // Buscar dados do usuário para sincronizar
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      // Sincronizar com userSearch
      await syncUserSearchData({
        id: userId,
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        allowGroupInvites: allowGroupInvites,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar allowGroupInvites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar preferência de convites';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Sincronizar dados públicos do usuário para busca (coleção pública)
export const syncUserSearchData = async (userData: UserData): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    console.error('[syncUserSearchData] Firestore não está configurado');
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Criar/atualizar documento na coleção pública userSearch
    const userSearchRef = doc(db, 'userSearch', userData.id);
    const dataToSave = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      allowGroupInvites: userData.allowGroupInvites !== undefined ? userData.allowGroupInvites : true,
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(userSearchRef, dataToSave, { merge: true });

    return { success: true };
  } catch (error: unknown) {
    console.error('[syncUserSearchData] Erro ao sincronizar dados de busca:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao sincronizar dados';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Migrar todos os usuários existentes para a coleção userSearch (função utilitária)
// NOTA: Esta função requer permissões para ler a coleção 'users'
// Se as regras de segurança não permitirem, será necessário usar Cloud Functions ou ajustar as regras
export const migrateAllUsersToSearch = async (): Promise<{ success: boolean; migrated: number; error?: string }> => {
  if (!db) {
    console.error('[migrateAllUsersToSearch] Firestore não está configurado');
    return {
      success: false,
      migrated: 0,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef);
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.size === 0) {
      return {
        success: true,
        migrated: 0,
        error: 'Nenhum usuário encontrado na coleção users. Verifique as regras de segurança do Firestore.',
      };
    }
    
    let migrated = 0;
    const promises: Promise<void>[] = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserData;
      const userId = data.id || docSnap.id;
      
      if (data.name && data.email) {
        const promise = syncUserSearchData({
          id: userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
        }).then(() => {
          migrated++;
        }).catch((error) => {
          console.error('[migrateAllUsersToSearch] Erro ao migrar usuário:', userId, error);
        });
        
        promises.push(promise);
      }
    });
    
    await Promise.allSettled(promises);
    
    return {
      success: true,
      migrated,
    };
  } catch (error: unknown) {
    console.error('[migrateAllUsersToSearch] Erro na migração:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro na migração';
    
    // Verificar se é erro de permissão
    if (errorMessage.includes('permission') || errorMessage.includes('Permission')) {
      return {
        success: false,
        migrated: 0,
        error: 'Erro de permissão: Não é possível acessar a coleção "users". Verifique as regras de segurança do Firestore ou use Cloud Functions para migração.',
      };
    }
    
    return {
      success: false,
      migrated: 0,
      error: errorMessage,
    };
  }
};

// Buscar usuários por nome ou email (usando coleção pública userSearch)
export const searchUsers = async (searchTerm: string, excludeUserId?: string): Promise<{ success: boolean; data?: UserData[]; error?: string }> => {
  if (!db) {
    console.error('[searchUsers] Firestore não está configurado');
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
    // Buscar na coleção pública userSearch (mais permissiva)
    const userSearchRef = collection(db, 'userSearch');
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Buscar todos os documentos (limitado a 50 para performance)
    const usersQuery = query(userSearchRef, limit(50));
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
      
      // Verificar se o usuário permite convites de grupos
      const allowsInvites = data.allowGroupInvites ?? true;
      
      if ((nameMatch || emailMatch) && allowsInvites) {
        users.push({
          id: userId,
          name: data.name,
          email: data.email,
          avatar: data.avatar || undefined,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });

    // Limitar a 5 usuários
    const limitedUsers = users.slice(0, 5);

    return {
      success: true,
      data: limitedUsers,
    };
  } catch (error: unknown) {
    console.error('[searchUsers] Erro ao buscar usuários:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar usuários';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

