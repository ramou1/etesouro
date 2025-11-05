'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { MOCK_INCOME_CATEGORIES } from '@/data/mockData';

interface NewIncomeCategoryModalProps {
  onClose: () => void;
}

export default function NewIncomeCategoryModal({ onClose }: NewIncomeCategoryModalProps) {
  const [title, setCategoryTitle] = useState('');
  const [color, setGroupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!title) {
      alert('Nome da categoria é obrigatório');
      setIsLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a lógica para criar a categoria
      const data = {
        id: '',
        title: title,
        color: color,
        type: "income"
      };

      console.log(data);
      MOCK_INCOME_CATEGORIES.push(data);
      onClose();
    } catch {
      // Removemos o 'error' não utilizado
      // alert('Erro ao criar a categoria');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Nova Categoria de Entrada</h2>
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

          {/* Descrição */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              id="color"
              value={color}
              onChange={(e) => setGroupDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none text-gray-700"
              placeholder="Descreva o propósito desta categoria..."
              rows={3}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando...' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}