'use client';

import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  return (
    //max-h-96
    <div className="space-y-2 overflow-y-auto"> 
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          onClick={() => onTransactionClick(transaction)}
          className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-white/30 transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            {transaction.type === 'income' ? (
              <div className="relative">
                <Avatar 
                  name={transaction.responsible?.name || 'Usuário'}
                  size={32}
                />
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <ArrowUp className="text-white" size={10} />
                </div>
              </div>
            ) : (
              <div className="relative">
                <Avatar 
                  name={transaction.responsible?.name || 'Usuário'}
                  size={32}
                />
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <ArrowDown className="text-white" size={10} />
                </div>
              </div>
            )}
            <div>
              <p className="text-gray-800 text-sm">{transaction.description}</p>
              <div className="flex items-center space-x-1 text-gray-800/70 text-xs">
                <Calendar size={12} />
                <span>{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold text-sm ${
              transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
            }`}>
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </p>
            {transaction.category && transaction.category.trim() !== '' && (
              <p className="bg-gray-300 text-gray-800 text-xs mt-1 px-3 py-1 rounded-full text-center">
                {transaction.category}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
