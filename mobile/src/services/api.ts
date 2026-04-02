import { Expense, ExpenseResponse } from '../types/expense';

// Change this to your backend URL
// For physical device, use your machine's local IP instead of localhost
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

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/expenses`);
  const data: ExpenseResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch expenses');
  }

  return data.expenses || [];
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
