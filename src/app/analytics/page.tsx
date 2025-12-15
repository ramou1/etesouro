'use client';

import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import Header from '@/components/ui/Header';
import FloatingMenu from '@/components/ui/FloatingMenu';
import { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function AnalyticsPage() {
  const { financialData } = useApp();

  // Calcular estatísticas básicas
  const totalTransactions = financialData.transactions.length;
  const incomeCount = financialData.transactions.filter((t: Transaction) => t.type === 'income').length;
  const expenseCount = financialData.transactions.filter((t: Transaction) => t.type === 'expense').length;
  
  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Receitas', value: financialData.totalIncome, color: '#16a34a' },
    { name: 'Despesas', value: financialData.totalExpenses, color: '#dc2626' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content - Scrollable */}
      {/* bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 */}
      <div className="flex-1 overflow-y-auto bg-gray-200 p-4 pb-32">
        <div className="max-w-md md:max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center my-6">
            <h1 className="text-2xl font-semibold text-gray-800">Relatórios</h1>
            <p className="text-sm text-gray-800 text-opacity-90">Análise dos seus dados financeiros</p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="space-y-4 mb-6">
          
          {/* Saldo Atual */}
          <div className="bg-white/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Saldo Atual</p>
                <p className={`text-2xl font-bold ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financialData.balance >= 0 ? '+' : ''} {formatCurrency(financialData.balance)}
                </p>
              </div>
              <DollarSign size={32} className="text-yellow-600" />
            </div>
          </div>

          {/* Receitas vs Despesas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} className="text-green-600" />
                <span className="text-green-600 font-semibold">+ {formatCurrency(financialData.totalIncome)}</span>
              </div>
              <p className="text-gray-600 text-sm">Total Receitas</p>
              <p className="text-gray-800 font-medium">{incomeCount} transações</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingDown size={24} className="text-red-600" />
                <span className="text-red-600 font-semibold">- {formatCurrency(financialData.totalExpenses)}</span>
              </div>
              <p className="text-gray-600 text-sm">Total Despesas</p>
              <p className="text-gray-800 font-medium">{expenseCount} transações</p>
            </div>
          </div>

          {/* Gráfico de Pizza - Receitas vs Despesas */}
          <div className="bg-white/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Receitas vs Despesas
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => {
                    const item = pieData.find(d => d.name === value);
                    return `${value}: ${formatCurrency(item?.value || 0)}`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Resumo Geral */}
          <div className="bg-white/50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Calendar size={24} className="text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">Resumo Geral</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Transações</span>
                <span className="font-semibold text-gray-800">{totalTransactions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Receitas</span>
                <span className="font-semibold text-green-600">{incomeCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Despesas</span>
                <span className="font-semibold text-red-600">{expenseCount}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Saldo Final</span>
                  <span className={`font-bold text-lg ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {financialData.balance >= 0 ? '+' : ''} {formatCurrency(financialData.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de Motivação */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {financialData.balance >= 0 ? '🎉 Parabéns!' : '💪 Continue focado!'}
            </h3>
            <p className="text-gray-600">
              {financialData.balance >= 0 
                ? 'Você está com saldo positivo! Continue controlando seus gastos.'
                : 'Você está no vermelho, mas com controle pode reverter isso!'
              }
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Floating Menu */}
      <FloatingMenu />
    </div>
  );
}
