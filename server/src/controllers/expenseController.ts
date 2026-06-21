import { Request, Response } from 'express';
import * as expenseService from '../service/expense.service';
import {
    successResponse,
    createdResponse,
    notFoundResponse,
    errorResponse,
} from '../utils/apiResponse';

export const getExpenses = async (req: Request, res: Response): Promise<any> => {
    try {
        const expenses = await expenseService.getAllExpenses();
        return successResponse(res, expenses, 'Expenses fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch expenses', error);
    }
};

export const getExpenseById = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const expense = await expenseService.getExpenseById(id);
        return successResponse(res, expense, 'Expense fetched successfully');
    } catch (error: any) {
        if (error.message === 'Expense not found') {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to fetch expense', error);
    }
};

export const createExpense = async (req: Request, res: Response): Promise<any> => {
    try {
        const expense = await expenseService.createExpense(req.body);
        return createdResponse(res, expense, 'Expense created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create expense', error);
    }
};

export const updateExpense = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const updatedExpense = await expenseService.updateExpense(id, req.body);
        return successResponse(res, updatedExpense, 'Expense updated successfully');
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to update expense', error);
    }
};

export const deleteExpense = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        await expenseService.deleteExpense(id);
        return successResponse(res, null, 'Expense deleted successfully');
    } catch (error: any) {
        if (error.message === 'Expense not found') {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to delete expense', error);
    }
};
