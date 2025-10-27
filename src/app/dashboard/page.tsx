'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TransactionModal from '@/components/TransactionModal';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import Header from '@/components/Header';
import Participants from '@/components/Participants';
import BottomTabs from '@/components/BottomTabs';
import { MOCK_GROUPS } from '@/data/mockData';
import { Transaction } from '@/types';

export default function DashboardPage() {
  const { getFilteredFinancialData } = useApp();
  const router = useRouter();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('M');

  // Usar os dados filtrados
  const filteredFinancialData = getFilteredFinancialData();

  // Buscar o grupo ativo dos dados mockados
  const activeGroup = MOCK_GROUPS.find(group => group.isActive) || MOCK_GROUPS[0];

  const handleAddTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleIncomeClick = () => {
    router.push('/income');
  };

  const handleExpenseClick = () => {
    router.push('/expense');
  };

  // Função para formatar a data atual
  const getCurrentDateRange = () => {
    const now = new Date();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[now.getMonth()];
  };

  const periods = [
    { label: 'D', value: 'D' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'A', value: 'A' },
    { label: 'T', value: 'T' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Ocupa toda a altura restante */}
      <div className="flex-1 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-4 pb-32">

        {/* Botões de Período */}
        <div className="flex justify-center items-center gap-2 mb-4">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                selectedPeriod === period.value
                  ? 'bg-black text-white scale-110'
                  : 'bg-black text-yellow-600 opacity-70 hover:opacity-100'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Nome do Mês Atual */}
        <div className="flex justify-center items-center mb-6">
          <h3 className="text-lg font-bold text-black">{getCurrentDateRange()}</h3>
        </div>

        {/* Nome do Grupo Ativo */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-black font-medium text-sm">{activeGroup.name}</span>
          </div>
        </div>

        {/* Income and Expense Columns - Centralizados */}
        <div className="flex justify-center items-center mb-8 h-96">
          {/* Income Column */}
          <div className="flex-1 text-center max-w-xs">
            <div 
              className="text-black text-xl mb-6 cursor-pointer hover:text-green-600 transition-colors"
              onClick={handleIncomeClick}
            >
              + {formatCurrency(filteredFinancialData.totalIncome)}
            </div>
            <button
              onClick={() => handleAddTransaction('income')}
              className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold hover:bg-gray-800 transition-colors mx-auto"
            >
              <Plus size={32} />
            </button>
          </div>

          {/* Divider - Linha mais alta */}
          <div className="w-px h-full bg-black mx-8"></div>

          {/* Expense Column */}
          <div className="flex-1 text-center max-w-xs">
            <div 
              className="text-black text-xl mb-6 cursor-pointer hover:text-red-600 transition-colors"
              onClick={handleExpenseClick}
            >
              - {formatCurrency(filteredFinancialData.totalExpenses)}
            </div>
            <button
              onClick={() => handleAddTransaction('expense')}
              className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold hover:bg-gray-800 transition-colors mx-auto"
            >
              <Minus size={32} />
            </button>
          </div>
        </div>
      </div>

      {/* Total Fixo na parte inferior */}
      <div className="fixed bottom-32 left-0 right-0 z-10">
        <div className="backdrop-blur-md mx-4 rounded-t-2xl p-4">
          <div className={`text-2xl font-bold text-black text-center`}>
            {filteredFinancialData.balance >= 0 ? '+' : ''} {formatCurrency(filteredFinancialData.balance)}
          </div>
        </div>
      </div>

      {/* Avatars Section - Fixo acima do menu de navegação */}
      <Participants />

      {/* Bottom Navigation */}
      <BottomTabs />

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          type={transactionType}
          onClose={() => setShowTransactionModal(false)}
        />
      )}

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