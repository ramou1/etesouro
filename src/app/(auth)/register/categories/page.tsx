'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import { MOCK_INCOME_CATEGORIES, MOCK_EXPENSE_CATEGORIES } from '@/data/mockData';
import { Category } from '@/types';
import { saveMultipleCategories } from '@/lib/firebase/categories';

export default function SelectCategoriesPage() {
  const router = useRouter();
  const { user, reloadCategoriesAndGroups } = useApp();
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<string[]>([]);
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push('/register');
    }
  }, [user, router]);

  const toggleIncomeCategory = (categoryId: string) => {
    setSelectedIncomeCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleExpenseCategory = (categoryId: string) => {
    setSelectedExpenseCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFinish = async () => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Combinar todas as categorias disponíveis
      const allIncomeCategories = MOCK_INCOME_CATEGORIES;
      const allExpenseCategories = MOCK_EXPENSE_CATEGORIES;

      // Preparar categorias para salvar
      const categoriesToSave: Array<{ title: string; color: string; type: 'income' | 'expense' }> = [];

      // Adicionar categorias de entrada selecionadas
      selectedIncomeCategories.forEach(categoryId => {
        const category = allIncomeCategories.find(c => c.id === categoryId);
        if (category) {
          categoriesToSave.push({
            title: category.title,
            color: category.color,
            type: 'income'
          });
        }
      });

      // Adicionar categorias de saída selecionadas
      selectedExpenseCategories.forEach(categoryId => {
        const category = allExpenseCategories.find(c => c.id === categoryId);
        if (category) {
          categoriesToSave.push({
            title: category.title,
            color: category.color,
            type: 'expense'
          });
        }
      });

      // Salvar todas as categorias de uma vez
      const result = await saveMultipleCategories(categoriesToSave, user.id);
      
      if (!result.success) {
        setError(result.error || 'Erro ao salvar categorias. Tente novamente.');
        setIsLoading(false);
        return;
      }

      // Recarregar categorias e redirecionar
      await reloadCategoriesAndGroups();
      router.push('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar categorias:', err);
      setError('Erro ao salvar categorias. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (!user?.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo01.png"
              alt="eTE$OURO Logo"
              width={160}
              height={50}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-sm text-gray-600">
            Selecione suas categorias padrão
          </h2>
        </div>

        {/* Categorias de Entrada */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-green-600 font-bold">+</span> Categorias de Entrada
          </h3>
          <div className="flex flex-wrap gap-2">
            {MOCK_INCOME_CATEGORIES.map((category) => {
              const isSelected = selectedIncomeCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleIncomeCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categorias de Saída */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-red-600 font-bold">-</span> Categorias de Saída
          </h3>
          <div className="flex flex-wrap gap-2">
            {MOCK_EXPENSE_CATEGORIES.map((category) => {
              const isSelected = selectedExpenseCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleExpenseCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-yellow-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
          >
            Pular esta etapa
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={isLoading || (selectedIncomeCategories.length === 0 && selectedExpenseCategories.length === 0)}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Salvando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  );
}

