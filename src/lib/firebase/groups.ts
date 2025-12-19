// Serviço para gerenciar grupos no Firestore
// Grupos são salvos na raiz (groups/{groupId}) para sincronização entre membros
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
  serverTimestamp,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';
import { Group, GroupMember } from '@/types';
import { createDefaultBudgetLimits } from './budgetLimits';
import { deleteGroupTransactions } from './transactions';

export interface GroupData {
  id: string;
  title: string;
  description?: string;
  members: GroupMember[];
  isTemporary: boolean;
  createdBy: string; // userId do criador
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;
}

// Interface para referência de membro do grupo
export interface GroupMembership {
  groupId: string;
  userId: string;
  joinedAt?: Timestamp | FieldValue | null;
}

// Salvar novo grupo no Firestore (na raiz: groups/{groupId})
export const saveGroup = async (
  group: Omit<Group, 'id'>, 
  userId: string
): Promise<{ success: boolean; error?: string; groupId?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Gerar ID único para o grupo
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Salvar grupo na raiz: groups/{groupId}
    const groupRef = doc(firestoreDb, 'groups', groupId);

    // Atualizar o groupId em todos os membros
    const membersWithGroupId = group.members.map(member => ({
      ...member,
      groupId: groupId
    }));

    const groupData: GroupData = {
      id: groupId,
      title: group.title,
      description: group.description || undefined,
      members: membersWithGroupId,
      isTemporary: group.isTemporary,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(groupRef, groupData);

    // Criar referências de membros para todos os membros do grupo
    const membershipPromises = membersWithGroupId.map(async (member) => {
      try {
        const membershipRef = doc(firestoreDb, 'users', member.id, 'groupMemberships', groupId);
        await setDoc(membershipRef, {
          groupId,
          userId: member.id,
          joinedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Erro ao criar referência de membro ${member.id}:`, error);
      }
    });

    await Promise.allSettled(membershipPromises);

    // Criar limites de orçamento padrão para o grupo
    try {
      await createDefaultBudgetLimits(groupId, userId);
    } catch (error) {
      console.error('Erro ao criar limites padrão do grupo:', error);
      // Não falhar a criação do grupo se houver erro ao criar limites
    }

    // Criar convites para cada membro (exceto o criador)
    // Buscar dados do criador para incluir no convite
    const creatorRef = doc(firestoreDb, 'users', userId);
    const creatorDoc = await getDoc(creatorRef);
    const creatorData = creatorDoc.exists() ? creatorDoc.data() : null;
    
    const creatorInfo = {
      id: userId,
      name: creatorData?.name || 'Usuário',
      email: creatorData?.email || '',
    };

    const invitePromises = group.members
      .filter(member => member.id !== userId)
      .map(async (member) => {
        try {
          await createGroupInvite(groupId, groupData, creatorInfo, member.id);
        } catch (error) {
          console.error(`Erro ao criar convite para membro ${member.id}:`, error);
          // Não falhar a operação principal se houver erro ao criar convite
        }
      });

    // Aguardar todas as operações de criar convites (mas não falhar se alguma der erro)
    await Promise.allSettled(invitePromises);

    return { success: true, groupId };
  } catch (error: unknown) {
    console.error('Erro ao salvar grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar grupos do usuário usando referências (groupMemberships)
export const getUserGroups = async (userId: string): Promise<{ success: boolean; data?: Group[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Buscar referências de grupos do usuário
    const membershipsRef = collection(firestoreDb, 'users', userId, 'groupMemberships');
    const membershipsSnapshot = await getDocs(membershipsRef);
    
    const groupIds: string[] = [];
    membershipsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.groupId) {
        groupIds.push(data.groupId);
      }
    });

    // Buscar os grupos da raiz
    const groups: Group[] = [];
    for (const groupId of groupIds) {
      try {
        const groupRef = doc(firestoreDb, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          groups.push({
            id: data.id,
            title: data.title,
            description: data.description,
            members: data.members || [],
            isTemporary: data.isTemporary || false,
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar grupo ${groupId}:`, error);
        // Continuar mesmo se houver erro em algum grupo
      }
    }

    return {
      success: true,
      data: groups,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar grupos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar grupos';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar um grupo específico da raiz
export const getGroup = async (groupId: string): Promise<{ success: boolean; data?: GroupData; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    const groupRef = doc(firestoreDb, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      return {
        success: false,
        error: 'Grupo não encontrado.',
      };
    }

    const data = groupDoc.data() as GroupData;
    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Atualizar grupo existente no Firestore (na raiz)
export const updateGroup = async (
  groupId: string,
  group: Omit<Group, 'id'>,
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
    // Atualizar na raiz: groups/{groupId}
    const groupRef = doc(firestoreDb, 'groups', groupId);

    // Verificar se o grupo existe e se o usuário tem permissão
    const groupDoc = await getDoc(groupRef);
    if (!groupDoc.exists()) {
      return {
        success: false,
        error: 'Grupo não encontrado.',
      };
    }

    // Atualizar o groupId em todos os membros
    const membersWithGroupId = group.members.map(member => ({
      ...member,
      groupId: groupId
    }));

    const groupData = {
      id: groupId,
      title: group.title,
      description: group.description || undefined,
      members: membersWithGroupId,
      isTemporary: group.isTemporary,
      updatedAt: serverTimestamp(),
    };

    // Buscar membros antigos para identificar novos membros
    const oldData = groupDoc.data() as GroupData;
    const oldMembers = oldData.members || [];

    await updateDoc(groupRef, groupData);

    // Identificar novos membros (que não estavam no grupo antes)
    const oldMemberIds = oldMembers.map(m => m.id);
    const newMembers = membersWithGroupId.filter(m => !oldMemberIds.includes(m.id));
    const removedMembers = oldMembers.filter(m => !membersWithGroupId.some(nm => nm.id === m.id));

    // Criar referências para novos membros
    const addMembershipPromises = newMembers.map(async (member) => {
      try {
        const membershipRef = doc(firestoreDb, 'users', member.id, 'groupMemberships', groupId);
        await setDoc(membershipRef, {
          groupId,
          userId: member.id,
          joinedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Erro ao criar referência para novo membro ${member.id}:`, error);
      }
    });

    // Remover referências de membros removidos
    const removeMembershipPromises = removedMembers.map(async (member) => {
      try {
        const membershipRef = doc(firestoreDb, 'users', member.id, 'groupMemberships', groupId);
        await deleteDoc(membershipRef);
      } catch (error) {
        console.error(`Erro ao remover referência de membro ${member.id}:`, error);
      }
    });

    await Promise.allSettled([...addMembershipPromises, ...removeMembershipPromises]);

    // Buscar dados do criador para incluir no convite
    const creatorRef = doc(firestoreDb, 'users', userId);
    const creatorDoc = await getDoc(creatorRef);
    const creatorData = creatorDoc.exists() ? creatorDoc.data() : null;
    
    const creatorInfo = {
      id: userId,
      name: creatorData?.name || 'Usuário',
      email: creatorData?.email || '',
    };

    // Criar convites para novos membros
    const invitePromises = newMembers
      .filter(member => member.id !== userId)
      .map(async (member) => {
        try {
          await createGroupInvite(groupId, groupData as GroupData, creatorInfo, member.id);
        } catch (error) {
          console.error(`Erro ao criar convite para novo membro ${member.id}:`, error);
        }
      });

    await Promise.allSettled(invitePromises);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao atualizar grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Deletar grupo do Firestore (da raiz e todas as referências)
export const deleteGroup = async (
  groupId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Buscar o grupo para obter lista de membros
    const groupRef = doc(firestoreDb, 'groups', groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      return {
        success: false,
        error: 'Grupo não encontrado.',
      };
    }

    const groupData = groupDoc.data() as GroupData;
    const members = groupData.members || [];

    // Primeiro, deletar todas as transações do grupo
    const deleteTransactionsResult = await deleteGroupTransactions(groupId, userId);
    
    if (!deleteTransactionsResult.success) {
      console.error('Erro ao deletar transações do grupo:', deleteTransactionsResult.error);
      // Continuar mesmo se houver erro ao deletar transações
    }

    // Remover referências de membros
    const removeMembershipPromises = members.map(async (member) => {
      try {
        const membershipRef = doc(firestoreDb, 'users', member.id, 'groupMemberships', groupId);
        await deleteDoc(membershipRef);
      } catch (error) {
        console.error(`Erro ao remover referência de membro ${member.id}:`, error);
      }
    });

    await Promise.allSettled(removeMembershipPromises);

    // Deletar limites de orçamento (subcoleção do grupo)
    try {
      const limitsRef = collection(firestoreDb, 'groups', groupId, 'budgetLimits');
      const limitsSnapshot = await getDocs(limitsRef);
      const deleteLimitsPromises = limitsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.allSettled(deleteLimitsPromises);
    } catch (error) {
      console.error('Erro ao deletar limites do grupo:', error);
    }

    // Por último, deletar o grupo da raiz
    await deleteDoc(groupRef);

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao deletar grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// ========== SISTEMA DE CONVITES ==========

export interface GroupInvite {
  id: string;
  groupId: string;
  groupData: GroupData;
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
  invitedTo: string; // userId do convidado
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Timestamp | FieldValue | null;
  updatedAt?: Timestamp | FieldValue | null;
}

// Criar convite para um grupo
export const createGroupInvite = async (
  groupId: string,
  groupData: GroupData,
  invitedBy: { id: string; name: string; email: string },
  invitedToUserId: string
): Promise<{ success: boolean; error?: string; inviteId?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Criar novo convite
    const inviteId = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const inviteRef = doc(firestoreDb, 'groupInvites', inviteId);
    
    const inviteData = {
      id: inviteId,
      groupId,
      groupData,
      invitedBy,
      invitedTo: invitedToUserId,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(inviteRef, inviteData);

    return { success: true, inviteId };
  } catch (error: unknown) {
    console.error('Erro ao criar convite:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao criar convite';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar convites pendentes de um usuário
export const getPendingInvites = async (
  userId: string
): Promise<{ success: boolean; data?: GroupInvite[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    const invitesRef = collection(firestoreDb, 'groupInvites');
    const invitesQuery = query(
      invitesRef,
      where('invitedTo', '==', userId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(invitesQuery);
    
    const invites: GroupInvite[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as GroupInvite;
      invites.push(data);
    });

    // Ordenar por data de criação (mais recentes primeiro)
    invites.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    return {
      success: true,
      data: invites,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar convites:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar convites';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Aceitar convite - cria apenas referência de membro
export const acceptGroupInvite = async (
  inviteId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Buscar o convite
    const inviteRef = doc(firestoreDb, 'groupInvites', inviteId);
    const inviteDoc = await getDoc(inviteRef);
    
    if (!inviteDoc.exists()) {
      return {
        success: false,
        error: 'Convite não encontrado.',
      };
    }

    const inviteData = inviteDoc.data() as GroupInvite;
    
    // Verificar se o convite é para o usuário correto
    if (inviteData.invitedTo !== userId) {
      return {
        success: false,
        error: 'Este convite não é para você.',
      };
    }

    // Verificar se o convite ainda está pendente
    if (inviteData.status !== 'pending') {
      return {
        success: false,
        error: 'Este convite já foi processado.',
      };
    }

    // Atualizar status do convite
    await updateDoc(inviteRef, {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    // Criar referência de membro (não copiar o grupo, apenas referência)
    const membershipRef = doc(firestoreDb, 'users', userId, 'groupMemberships', inviteData.groupId);
    await setDoc(membershipRef, {
      groupId: inviteData.groupId,
      userId: userId,
      joinedAt: serverTimestamp(),
    });

    // Verificar se o usuário já está na lista de membros do grupo
    const groupRef = doc(firestoreDb, 'groups', inviteData.groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (groupDoc.exists()) {
      const groupData = groupDoc.data() as GroupData;
      const isMember = groupData.members.some(m => m.id === userId);
      
      // Se não estiver na lista de membros, adicionar
      if (!isMember) {
        // Buscar dados do usuário para adicionar como membro
        const userRef = doc(firestoreDb, 'users', userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        if (userData) {
          const newMember: GroupMember = {
            id: userId,
            name: userData.name || 'Usuário',
            email: userData.email || '',
            avatar: userData.avatar || '',
            isAdmin: false,
            contributesIncome: false,
            groupId: inviteData.groupId,
          };
          
          await updateDoc(groupRef, {
            members: [...groupData.members, newMember],
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao aceitar convite:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao aceitar convite';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Recusar convite
export const rejectGroupInvite = async (
  inviteId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    // Buscar o convite
    const inviteRef = doc(firestoreDb, 'groupInvites', inviteId);
    const inviteDoc = await getDoc(inviteRef);
    
    if (!inviteDoc.exists()) {
      return {
        success: false,
        error: 'Convite não encontrado.',
      };
    }

    const inviteData = inviteDoc.data() as GroupInvite;
    
    // Verificar se o convite é para o usuário correto
    if (inviteData.invitedTo !== userId) {
      return {
        success: false,
        error: 'Este convite não é para você.',
      };
    }

    // Atualizar status do convite
    await updateDoc(inviteRef, {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Erro ao recusar convite:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao recusar convite';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Buscar convites pendentes de um grupo específico
export const getPendingInvitesForGroup = async (
  groupId: string
): Promise<{ success: boolean; data?: GroupInvite[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  // Criar variável local para TypeScript entender que db não é undefined
  const firestoreDb = db;

  try {
    const invitesRef = collection(firestoreDb, 'groupInvites');
    const invitesQuery = query(
      invitesRef,
      where('groupId', '==', groupId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(invitesQuery);
    
    const invites: GroupInvite[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as GroupInvite;
      invites.push(data);
    });

    return {
      success: true,
      data: invites,
    };
  } catch (error: unknown) {
    console.error('Erro ao buscar convites pendentes do grupo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar convites pendentes do grupo';
    return {
      success: false,
      error: errorMessage,
    };
  }
};
