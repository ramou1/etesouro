// Serviço para gerenciar grupos no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
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

    // Salvar o grupo também para cada membro (exceto o criador)
    const memberPromises = group.members
      .filter(member => member.id !== userId)
      .map(async (member) => {
        try {
          const memberGroupRef = doc(db, 'users', member.id, 'groups', groupId);
          await setDoc(memberGroupRef, groupData);
        } catch (error) {
          console.error(`Erro ao salvar grupo para membro ${member.id}:`, error);
          // Não falhar a operação principal se houver erro ao salvar para um membro
        }
      });

    // Aguardar todas as operações de salvar para membros (mas não falhar se alguma der erro)
    await Promise.allSettled(memberPromises);

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

    // Salvar o grupo atualizado para novos membros
    const memberPromises = newMembers
      .filter(member => member.id !== userId)
      .map(async (member) => {
        try {
          const memberGroupRef = doc(db, 'users', member.id, 'groups', groupId);
          await setDoc(memberGroupRef, groupData);
        } catch (error) {
          console.error(`Erro ao salvar grupo para membro ${member.id}:`, error);
        }
      });

    // Atualizar o grupo para todos os membros existentes também
    const allMemberIds = membersWithGroupId.map(m => m.id);
    const updatePromises = allMemberIds
      .filter(memberId => memberId !== userId)
      .map(async (memberId) => {
        try {
          const memberGroupRef = doc(db, 'users', memberId, 'groups', groupId);
          await updateDoc(memberGroupRef, groupData);
        } catch (error) {
          console.error(`Erro ao atualizar grupo para membro ${memberId}:`, error);
        }
      });

    await Promise.allSettled([...memberPromises, ...updatePromises]);

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

