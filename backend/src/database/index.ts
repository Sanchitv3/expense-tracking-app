import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'expenses.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'INR',
      category VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      merchant VARCHAR(100),
      original_input TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

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

export interface ExpenseInput {
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
  original_input: string;
}

export function createExpense(input: ExpenseInput): Expense {
  const stmt = db.prepare(`
    INSERT INTO expenses (amount, currency, category, description, merchant, original_input)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.amount,
    input.currency,
    input.category,
    input.description,
    input.merchant,
    input.original_input
  );

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense;
  return expense;
}

export function getAllExpenses(from?: string, to?: string): Expense[] {
  if (from && to) {
    return db
      .prepare('SELECT * FROM expenses WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC')
      .all(from, to) as Expense[];
  }
  if (from) {
    return db
      .prepare('SELECT * FROM expenses WHERE DATE(created_at) >= ? ORDER BY created_at DESC')
      .all(from) as Expense[];
  }
  if (to) {
    return db
      .prepare('SELECT * FROM expenses WHERE DATE(created_at) <= ? ORDER BY created_at DESC')
      .all(to) as Expense[];
  }
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all() as Expense[];
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export function getTotalSpends(from?: string, to?: string): { total: number; count: number; breakdown: CategoryBreakdown[] } {
  let whereClause = '';
  const params: string[] = [];

  if (from && to) {
    whereClause = 'WHERE DATE(created_at) BETWEEN ? AND ?';
    params.push(from, to);
  } else if (from) {
    whereClause = 'WHERE DATE(created_at) >= ?';
    params.push(from);
  } else if (to) {
    whereClause = 'WHERE DATE(created_at) <= ?';
    params.push(to);
  }

  const totalRow = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses ${whereClause}`)
    .get(...params) as { total: number; count: number };

  const breakdown = db
    .prepare(`SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses ${whereClause} GROUP BY category ORDER BY total DESC`)
    .all(...params) as CategoryBreakdown[];

  return { total: totalRow.total, count: totalRow.count, breakdown };
}

export function deleteExpense(id: number): boolean {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return result.changes > 0;
}
