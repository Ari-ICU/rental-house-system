"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenseById = exports.getExpenses = void 0;
const expenseService = __importStar(require("../service/expense.service"));
const apiResponse_1 = require("../utils/apiResponse");
const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        return (0, apiResponse_1.successResponse)(res, expenses, 'Expenses fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch expenses', error);
    }
};
exports.getExpenses = getExpenses;
const getExpenseById = async (req, res) => {
    const id = req.params.id;
    try {
        const expense = await expenseService.getExpenseById(id);
        return (0, apiResponse_1.successResponse)(res, expense, 'Expense fetched successfully');
    }
    catch (error) {
        if (error.message === 'Expense not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Expense not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch expense', error);
    }
};
exports.getExpenseById = getExpenseById;
const createExpense = async (req, res) => {
    try {
        const expense = await expenseService.createExpense(req.body);
        return (0, apiResponse_1.createdResponse)(res, expense, 'Expense created successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to create expense', error);
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedExpense = await expenseService.updateExpense(id, req.body);
        return (0, apiResponse_1.successResponse)(res, updatedExpense, 'Expense updated successfully');
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return (0, apiResponse_1.notFoundResponse)(res, 'Expense not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to update expense', error);
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    const id = req.params.id;
    try {
        await expenseService.deleteExpense(id);
        return (0, apiResponse_1.successResponse)(res, null, 'Expense deleted successfully');
    }
    catch (error) {
        if (error.message === 'Expense not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Expense not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to delete expense', error);
    }
};
exports.deleteExpense = deleteExpense;
