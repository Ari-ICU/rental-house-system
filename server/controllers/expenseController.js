const expenseService = require('../service/expense.service');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} = require('../utils/apiResponse');

const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        return successResponse(res, expenses, 'Expenses fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch expenses', error);
    }
};

const getExpenseById = async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await expenseService.getExpenseById(id);
        return successResponse(res, expense, 'Expense fetched successfully');
    } catch (error) {
        if (error.message === 'Expense not found') {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to fetch expense', error);
    }
};

const createExpense = async (req, res) => {
    try {
        const expense = await expenseService.createExpense(req.body);
        return createdResponse(res, expense, 'Expense created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create expense', error);
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedExpense = await expenseService.updateExpense(id, req.body);
        return successResponse(res, updatedExpense, 'Expense updated successfully');
    } catch (error) {
        if (error.message.includes('not found')) {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to update expense', error);
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await expenseService.deleteExpense(id);
        return successResponse(res, null, 'Expense deleted successfully');
    } catch (error) {
        if (error.message === 'Expense not found') {
            return notFoundResponse(res, 'Expense not found');
        }
        return errorResponse(res, 'Failed to delete expense', error);
    }
};

module.exports = {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
};
