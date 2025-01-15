import { create } from 'zustand';
import { api, Expense } from './api';

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async () => {
    set({ isLoading: true });
    try {
      const expenses = await api.getExpenses();
      set({ expenses, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch expenses' });
    } finally {
      set({ isLoading: false });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true });
    try {
      const newExpense = await api.createExpense(expense);
      set(state => ({
        expenses: [...state.expenses, newExpense],
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to add expense' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateExpense: async (id, expense) => {
    set({ isLoading: true });
    try {
      const updated = await api.updateExpense(id, expense);
      set(state => ({
        expenses: state.expenses.map(e => e.id === id ? updated : e),
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to update expense' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true });
    try {
      await api.deleteExpense(id);
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== id),
        error: null
      }));
    } catch (error) {
      set({ error: 'Failed to delete expense' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
