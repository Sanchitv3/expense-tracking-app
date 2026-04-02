import { Router, Request, Response } from 'express';
import { parseExpense } from '../services/ai';
import { createExpense, getAllExpenses, deleteExpense } from '../database';

const router = Router();

// POST /api/expenses - Add new expense via natural language
router.post('/', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide expense text input.',
      });
    }

    const parsed = await parseExpense(input.trim());

    const expense = createExpense({
      ...parsed,
      original_input: input.trim(),
    });

    return res.status(201).json({
      success: true,
      expense,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Could not parse expense. Please include an amount.',
    });
  }
});

// GET /api/expenses - Get all expenses
router.get('/', (_req: Request, res: Response) => {
  try {
    const expenses = getAllExpenses();
    return res.json({
      success: true,
      expenses,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch expenses.',
    });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expense ID.',
      });
    }

    const deleted = deleteExpense(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Expense deleted successfully.',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete expense.',
    });
  }
});

export default router;
