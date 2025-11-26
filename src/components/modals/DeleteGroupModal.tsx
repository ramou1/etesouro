'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { deleteGroup } from '@/lib/firebase/groups';
import { Group } from '@/types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface DeleteGroupModalProps {
  group: Group;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteGroupModal({ group, onClose, onConfirm }: DeleteGroupModalProps) {
  const { user, reloadCategoriesAndGroups, groups, setActiveGroup } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user?.id) {
      alert('Usuário não autenticado');
      return;
    }

    // Não permitir deletar grupos mockados (IDs numéricos simples)
    if (group.id.length <= 2) {
      alert('Não é possível deletar grupos padrão do sistema');
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteGroup(group.id, user.id);
      if (result.success) {
        // Se o grupo deletado era o ativo, mudar para outro
        if (groups.length > 0) {
          const otherGroups = groups.filter(g => g.id !== group.id);
          if (otherGroups.length > 0) {
            setActiveGroup(otherGroups[0]);
          }
        }
        await reloadCategoriesAndGroups();
        onConfirm();
        onClose();
      } else {
        alert(result.error || 'Erro ao deletar grupo');
      }
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      alert('Erro ao deletar grupo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDeleteModal
      title="Excluir Grupo"
      message={`Tem certeza que deseja excluir o grupo "${group.title}"? Todas as transações associadas a este grupo serão mantidas, mas o grupo será removido. Esta ação não pode ser desfeita.`}
      onConfirm={handleConfirm}
      onCancel={onClose}
      isLoading={isLoading}
    />
  );
}

