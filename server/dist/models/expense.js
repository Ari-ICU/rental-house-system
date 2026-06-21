"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const convertDecimalToNumber = (expense) => {
    if (!expense)
        return null;
    return {
        ...expense,
        amount: Number(expense.amount),
    };
};
const Expense = {
    findAll: async () => {
        const expenses = await prisma_1.default.expense.findMany({
            orderBy: {
                date: 'desc',
            },
        });
        return expenses.map(convertDecimalToNumber);
    },
    findById: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const expense = await prisma_1.default.expense.findUnique({
            where: {
                id: parsedId,
            },
        });
        return convertDecimalToNumber(expense);
    },
    create: async (expenseData) => {
        const { title, category, amount, date, description, fileUrl } = expenseData;
        const newExpense = await prisma_1.default.expense.create({
            data: {
                title,
                category,
                amount: Number(amount),
                date: date ? new Date(date) : undefined,
                description,
                fileUrl,
            },
        });
        return convertDecimalToNumber(newExpense);
    },
    update: async (id, expenseData) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const allowedFields = ['title', 'category', 'amount', 'date', 'description', 'fileUrl'];
        const dataToUpdate = {};
        for (const key of allowedFields) {
            if (expenseData[key] !== undefined) {
                if (key === 'amount') {
                    dataToUpdate[key] = Number(expenseData[key]);
                }
                else if (key === 'date') {
                    dataToUpdate[key] = new Date(expenseData[key]);
                }
                else {
                    dataToUpdate[key] = expenseData[key];
                }
            }
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }
        const updated = await prisma_1.default.expense.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
        });
        return convertDecimalToNumber(updated);
    },
    delete: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return false;
        }
        try {
            const deleted = await prisma_1.default.expense.delete({
                where: {
                    id: parsedId,
                },
            });
            return !!deleted;
        }
        catch (error) {
            if (error.code === 'P2025') {
                return false;
            }
            throw error;
        }
    }
};
exports.default = Expense;
