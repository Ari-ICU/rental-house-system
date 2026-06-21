"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenseById = exports.getAllExpenses = void 0;
const expense_1 = __importDefault(require("../models/expense"));
const getAllExpenses = async () => {
    return await expense_1.default.findAll();
};
exports.getAllExpenses = getAllExpenses;
const getExpenseById = async (id) => {
    const expense = await expense_1.default.findById(id);
    if (!expense) {
        throw new Error('Expense not found');
    }
    return expense;
};
exports.getExpenseById = getExpenseById;
const createExpense = async (expenseData) => {
    return await expense_1.default.create(expenseData);
};
exports.createExpense = createExpense;
const updateExpense = async (id, expenseData) => {
    const updated = await expense_1.default.update(id, expenseData);
    if (!updated) {
        throw new Error('Expense not found or no valid fields to update');
    }
    return updated;
};
exports.updateExpense = updateExpense;
const deleteExpense = async (id) => {
    const deleted = await expense_1.default.delete(id);
    if (!deleted) {
        throw new Error('Expense not found');
    }
    return deleted;
};
exports.deleteExpense = deleteExpense;
