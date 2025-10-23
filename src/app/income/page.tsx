'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import Header from '@/components/Header';
import BottomTabs from '@/components/BottomTabs';
import TransactionList from '@/components/TransactionList';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';

export default function IncomePage() {
  const { financialData } = useApp();
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Filtrar apenas transações de entrada (income)
  const incomeTransactions = financialData.transactions.filter(
    (transaction: any) => transaction.type === 'income'
  );

  const handleTransactionClick = (transaction: any) => {
    console.log(transaction)
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
          <h1 className="text-2xl font-semibold text-gray-800">Histórico de Receitas</h1>
        </div>

        {/* Transactions List */}
        <div className="mb-6">          
          {incomeTransactions.length > 0 ? (
            <TransactionList 
              transactions={incomeTransactions}
              onTransactionClick={handleTransactionClick}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p>Nenhuma receita cadastrada ainda.</p>
              <p className="text-sm mt-2">Adicione receitas através do dashboard principal!</p>
            </div>
          )}
        </div>
      </div>

      {/* Total Fixo na parte inferior */}
      <div className="fixed bottom-16 left-0 right-0 z-10">
        <div className="backdrop-blur-md rounded-t-2xl p-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total de Receitas</p>
            <div className="text-2xl font-bold text-green-600 mb-2">
              + {formatCurrency(financialData.totalIncome)}
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