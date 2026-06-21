import Expense from '../models/expense';

export const getAllExpenses = async (): Promise<any[]> => {
    return await Expense.findAll();
};

export const getExpenseById = async (id: number | string): Promise<any> => {
    const expense = await Expense.findById(id);
    if (!expense) {
        throw new Error('Expense not found');
    }
    return expense;
};

export const createExpense = async (expenseData: any): Promise<any> => {
    return await Expense.create(expenseData);
};

export const updateExpense = async (id: number | string, expenseData: any): Promise<any> => {
    const updated = await Expense.update(id, expenseData);
    if (!updated) {
        throw new Error('Expense not found or no valid fields to update');
    }
    return updated;
};

export const deleteExpense = async (id: number | string): Promise<any> => {
    const deleted = await Expense.delete(id);
    if (!deleted) {
        throw new Error('Expense not found');
    }
    return deleted;
};
