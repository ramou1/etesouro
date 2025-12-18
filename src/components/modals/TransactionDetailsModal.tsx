'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, Calendar, User, DollarSign, ArrowUp, ArrowDown, LayoutList, Trash2, Edit2, Save } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const { removeTransaction, updateTransaction, activeGroup, incomeCategories, expenseCategories } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para edição
  const [editedAmount, setEditedAmount] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedResponsibleId, setEditedResponsibleId] = useState('');

  // Inicializar valores quando a transação mudar ou entrar em modo de edição
  useEffect(() => {
    if (transaction) {
      setEditedAmount(transaction.amount.toString().replace('.', ','));
      setEditedCategory(transaction.category || '');
      setEditedResponsibleId(transaction.responsible?.id || '');
    }
  }, [transaction, isEditing]);

  if (!transaction) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const handleSave = async () => {
    if (!transaction) return;

    setIsSaving(true);
    try {
      const numericAmount = parseFloat(editedAmount.replace(',', '.'));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert('Por favor, insira um valor válido');
        setIsSaving(false);
        return;
      }

      // Buscar o membro responsável baseado no ID
      const responsibleMember = activeGroup.members.find(member => member.id === editedResponsibleId);
      if (!responsibleMember) {
        alert('Por favor, selecione um responsável válido');
        setIsSaving(false);
        return;
      }

      await updateTransaction(transaction.id, {
        amount: numericAmount,
        category: editedCategory,
        responsible: responsibleMember,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      alert('Erro ao atualizar transação');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaurar valores originais
    if (transaction) {
      setEditedAmount(transaction.amount.toString().replace('.', ','));
      setEditedCategory(transaction.category || '');
      setEditedResponsibleId(transaction.responsible?.id || '');
    }
  };

  const categories = transaction.type === 'income' ? incomeCategories : expenseCategories;
  const members = activeGroup.members;

  const handleDelete = async () => {
    if (!transaction) return;
    
    setIsDeleting(true);
    try {
      await removeTransaction(transaction.id);
      onClose();
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar transação');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">
            {isEditing ? 'Editar Transação' : 'Detalhes da Transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
          {/* Tipo e Valor */}
          <div className="flex items-center justify-between py-4 px-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {transaction.type === 'income' ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUp className="text-green-600" size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowDown className="text-red-600" size={18} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800">{transaction.description}</p>

                {/* <p className="font-semibold text-gray-800">
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </p> */}
              </div>
            </div>
            <div className="text-right min-w-2/5">
              <p className={`font-bold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(formatAmount(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável
                  </label>
                  <div className="relative">
                    <select
                      value={editedResponsibleId}
                      onChange={(e) => setEditedResponsibleId(e.target.value)}
                      className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white appearance-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-gray-900"
                    >
                      <option value="">Selecione um responsável</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <div className="relative">
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="w-full p-3 rounded-lg border-2 border-gray-200 bg-white appearance-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-gray-900"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.title}>
                          {category.title}
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
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <LayoutList className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Categoria</p>
                    <p className="font-semibold text-gray-800">{transaction.category || 'Nenhuma'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="font-semibold text-gray-800">{transaction.responsible?.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className="font-semibold text-gray-800">{formatCurrency(transaction.amount)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Data de Criação</p>
                    <p className="font-semibold text-gray-800">{formatDate(transaction.date)}</p>
                  </div>
                </div>

                {transaction.updatedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Última Atualização</p>
                      <p className="font-semibold text-gray-800">{formatDate(transaction.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors hover:bg-gray-50 text-sm"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {isSaving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save size={18} />
                    Salvar
                  </>
                )}
              </button>
            </div>
          ) : !showDeleteConfirm ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 size={18} />
                Excluir
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Edit2 size={18} />
                Editar
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-red-800 font-medium mb-2">
                  Tem certeza que deseja excluir esta transação?
                </p>
                <p className="text-xs text-red-600">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors hover:bg-gray-50 text-sm"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {isDeleting ? (
                    'Excluindo...'
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Confirmar Exclusão
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
