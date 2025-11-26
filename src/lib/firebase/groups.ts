// Serviço para gerenciar grupos no Firestore
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
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
  userId: string; // ID do usuário que criou o grupo
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

// Salvar novo grupo no Firestore
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
    const groupRef = doc(db, 'groups', groupId);

    // Atualizar o groupId em todos os membros
    const membersWithGroupId = group.members.map(member => ({
      ...member,
      groupId: groupId
    }));

    await setDoc(groupRef, {
      id: groupId,
      title: group.title,
      description: group.description || null,
      members: membersWithGroupId,
      isTemporary: group.isTemporary,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

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

// Buscar grupos do usuário no Firestore
export const getUserGroups = async (userId: string): Promise<{ success: boolean; data?: Group[]; error?: string }> => {
  if (!db) {
    return {
      success: false,
      error: 'Firestore não está configurado.',
    };
  }

  try {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
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

