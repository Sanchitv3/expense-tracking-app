export interface Expense {
  id: number;
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  original_input: string;
  created_at: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface ExpenseResponse {
  success: boolean;
  expense?: Expense;
  expenses?: Expense[];
  totalSpends?: number;
  totalCount?: number;
  breakdown?: CategoryBreakdown[];
  error?: string;
  message?: string;
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transport': '🚗',
  'Shopping': '🛒',
  'Entertainment': '📺',
  'Bills & Utilities': '📄',
  'Health': '💊',
  'Travel': '✈️',
  'Other': '📦',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Shopping': '#A78BFA',
  'Entertainment': '#F59E0B',
  'Bills & Utilities': '#3B82F6',
  'Health': '#10B981',
  'Travel': '#F472B6',
  'Other': '#6B7280',
};

export const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  'Food & Dining': ['#FF6B6B', '#EE5A24'],
  'Transport': ['#4ECDC4', '#2C9E8F'],
  'Shopping': ['#A78BFA', '#7C3AED'],
  'Entertainment': ['#F59E0B', '#D97706'],
  'Bills & Utilities': ['#3B82F6', '#2563EB'],
  'Health': ['#10B981', '#059669'],
  'Travel': ['#F472B6', '#DB2777'],
  'Other': ['#6B7280', '#4B5563'],
};
