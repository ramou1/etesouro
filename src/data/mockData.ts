import { BudgetLimit, Category, FinancialData, Group, GroupMember, PaymentMethod, Transaction, User } from "@/types";

// Paleta de cores 
export const colors = [,
  '#FFD6E7',
  '#FFE4E1',
  '#F3E8FF',
  '#DBEAFE',
  '#D4F0F0',
  '#DBFCE7',
  '#E2F0CB',
  '#FEF9C2',  
];

// DADOS MOCKADOS CENTRALIZADOS
export const MOCK_USER: User = {
  id: '1',
  name: 'João Silva',
  email: 'admin@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  isAuthenticated: true
};

export const MOCK_MEMBERS: GroupMember[] = [
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    isAdmin: false,
    contributesIncome: true,
    groupId: '',
  },
  {
    id: '3',
    name: 'Pedro Silva',
    email: 'pedro.silva@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isAdmin: false,
    contributesIncome: false,
    groupId: '',
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isAdmin: false,
    contributesIncome: true,
    groupId: '',
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    title: 'Família',
    description: 'Grupo familiar principal',
    isTemporary: false,
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
    title: 'Viagem',
    description: 'Grupo para viagem de férias',
    isTemporary: false,
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
  { id: '1', title: 'Salário', color: '#DBFCE7', type: 'income' }, 
  { id: '2', title: 'Freelance', color: '#DBEAFE', type: 'income' }, 
  { id: '3', title: 'Investimentos', color: '#F3E8FF', type: 'income' }, 
  { id: '4', title: 'Vendas', color: '#FFE4E1', type: 'income' }, 
  { id: '5', title: 'Bônus', color: '#FEF9C2', type: 'income' }, 
  { id: '6', title: 'Outros', color: '#f3f4f6', type: 'income' } 
];

export const MOCK_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', title: 'Alimentação', color: '#FFE4E1', type: 'expense' },
  { id: '2', title: 'Transporte', color: '#DBEAFE', type: 'expense' },
  { id: '3', title: 'Saúde', color: '#DBFCE7', type: 'expense' },
  { id: '4', title: 'Lazer', color: '#F3E8FF', type: 'expense' },
  { id: '5', title: 'Educação', color: '#FEF9C2', type: 'expense' },
  { id: '6', title: 'Moradia', color: '#D4F0F0', type: 'expense' },
  { id: '7', title: 'Roupas', color: '#FFD6E7', type: 'expense' }
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

