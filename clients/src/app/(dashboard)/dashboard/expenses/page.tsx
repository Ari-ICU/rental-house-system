"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLang } from "@/context/LangContext";
import * as expenseService from "@/services/expenseService";
import { Expense } from "@/types/expense";
import ExpenseHeader from "@/components/expense/ExpenseHeader";
import ExpenseTable from "@/components/expense/ExpenseTable";
import ExpenseForm from "@/components/expense/ExpenseForm";
import { FaPlus } from "react-icons/fa";

const ExpensesPage: React.FC = () => {
    const { lang } = useLang();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await expenseService.getAllExpenses();
            setExpenses(data);
            setFilteredExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleSearch = (query: string) => {
        const filtered = expenses.filter(
            (e) =>
                e.title.toLowerCase().includes(query.toLowerCase()) ||
                e.category.toLowerCase().includes(query.toLowerCase()) ||
                (e.description && e.description.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredExpenses(filtered);
    };

    const handleAdd = () => {
        setEditingExpense(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsFormOpen(true);
    };

    const handleDelete = async (expense: Expense) => {
        if (confirm(lang === 'km' ? "តើអ្នកប្រាកដថាចង់លុបចំណាយនេះមែនទេ?" : "Are you sure you want to delete this expense?")) {
            try {
                await expenseService.deleteExpense(expense.id);
                await fetchExpenses();
            } catch (error) {
                console.error("Failed to delete expense:", error);
            }
        }
    };

    const handleFormSubmit = async (data: Partial<Expense>) => {
        try {
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense.id, data);
            } else {
                await expenseService.createExpense(data);
            }
            setIsFormOpen(false);
            await fetchExpenses();
        } catch (error) {
            console.error("Failed to save expense:", error);
        }
    };

    return (
        <div className="min-h-screen space-y-8">
            <ExpenseHeader onSearch={handleSearch} onAdd={handleAdd} />

            <main className="container mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <ExpenseTable
                        expenses={filteredExpenses}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </main>

            {isFormOpen && (
                <ExpenseForm
                    expense={editingExpense}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
};

export default ExpensesPage;
