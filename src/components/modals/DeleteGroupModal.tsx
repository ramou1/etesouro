'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { deleteGroup } from '@/lib/firebase/groups';
import { Group } from '@/types';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteGroupModalProps {
  group: Group;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteGroupModal({ group, onClose, onConfirm }: DeleteGroupModalProps) {
  const { user, reloadCategoriesAndGroups, groups, setActiveGroup } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  
  const groupNameUpper = group.title.toUpperCase();
  const isConfirmationValid = confirmationText === groupNameUpper;

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      return;
    }

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Excluir Grupo</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-gray-600 mb-2">
              Tem certeza que deseja excluir o grupo <span className="font-semibold text-gray-800">"{group.title}"</span>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Esta ação não pode ser desfeita. Todas as transações associadas a este grupo serão excluídas permanentemente.
            </p>
          </div>

          <div>
            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
              Digite <span className="font-bold text-gray-900">{groupNameUpper}</span> para confirmar:
            </label>
            <input
              type="text"
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900 uppercase"
              placeholder={groupNameUpper}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !isConfirmationValid}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Excluindo...' : 'Excluir Grupo'}
          </button>
        </div>
      </div>
    </div>
  );
}
