'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { deleteCategory } from '@/lib/firebase/categories';
import { Category } from '@/types';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface DeleteCategoryModalProps {
  category: Category;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCategoryModal({ category, onClose, onConfirm }: DeleteCategoryModalProps) {
  const { user, reloadCategoriesAndGroups } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!user?.id) {
      alert('Usuário não autenticado');
      return;
    }

    // Não permitir deletar categorias mockadas (IDs numéricos simples)
    if (category.id.length <= 2) {
      alert('Não é possível deletar categorias padrão do sistema');
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteCategory(category.id, user.id);
      if (result.success) {
        await reloadCategoriesAndGroups();
        onConfirm();
        onClose();
      } else {
        alert(result.error || 'Erro ao deletar categoria');
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmDeleteModal
      title="Excluir Categoria"
      message={`Tem certeza que deseja excluir a categoria "${category.title}"? Esta ação não pode ser desfeita.`}
      onConfirm={handleConfirm}
      onCancel={onClose}
      isLoading={isLoading}
    />
  );
}

