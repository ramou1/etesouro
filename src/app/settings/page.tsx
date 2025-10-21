'use client';

import { useState } from 'react';
import BottomTabs from "@/components/BottomTabs";
import Header from "@/components/Header";
import { useApp } from "@/context/AppContext";
import { 
  MOCK_GROUPS, 
  MOCK_INCOME_CATEGORIES, 
  MOCK_EXPENSE_CATEGORIES, 
  MOCK_PAYMENT_METHODS, 
  MOCK_BUDGET_LIMITS 
} from '@/data/mockData';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  DollarSign,
  CreditCard,
  Shield,
  Settings as SettingsIcon,
  Tag,
  Minus
} from 'lucide-react';

export default function SettingsPage() {
    const { user, logout } = useApp();
    const [activeTab, setActiveTab] = useState('groups');

    return (
        <div className="min-h-screen bg-gray-50 bg-gray-200 flex flex-col">
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="max-w-md mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>
                    
                    {/* Tabs Navigation */}
                    <div className="grid grid-cols-2 gap-1 mb-8 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('groups')}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'groups' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Users size={16} className="inline mr-2" />
                            Grupos
                        </button>
                        <button
                            onClick={() => setActiveTab('income')}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'income' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Plus size={16} className="inline mr-2" />
                            Entradas
                        </button>
                        <button
                            onClick={() => setActiveTab('expense')}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'expense' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <Minus size={16} className="inline mr-2" />
                            Saídas
                        </button>
                        <button
                            onClick={() => setActiveTab('limits')}
                            className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                activeTab === 'limits' 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            <SettingsIcon size={16} className="inline mr-2" />
                            Limites
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'groups' && <GroupsSection />}
                    {activeTab === 'income' && <IncomeCategoriesSection />}
                    {activeTab === 'expense' && <ExpenseCategoriesSection />}
                    {activeTab === 'payment' && <PaymentMethodsSection />}
                    {activeTab === 'limits' && <BudgetLimitsSection />}
                </div>
            </div>
            
            {/* Bottom Navigation */}
            <BottomTabs />
        </div>
    )
}

// Componente para seção de Grupos
function GroupsSection() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Grupos</h2>
                <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Plus size={16} />
                    Novo Grupo
                </button>
            </div>

            {MOCK_GROUPS.map(group => (
                <div key={group.id} className="bg-white rounded-2xl p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            <p className="text-sm text-gray-600">{group.members.length} integrantes</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Edit size={20} />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        {group.members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={member.avatar} 
                                        alt={member.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <span className="text-sm text-gray-700">{member.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    {member.isAdmin && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Admin</span>}
                                    {member.contributesIncome && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Renda</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Componente para seção de Categorias de Entrada
function IncomeCategoriesSection() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Categorias de Entrada</h2>
                <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={16} />
                    Nova Categoria
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {MOCK_INCOME_CATEGORIES.map(category => (
                    <div key={category.id} className="bg-white rounded-2xl py-4 px-2">
                        <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                                {category.name}
                            </span>
                            <div className="flex gap-1">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Edit size={16} />
                                </button>
                                <button className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para seção de Categorias de Saída
function ExpenseCategoriesSection() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Categorias de Saída</h2>
                <button className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors">
                    <Plus size={16} />
                    Nova Categoria
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {MOCK_EXPENSE_CATEGORIES.map(category => (
                    <div key={category.id} className="bg-white rounded-2xl py-4 px-2">
                        <div className="flex justify-between items-start">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}>
                                {category.name}
                            </span>
                            <div className="flex gap-1">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Edit size={16} />
                                </button>
                                <button className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para seção de Formas de Pagamento
function PaymentMethodsSection() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Formas de Pagamento</h2>
                <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                    <Plus size={16} />
                    Nova Forma
                </button>
            </div>

            <div className="space-y-3">
                {MOCK_PAYMENT_METHODS.map(method => (
                    <div key={method.id} className="bg-white rounded-2xl shadow-lg p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{method.icon}</span>
                                <span className="font-medium text-gray-800">{method.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <Edit size={16} />
                                </button>
                                <button className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Componente para seção de Limites de Orçamento
function BudgetLimitsSection() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Limites de Orçamento</h2>
                <button className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
                    <SettingsIcon size={16} />
                    Configurar
                </button>
            </div>

            <div className="space-y-3">
                {MOCK_BUDGET_LIMITS.map(limit => (
                    <div key={limit.id} className="bg-white rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-800">{limit.name}</h3>
                                <p className="text-sm text-gray-600">{limit.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${limit.color}`}>
                                {limit.percentage}%
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${limit.color.includes('red') ? 'bg-red-500' : 
                                    limit.color.includes('orange') ? 'bg-orange-500' :
                                    limit.color.includes('green') ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${limit.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Resumo dos Limites</h3>
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">100%</p>
                    <p className="text-sm text-gray-600">Total do orçamento distribuído</p>
                </div>
            </div>
        </div>
    );
}
