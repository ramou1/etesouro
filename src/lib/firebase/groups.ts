// Serviço para gerenciar grupos no Firestore
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
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Group, GroupMember } from '@/types';

export interface GroupData {
  id: string;
  title: string;
  description?: string;
  members: GroupMember[];
  isTemporary: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Salvar novo grupo no Firestore (como subcoleção do usuário)
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

  try {
    // Gerar ID único para o grupo
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Salvar como subcoleção dentro do usuário: users/{userId}/groups/{groupId}
    const groupRef = doc(db, 'users', userId, 'groups', groupId);

    // Atualizar o groupId em todos os membros
    const membersWithGroupId = group.members.map(member => ({
      ...member,
      groupId: groupId
    }));

    const groupData = {
      id: groupId,
      title: group.title,
      description: group.description || null,
      members: membersWithGroupId,
      isTemporary: group.isTemporary,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(groupRef, groupData);

    // Criar convites para cada membro (exceto o criador)
    // Buscar dados do criador para incluir no convite
    const creatorRef = doc(db, 'users', userId);
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

// Buscar grupos do usuário no Firestore (da subcoleção do usuário)
export const getUserGroups = async (userId: string): Promise<{ success: boolean; data?: Group[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    // Buscar da subcoleção: users/{userId}/groups
    const groupsRef = collection(db, 'users', userId, 'groups');
    const querySnapshot = await getDocs(groupsRef);
    const groups: Group[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      groups.push({
        id: data.id,
        title: data.title,
        description: data.description,
        members: data.members || [],
        isTemporary: data.isTemporary || false,
      });
    });

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

// Atualizar grupo existente no Firestore
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

  try {
    // Atualizar na subcoleção: users/{userId}/groups/{groupId}
    const groupRef = doc(db, 'users', userId, 'groups', groupId);

    // Atualizar o groupId em todos os membros
    const membersWithGroupId = group.members.map(member => ({
      ...member,
      groupId: groupId
    }));

    const groupData = {
      id: groupId,
      title: group.title,
      description: group.description || null,
      members: membersWithGroupId,
      isTemporary: group.isTemporary,
      updatedAt: serverTimestamp(),
    };

    // Buscar membros antigos para identificar novos membros
    const oldGroupDoc = await getDoc(groupRef);
    let oldMembers: GroupMember[] = [];
    if (oldGroupDoc.exists()) {
      const data = oldGroupDoc.data();
      oldMembers = data.members || [];
    }

    await updateDoc(groupRef, groupData);

    // Identificar novos membros (que não estavam no grupo antes)
    const oldMemberIds = oldMembers.map(m => m.id);
    const newMembers = membersWithGroupId.filter(m => !oldMemberIds.includes(m.id));

    // Buscar dados do criador para incluir no convite
    const creatorRef = doc(db, 'users', userId);
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
          await createGroupInvite(groupId, groupData, creatorInfo, member.id);
        } catch (error) {
          console.error(`Erro ao criar convite para novo membro ${member.id}:`, error);
        }
      });

    // Atualizar o grupo para todos os membros existentes (que já aceitaram o convite)
    const allMemberIds = membersWithGroupId.map(m => m.id);
    const updatePromises = allMemberIds
      .filter(memberId => memberId !== userId && oldMemberIds.includes(memberId))
      .map(async (memberId) => {
        try {
          const memberGroupRef = doc(db, 'users', memberId, 'groups', groupId);
          await updateDoc(memberGroupRef, groupData);
        } catch (error) {
          console.error(`Erro ao atualizar grupo para membro ${memberId}:`, error);
        }
      });

    await Promise.allSettled([...invitePromises, ...updatePromises]);

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

// Deletar grupo do Firestore
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

  try {
    const groupRef = doc(db, 'users', userId, 'groups', groupId);
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
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
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

  try {
    // Verificar se já existe um convite pendente
    const invitesRef = collection(db, 'groupInvites');
    const existingInviteQuery = query(
      invitesRef,
      where('groupId', '==', groupId),
      where('invitedTo', '==', invitedToUserId),
      where('status', '==', 'pending')
    );
    const existingInvites = await getDocs(existingInviteQuery);
    
    if (!existingInvites.empty) {
      return {
        success: false,
        error: 'Já existe um convite pendente para este usuário neste grupo.',
      };
    }

    // Criar novo convite
    const inviteId = `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const inviteRef = doc(db, 'groupInvites', inviteId);
    
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
    
    console.log('[createGroupInvite] Criando convite com dados:', {
      inviteId,
      groupId,
      invitedTo: invitedToUserId,
      invitedBy: invitedBy.id,
      status: 'pending'
    });
    
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

  try {
    console.log('[getPendingInvites] Buscando convites para usuário:', userId);
    const invitesRef = collection(db, 'groupInvites');
    const invitesQuery = query(
      invitesRef,
      where('invitedTo', '==', userId),
      where('status', '==', 'pending')
    );
    console.log('[getPendingInvites] Query criada, executando...');
    const querySnapshot = await getDocs(invitesQuery);
    console.log('[getPendingInvites] Documentos encontrados:', querySnapshot.size);
    
    const invites: GroupInvite[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as GroupInvite;
      console.log('[getPendingInvites] Convite encontrado:', { id: data.id, groupId: data.groupId, invitedTo: data.invitedTo });
      invites.push(data);
    });

    // Ordenar por data de criação (mais recentes primeiro)
    invites.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
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

// Aceitar convite
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

  try {
    // Buscar o convite
    const inviteRef = doc(db, 'groupInvites', inviteId);
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

    // Salvar o grupo na conta do usuário
    const groupRef = doc(db, 'users', userId, 'groups', inviteData.groupId);
    await setDoc(groupRef, inviteData.groupData);

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

  try {
    // Buscar o convite
    const inviteRef = doc(db, 'groupInvites', inviteId);
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

