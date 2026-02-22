const Expense = require('../models/expense');

const getAllExpenses = async () => {
    return await Expense.findAll();
};

const getExpenseById = async (id) => {
    const expense = await Expense.findById(id);
    if (!expense) {
        throw new Error('Expense not found');
    }
    return expense;
};

const createExpense = async (expenseData) => {
    return await Expense.create(expenseData);
};

const updateExpense = async (id, expenseData) => {
    const updated = await Expense.update(id, expenseData);
    if (!updated) {
        throw new Error('Expense not found or no valid fields to update');
    }
    return updated;
};

const deleteExpense = async (id) => {
    const deleted = await Expense.delete(id);
    if (!deleted) {
        throw new Error('Expense not found');
    }
    return deleted;
};

module.exports = {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
};
