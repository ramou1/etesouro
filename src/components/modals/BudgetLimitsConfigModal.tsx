'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BudgetLimit } from '@/types';
import { getGroupBudgetLimits, saveGroupBudgetLimits } from '@/lib/firebase/budgetLimits';

interface BudgetLimitsConfigModalProps {
  onClose: () => void;
}

const DEFAULT_LIMITS: Omit<BudgetLimit, 'id' | 'groupId' | 'categoryIds'>[] = [
  {
    name: 'Fixo/Mensal/Essencial',
    description: 'Gastos essenciais mensais (aluguel, alimentação básica, saúde)',
    percentage: 50,
    color: 'bg-red-100 text-red-600',
    type: 'essential'
  },
  {
    name: 'Fixo/Mensal',
    description: 'Gastos fixos mensais (internet, telefone, academia)',
    percentage: 30,
    color: 'bg-orange-100 text-orange-600',
    type: 'fixed'
  },
  {
    name: 'Reserva Financeira',
    description: 'Para emergências e investimentos',
    percentage: 20,
    color: 'bg-green-100 text-green-600',
    type: 'reserve'
  },
  {
    name: 'Esporádico',
    description: 'Gastos ocasionais e lazer',
    percentage: 10,
    color: 'bg-blue-100 text-blue-600',
    type: 'sporadic'
  },
  {
    name: 'Sem Categoria',
    description: 'Despesas sem categoria escolhida',
    percentage: 0,
    color: 'bg-gray-100 text-gray-600',
    type: 'uncategorized'
  }
];

export default function BudgetLimitsConfigModal({ onClose }: BudgetLimitsConfigModalProps) {
  const { groups, expenseCategories, activeGroup, user } = useApp();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(activeGroup?.id || '');
  const [limits, setLimits] = useState<Record<string, Omit<BudgetLimit, 'id' | 'groupId'>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Carregar limites salvos quando um grupo é selecionado
  useEffect(() => {
    const loadLimits = async () => {
      if (!selectedGroupId || !user?.id) {
        // Se não há grupo selecionado, inicializar com valores padrão
        const initialLimits: Record<string, Omit<BudgetLimit, 'id' | 'groupId'>> = {};
        DEFAULT_LIMITS.forEach(limit => {
          initialLimits[limit.type] = {
            ...limit,
            categoryIds: []
          };
        });
        setLimits(initialLimits);
        return;
      }

      try {
        const result = await getGroupBudgetLimits(selectedGroupId, user.id);
        if (result.success && result.data) {
          // Converter array de limites para objeto indexado por type
          const limitsMap: Record<string, Omit<BudgetLimit, 'id' | 'groupId'>> = {};
          result.data.forEach(limit => {
            limitsMap[limit.type] = {
              name: limit.name,
              description: limit.description,
              percentage: limit.percentage,
              color: limit.color,
              type: limit.type,
              categoryIds: limit.categoryIds || []
            };
          });
          
          // Preencher com valores padrão se algum limite não existir
          DEFAULT_LIMITS.forEach(defaultLimit => {
            if (!limitsMap[defaultLimit.type]) {
              limitsMap[defaultLimit.type] = {
                ...defaultLimit,
                categoryIds: []
              };
            }
          });
          
          setLimits(limitsMap);
        } else {
          // Se não houver limites salvos, usar valores padrão
          const initialLimits: Record<string, Omit<BudgetLimit, 'id' | 'groupId'>> = {};
          DEFAULT_LIMITS.forEach(limit => {
            initialLimits[limit.type] = {
              ...limit,
              categoryIds: []
            };
          });
          setLimits(initialLimits);
        }
      } catch (error) {
        console.error('Erro ao carregar limites:', error);
        // Em caso de erro, usar valores padrão
        const initialLimits: Record<string, Omit<BudgetLimit, 'id' | 'groupId'>> = {};
        DEFAULT_LIMITS.forEach(limit => {
          initialLimits[limit.type] = {
            ...limit,
            categoryIds: []
          };
        });
        setLimits(initialLimits);
      }
    };

    loadLimits();
  }, [selectedGroupId, user?.id]);

  const handlePercentageChange = (type: BudgetLimit['type'], value: number) => {
    setLimits(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        percentage: Math.max(0, Math.min(100, value))
      }
    }));
  };

  const toggleCategory = (limitType: BudgetLimit['type'], categoryId: string) => {
    setLimits(prev => {
      const currentLimit = prev[limitType];
      if (!currentLimit) return prev;

      const categoryIds = currentLimit.categoryIds || [];
      const isSelected = categoryIds.includes(categoryId);
      
      // Remover categoria de outros limites primeiro
      const updatedLimits = { ...prev };
      Object.keys(updatedLimits).forEach(key => {
        if (key !== limitType && updatedLimits[key as BudgetLimit['type']]) {
          updatedLimits[key as BudgetLimit['type']] = {
            ...updatedLimits[key as BudgetLimit['type']],
            categoryIds: (updatedLimits[key as BudgetLimit['type']].categoryIds || []).filter(id => id !== categoryId)
          };
        }
      });

      return {
        ...updatedLimits,
        [limitType]: {
          ...currentLimit,
          categoryIds: isSelected
            ? categoryIds.filter(id => id !== categoryId)
            : [...categoryIds, categoryId]
        }
      };
    });
  };

  const handleSave = async () => {
    if (!selectedGroupId || !user?.id) {
      alert('Por favor, selecione um grupo');
      return;
    }

    setIsLoading(true);
    try {
      // Converter objeto de limites para array
      const limitsArray: Omit<BudgetLimit, 'id' | 'groupId'>[] = Object.values(limits);
      
      const result = await saveGroupBudgetLimits(selectedGroupId, user.id, limitsArray);
      
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar limites:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPercentage = Object.values(limits).reduce((sum, limit) => sum + (limit.percentage || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Configurar Limites de Orçamento
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seleção de Grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grupo
            </label>
            <div className="relative">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white appearance-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-gray-900"
              >
                <option value="">Selecione um grupo</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {selectedGroupId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Configuração dos Limites</h3>
              {DEFAULT_LIMITS.map(limit => (
                <div key={limit.type} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{limit.name}</h4>
                      <p className="text-sm text-gray-600">{limit.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={limits[limit.type]?.percentage || limit.percentage}
                        onChange={(e) => handlePercentageChange(limit.type, parseInt(e.target.value) || 0)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-gray-900 text-right"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                  </div>
                  
                  {/* Categorias (apenas para limites que não são "Sem Categoria") */}
                  {limit.type !== 'uncategorized' && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Categorias:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {expenseCategories.map(category => {
                          const isSelected = limits[limit.type]?.categoryIds?.includes(category.id) || false;
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => toggleCategory(limit.type, category.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {category.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Total:</strong> {totalPercentage}%
                  {totalPercentage !== 100 && (
                    <span className="ml-2 text-yellow-600">
                      ({totalPercentage < 100 ? 'Faltam' : 'Excedem'} {Math.abs(100 - totalPercentage)}%)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !selectedGroupId}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}

