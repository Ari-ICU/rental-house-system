import { api } from '@/lib/api';
import { Expense } from '@/types/expense';

const BASE = '/api/expenses';

export async function getAllExpenses(): Promise<Expense[]> {
    const res = await api.get<Expense[]>(BASE);
    return res.data ?? [];
}

export async function getExpenseById(id: number | string): Promise<Expense> {
    const res = await api.get<Expense>(`${BASE}/${id}`);
    if (!res.data) throw new Error('Expense not found');
    return res.data;
}

export async function createExpense(payload: Partial<Expense>): Promise<Expense> {
    const res = await api.post<Expense>(BASE, payload);
    if (!res.data) throw new Error('Failed to create expense');
    return res.data;
}

export async function updateExpense(id: number | string, payload: Partial<Expense>): Promise<Expense> {
    const res = await api.put<Expense>(`${BASE}/${id}`, payload);
    if (!res.data) throw new Error('Failed to update expense');
    return res.data;
}

export async function deleteExpense(id: number | string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
}
