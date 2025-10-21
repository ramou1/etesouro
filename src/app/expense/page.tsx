'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import TransactionList from '@/components/TransactionList';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';

export default function ExpensePage() {
  const { financialData } = useApp();
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Filtrar apenas transações de saída (expense)
  const expenseTransactions = financialData.transactions.filter(
    (transaction: any) => transaction.type === 'expense'
  );

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-200 p-4 pb-32">
        
        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-2xl font-bold text-gray-800">Histórico de Despesas</h1>
        </div>

        {/* Transactions List */}
        <div className="mb-6">          
          {expenseTransactions.length > 0 ? (
            <TransactionList 
              transactions={expenseTransactions}
              onTransactionClick={handleTransactionClick}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma despesa cadastrada ainda.</p>
              <p className="text-sm mt-2">Adicione despesas através do dashboard principal!</p>
            </div>
          )}
        </div>
      </div>

      {/* Total Fixo na parte inferior */}
      <div className="fixed bottom-16 left-0 right-0 z-10">
        <div className="backdrop-blur-md rounded-t-2xl p-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total de Despesas</p>
            <div className="text-2xl font-bold text-red-600 mb-2">
              - {formatCurrency(financialData.totalExpenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomTabs />

      {/* Transaction Details Modal */}
      {showTransactionDetails && (
        <TransactionDetailsModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowTransactionDetails(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}
