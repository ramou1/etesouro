// Arquivo centralizado com todos os dados mockados do usuário
// Facilita a manutenção e estruturação do banco de dados

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  contributesIncome: boolean;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: 'income' | 'expense';
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface BudgetLimit {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  type: 'essential' | 'fixed' | 'reserve' | 'sporadic';
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  date: string;
  groupId?: string;
  userId: string;
}

export interface FinancialData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

// DADOS MOCKADOS CENTRALIZADOS
export const MOCK_USER: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  isAuthenticated: true
};

export const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Família',
    description: 'Grupo familiar principal',
    isActive: true,
    members: [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '1'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '1'
      },
      {
        id: '3',
        name: 'Pedro Silva',
        email: 'pedro.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: false,
        groupId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Viagem',
    description: 'Grupo para viagem de férias',
    isActive: true,
    members: [
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '2'
      },
      {
        id: '5',
        name: 'Carlos Lima',
        email: 'carlos.lima@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '2'
      }
    ]
  }
];

export const MOCK_INCOME_CATEGORIES: Category[] = [
  { id: '1', name: 'Salário', color: 'bg-green-100 text-green-600', type: 'income' },
  { id: '2', name: 'Freelance', color: 'bg-blue-100 text-blue-600', type: 'income' },
  { id: '3', name: 'Investimentos', color: 'bg-purple-100 text-purple-600', type: 'income' },
  { id: '4', name: 'Vendas', color: 'bg-orange-100 text-orange-600', type: 'income' },
  { id: '5', name: 'Bônus', color: 'bg-yellow-100 text-yellow-600', type: 'income' },
  { id: '6', name: 'Outros', color: 'bg-gray-100 text-gray-600', type: 'income' }
];

export const MOCK_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', color: 'bg-red-100 text-red-600', type: 'expense' },
  { id: '2', name: 'Transporte', color: 'bg-blue-100 text-blue-600', type: 'expense' },
  { id: '3', name: 'Saúde', color: 'bg-green-100 text-green-600', type: 'expense' },
  { id: '4', name: 'Lazer', color: 'bg-purple-100 text-purple-600', type: 'expense' },
  { id: '5', name: 'Educação', color: 'bg-yellow-100 text-yellow-600', type: 'expense' },
  { id: '6', name: 'Moradia', color: 'bg-gray-100 text-gray-600', type: 'expense' },
  { id: '7', name: 'Roupas', color: 'bg-pink-100 text-pink-600', type: 'expense' },
  { id: '8', name: 'Tecnologia', color: 'bg-indigo-100 text-indigo-600', type: 'expense' }
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'Dinheiro', icon: '💵', isActive: true },
  { id: '2', name: 'Cartão de Débito', icon: '💳', isActive: true },
  { id: '3', name: 'Cartão de Crédito', icon: '💳', isActive: true },
  { id: '4', name: 'PIX', icon: '📱', isActive: true },
  { id: '5', name: 'Transferência', icon: '🏦', isActive: true },
  { id: '6', name: 'Boleto', icon: '📄', isActive: true }
];

export const MOCK_BUDGET_LIMITS: BudgetLimit[] = [
  {
    id: '1',
    name: 'Fixo/Mensal/Essencial',
    description: 'Gastos essenciais mensais (aluguel, alimentação básica, saúde)',
    percentage: 50,
    color: 'bg-red-100 text-red-600',
    type: 'essential'
  },
  {
    id: '2',
    name: 'Fixo/Mensal',
    description: 'Gastos fixos mensais (internet, telefone, academia)',
    percentage: 30,
    color: 'bg-orange-100 text-orange-600',
    type: 'fixed'
  },
  {
    id: '3',
    name: 'Reserva Financeira',
    description: 'Para emergências e investimentos',
    percentage: 20,
    color: 'bg-green-100 text-green-600',
    type: 'reserve'
  },
  {
    id: '4',
    name: 'Esporádico',
    description: 'Gastos ocasionais e lazer',
    percentage: 10,
    color: 'bg-blue-100 text-blue-600',
    type: 'sporadic'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    description: 'Salário mensal',
    category: 'Salário',
    paymentMethod: 'Transferência',
    date: new Date('2024-01-15'),
    userId: '1'
  },
  {
    id: '2',
    type: 'income',
    amount: 1200,
    description: 'Freelance desenvolvimento',
    category: 'Freelance',
    paymentMethod: 'PIX',
    date: new Date('2024-01-20'),
    userId: '1'
  },
  {
    id: '3',
    type: 'expense',
    amount: 800,
    description: 'Supermercado',
    category: 'Alimentação',
    paymentMethod: 'Cartão de Débito',
    date: new Date('2024-01-18'),
    userId: '1'
  },
  {
    id: '4',
    type: 'expense',
    amount: 1200,
    description: 'Aluguel',
    category: 'Moradia',
    paymentMethod: 'Transferência',
    date: new Date('2024-01-05'),
    userId: '1'
  },
  {
    id: '5',
    type: 'expense',
    amount: 300,
    description: 'Combustível',
    category: 'Transporte',
    paymentMethod: 'Cartão de Crédito',
    date: new Date('2024-01-22'),
    userId: '1'
  },
  {
    id: '6',
    type: 'income',
    amount: 500,
    description: 'Dividendos',
    category: 'Investimentos',
    paymentMethod: 'Transferência',
    date: new Date('2024-01-25'),
    userId: '1'
  },
  {
    id: '7',
    type: 'expense',
    amount: 150,
    description: 'Cinema',
    category: 'Lazer',
    paymentMethod: 'Cartão de Crédito',
    date: new Date('2024-01-23'),
    userId: '1'
  },
  {
    id: '8',
    type: 'expense',
    amount: 200,
    description: 'Farmácia',
    category: 'Saúde',
    paymentMethod: 'Dinheiro',
    date: new Date('2024-01-21'),
    userId: '1'
  }
];

export const MOCK_FINANCIAL_DATA: FinancialData = {
  transactions: MOCK_TRANSACTIONS,
  totalIncome: MOCK_TRANSACTIONS
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0),
  totalExpenses: MOCK_TRANSACTIONS
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0),
  balance: MOCK_TRANSACTIONS
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) - 
    MOCK_TRANSACTIONS
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
};

// Função para obter membros da família (para o dashboard)
export const getFamilyMembers = () => {
  const familyGroup = MOCK_GROUPS.find(group => group.name === 'Família');
  return familyGroup ? familyGroup.members : [];
};

// Função para obter todas as categorias
export const getAllCategories = () => {
  return [...MOCK_INCOME_CATEGORIES, ...MOCK_EXPENSE_CATEGORIES];
};

// Função para obter transações por tipo
export const getTransactionsByType = (type: 'income' | 'expense') => {
  return MOCK_TRANSACTIONS.filter(transaction => transaction.type === type);
};