// Transações organizadas por grupo
export const MOCK_TRANSACTIONS_BY_GROUP: Record<string, Transaction[]> = {
  '1': [ // Grupo Família
    // Transações de João Silva
    {
      id: '1',
      type: 'income',
      amount: 5000,
      description: 'Salário mensal',
      category: 'Salário',
      date: new Date('2024-01-15'),
      userId: '1',
      groupId: '1',
      receipt: '/receipts/salario-janeiro.pdf',
      responsible: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '1'
      }
    },
    {
      id: '2',
      type: 'income',
      amount: 1200,
      description: 'Freelance desenvolvimento',
      category: 'Freelance',
      date: new Date('2024-01-20'),
      userId: '1',
      groupId: '1',
      responsible: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '1'
      }
    },
    {
      id: '3',
      type: 'expense',
      amount: 800,
      description: 'Supermercado',
      category: 'Alimentação',
      date: new Date('2024-01-18'),
      userId: '1',
      groupId: '1',
      responsible: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '1'
      }
    },
    {
      id: '4',
      type: 'expense',
      amount: 1200,
      description: 'Aluguel',
      category: 'Moradia',
      date: new Date('2024-01-05'),
      userId: '1',
      groupId: '1',
      receipt: '/receipts/supermercado-18-01.jpg',
      responsible: {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '1'
      }
    },

    // Transações de Maria Santos
    {
      id: '5',
      type: 'income',
      amount: 4500,
      description: 'Salário mensal',
      category: 'Salário',
      date: new Date('2024-01-15'),
      userId: '2',
      groupId: '1',
      receipt: '/receipts/aluguel-janeiro.pdf',
      responsible: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '1'
      }
    },
    {
      id: '6',
      type: 'expense',
      amount: 600,
      description: 'Supermercado',
      category: 'Alimentação',
      date: new Date('2024-01-17'),
      userId: '2',
      groupId: '1',
      responsible: {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '1'
      }
    },

    // Transações de Pedro Silva
    {
      id: '7',
      type: 'expense',
      amount: 250,
      description: 'Materiais escolares',
      category: 'Educação',
      date: new Date('2024-01-10'),
      userId: '3',
      groupId: '1',
      receipt: '/receipts/aluguel-janeiro.pdf',
      responsible: {
        id: '3',
        name: 'Pedro Silva',
        email: 'pedro.silva@email.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: false,
        groupId: '1'
      }
    }
  ],
  '2': [ // Grupo Viagem
    // Transações de Ana Costa
    {
      id: '8',
      type: 'income',
      amount: 2000,
      description: 'Contribuição viagem',
      category: 'Economias',
      date: new Date('2024-01-10'),
      userId: '4',
      groupId: '2',
      responsible: {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '2'
      }
    },
    {
      id: '9',
      type: 'expense',
      amount: 800,
      description: 'Reserva hotel',
      category: 'Hospedagem',
      date: new Date('2024-01-12'),
      userId: '4',
      groupId: '2',
      responsible: {
        id: '4',
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isAdmin: true,
        contributesIncome: true,
        groupId: '2'
      }
    },

    // Transações de Carlos Lima
    {
      id: '10',
      type: 'income',
      amount: 1500,
      description: 'Contribuição viagem',
      category: 'Economias',
      date: new Date('2024-01-08'),
      userId: '5',
      groupId: '2',
      responsible: {
        id: '5',
        name: 'Carlos Lima',
        email: 'carlos.lima@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '2'
      }
    },
    {
      id: '11',
      type: 'expense',
      amount: 500,
      description: 'Passagens aéreas',
      category: 'Transporte',
      date: new Date('2024-01-15'),
      userId: '5',
      groupId: '2',
      responsible: {
        id: '5',
        name: 'Carlos Lima',
        email: 'carlos.lima@email.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        isAdmin: false,
        contributesIncome: true,
        groupId: '2'
      }
    }
  ]
};

// Função para obter todas as transações (para compatibilidade)
export const MOCK_TRANSACTIONS: Transaction[] = Object.values(MOCK_TRANSACTIONS_BY_GROUP).flat();

// Função para obter transações por grupo
export const getTransactionsByGroup = (groupId: string): Transaction[] => {
  return MOCK_TRANSACTIONS_BY_GROUP[groupId] || [];
};

// Função para obter dados financeiros por grupo
export const getFinancialDataByGroup = (groupId: string): FinancialData => {
  const transactions = getTransactionsByGroup(groupId);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
};

// Dados financeiros iniciais (usando o grupo família como padrão)
export const MOCK_FINANCIAL_DATA: FinancialData = getFinancialDataByGroup('1');

// Função para obter membros do grupo ativo
export const getActiveGroupMembers = (groupId: string) => {
  const group = MOCK_GROUPS.find(group => group.id === groupId);
  return group ? group.members : [];
};

// Função para obter todas as categorias
export const getAllCategories = () => {
  return [...MOCK_INCOME_CATEGORIES, ...MOCK_EXPENSE_CATEGORIES];
};

// Função para obter transações por tipo
export const getTransactionsByType = (type: 'income' | 'expense', groupId?: string) => {
  const transactions = groupId ? getTransactionsByGroup(groupId) : MOCK_TRANSACTIONS;
  return transactions.filter(transaction => transaction.type === type);
};

// Função para obter membros da família (mantida para compatibilidade)
export const getFamilyMembers = () => {
  const familyGroup = MOCK_GROUPS.find(group => group.title === 'Família');
  return familyGroup ? familyGroup.members : [];
};