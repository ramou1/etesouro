export type PlanPeriod = 'monthly' | 'semiannual' | 'annual';

/** Tipo de conta: usuário comum ou administrador (telas diferentes) */
export type UserType = 'user' | 'admin';

export interface UserPlan {
  period: PlanPeriod;
  purchaseDate?: string; // Data de compra no formato ISO (YYYY-MM-DD)
  expirationDate?: string; // Data de expiração no formato ISO (YYYY-MM-DD)
  isActive?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAuthenticated: boolean;
  /** Tipo da conta: 'user' (padrão) ou 'admin' - define qual tela exibir após login */
  type?: UserType;
  plan?: UserPlan;
  pinnedGroupId?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  groupId?: string;
  userId: string;
  receipt?: string; 
  responsible: GroupMember;
  updatedAt?: Date;
}

export interface FinancialData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface Group {
  id: string;
  title: string;
  description?: string;
  members: GroupMember[];
  isTemporary: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  contributesIncome: boolean;
  groupId?: string;
}

export interface Category {
  id: string;
  title: string;
  color: string;
  icon?: string;
  type: string;
}

export interface BudgetLimit {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  type: 'essential' | 'fixed' | 'reserve' | 'sporadic' | 'uncategorized';
  groupId?: string;
  categoryIds?: string[]; // IDs das categorias de saída associadas a este limite
}