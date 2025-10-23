'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, Calendar, User, DollarSign, ArrowUp, ArrowDown, LayoutList } from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
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
                <p className="font-semibold text-gray-800">{transaction.category}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-500">Responsável</p>
                <p className="font-semibold text-gray-800">Fulano da Silva</p>
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

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
