import { Expense, ExpenseResponse, CategoryBreakdown } from '../types/expense';

const API_BASE_URL = 'http://localhost:3001';
const TIMEOUT_MS = 15000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function addExpense(input: string): Promise<Expense> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });

  const data: ExpenseResponse = await response.json();

  if (!data.success || !data.expense) {
    throw new Error(data.error || 'Failed to add expense');
  }

  return data.expense;
}

export interface ExpenseListResult {
  expenses: Expense[];
  totalSpends: number;
  totalCount: number;
  breakdown: CategoryBreakdown[];
}

export async function getExpenses(from?: string, to?: string): Promise<ExpenseListResult> {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);

  const query = params.toString();
  const url = `${API_BASE_URL}/api/expenses${query ? `?${query}` : ''}`;

  const response = await fetchWithTimeout(url);
  const data: ExpenseResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch expenses');
  }

  return {
    expenses: data.expenses || [],
    totalSpends: data.totalSpends || 0,
    totalCount: data.totalCount || 0,
    breakdown: data.breakdown || [],
  };
}

export async function deleteExpense(id: number): Promise<void> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/api/expenses/${id}`,
    { method: 'DELETE' }
  );

  const data: ExpenseResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete expense');
  }
}
