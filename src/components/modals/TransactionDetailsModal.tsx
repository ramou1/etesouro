'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, Calendar, User, DollarSign, ArrowUp, ArrowDown, LayoutList, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const { removeTransaction } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      <div className="bg-white rounded-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Detalhes da Transação
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

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
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Excluir Transação
              </button>
              <button
                onClick={onClose}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </>
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
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Excluindo...
                    </>
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
