export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  groupId?: string;
  userId: string;
  receipt?: string; // URL ou caminho do comprovante
  responsible: GroupMember;
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
  groupId?: string;
}

export interface Group {
  id: string;
  title: string;
  description?: string;
  members: GroupMember[];
  isTemporary: boolean;
}

export interface Category {
  id: string;
  title: string;
  color: string;
  icon?: string;
  // type: 'income' | 'expense';
  type: string;
}

export interface BudgetLimit {
  id: string;
  name: string;
  description: string;
  percentage: number;
  color: string;
  type: 'essential' | 'fixed' | 'reserve' | 'sporadic';
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