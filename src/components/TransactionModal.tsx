'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES } from '@/data/mockData';

interface TransactionModalProps {
  type: 'income' | 'expense';
  onClose: () => void;
}

export default function TransactionModal({ type, onClose }: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { addTransaction } = useApp();

  // Obter categorias baseadas no tipo de transação
  const categories = type === 'income' ? MOCK_INCOME_CATEGORIES : MOCK_EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, insira um valor válido');
      setIsLoading(false);
      return;
    }

    try {
      addTransaction({
        amount: numericAmount,
        description: description || selectedCategory || (type === 'income' ? 'Receita' : 'Despesa'),
        type,
        date: new Date(),
        category: selectedCategory
      });
      
      setAmount('');
      setDescription('');
      setSelectedCategory('');
      onClose();
    } catch (error) {
      alert('Erro ao adicionar transação');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove tudo que não é dígito ou vírgula/ponto
    const cleaned = value.replace(/[^\d,.]/g, '');
    
    // Se há vírgula e ponto, mantém apenas o último
    const parts = cleaned.split(/[,.]/);
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedCategory === category.name
                      ? `${category.color} border-current`
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
              placeholder="Ex: Salário, Alimentação, etc."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !amount}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
