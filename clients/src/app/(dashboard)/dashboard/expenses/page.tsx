"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLang } from "@/context/LangContext";
import * as expenseService from "@/services/expenseService";
import { Expense } from "@/types/expense";
import ExpenseHeader from "@/components/expense/ExpenseHeader";
import ExpenseTable from "@/components/expense/ExpenseTable";
import ExpenseForm from "@/components/expense/ExpenseForm";


const ExpensesPage: React.FC = () => {
    const { lang } = useLang();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await expenseService.getAllExpenses();
            setExpenses(data);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = expenses.filter((e) => {
            const matchesSearch =
                e.title.toLowerCase().includes(query) ||
                e.category.toLowerCase().includes(query) ||
                (e.description && e.description.toLowerCase().includes(query));

            const monthPart = selectedMonth ? selectedMonth.slice(0, 7) : "";
            const matchesMonth = !monthPart || e.date.startsWith(monthPart);

            return matchesSearch && matchesMonth;
        });
        setFilteredExpenses(filtered);
    }, [expenses, searchQuery, selectedMonth]);

    const handleSearch = (query: string) => setSearchQuery(query);
    const handleMonthChange = (month: string) => setSelectedMonth(month);

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
                // Clear filters on new creation so the user sees the new entry
                setSearchQuery("");
                setSelectedMonth("");
            }
            setIsFormOpen(false);
            await fetchExpenses();
        } catch (error) {
            console.error("Failed to save expense:", error);
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Title", "Category", "Amount ($)", "Date", "Description"];
        const rows = filteredExpenses.map(e => [
            e.id,
            `"${e.title.replace(/"/g, '""')}"`,
            `"${e.category}"`,
            e.amount.toFixed(2),
            e.date.split('T')[0],
            `"${(e.description || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `expenses_report_${selectedMonth || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="min-h-screen space-y-8">
            <ExpenseHeader
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onMonthChange={handleMonthChange}
                selectedMonth={selectedMonth}
                onAdd={handleAdd}
                onExport={handleExport}
                total={currentTotal}
            />

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
