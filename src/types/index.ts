export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  date: Date;
  groupId?: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface FinancialData {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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