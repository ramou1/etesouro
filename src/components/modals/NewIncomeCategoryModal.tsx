'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { colors } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { saveCategory, updateCategory } from '@/lib/firebase/categories';
import { Category } from '@/types';

interface NewIncomeCategoryModalProps {
  onClose: () => void;
  category?: Category; // Se fornecido, modo edição
}

export default function NewIncomeCategoryModal({ onClose, category }: NewIncomeCategoryModalProps) {
  const { user, reloadCategoriesAndGroups } = useApp();
  const [title, setCategoryTitle] = useState(category?.title || '');
  const [color, setColor] = useState(category?.color || '');
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title) {
      alert('Nome da categoria é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      alert('Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      const selectedColor = color || '#6B7280'; // Cor padrão se nenhuma for selecionada
      
      let firestoreResult;
      if (isEditMode && category) {
        // Modo edição
        firestoreResult = await updateCategory(category.id, title, selectedColor, user.id);
      } else {
        // Modo criação
        firestoreResult = await saveCategory(title, selectedColor, 'income', user.id);
      }
      
      if (firestoreResult.success) {
        // Recarregar categorias do Firestore
        await reloadCategoriesAndGroups();
        onClose();
      } else {
        alert(firestoreResult.error || `Erro ao ${isEditMode ? 'atualizar' : 'criar'} a categoria`);
      }
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      alert('Erro ao criar a categoria. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditMode ? 'Editar Categoria de Entrada' : 'Nova Categoria de Entrada'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título da Categoria */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título da Categoria *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setCategoryTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-700"
              placeholder="Ex: Família, Viagem, Amigos..."
              maxLength={15}
              required
            />
          </div>

          {/* Seleção de Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((cor) => {
                // Garante que 'cor' é uma string antes de usar
                if (!cor) return null;
                const selecionada = color === cor;
                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => handleColorSelect(cor)}
                    className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${
                      selecionada 
                        ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: cor }}
                    aria-label={`Selecionar cor ${cor}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Categoria')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}