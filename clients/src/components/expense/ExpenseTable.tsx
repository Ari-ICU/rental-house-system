"use client";

import React, { useState } from "react";
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaFileInvoiceDollar } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Expense } from "@/types/expense";
import { formatKhmerDate } from "@/utils/dateFormatter";

interface ExpenseTableProps {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
}

const categoryColors: Record<string, string> = {
    Maintenance: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Tax: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
    Salary: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Utility: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    Other: "bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400",
};

const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onEdit, onDelete }) => {
    const { lang } = useLang();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Reset to first page when data changes (e.g., after filter or add)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [expenses]);

    const totalPages = Math.ceil(expenses.length / itemsPerPage);
    const currentItems = expenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const t = {
        title: lang === 'km' ? "ចំណងជើង" : "Title",
        category: lang === 'km' ? "ប្រភេទ" : "Category",
        amount: lang === 'km' ? "ចំនួនទឹកប្រាក់" : "Amount",
        date: lang === 'km' ? "កាលបរិច្ឆេទ" : "Date",
        actions: lang === 'km' ? "សកម្មភាព" : "Actions",
        noData: lang === 'km' ? "មិនមានទិន្នន័យចំណាយទេ" : "No expense data found",
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Table Container */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden mx-4">
                <div className="overflow-x-auto w-full min-h-[400px]">
                    <table className="min-w-[900px] w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                {[t.title, t.category, t.amount, t.date, t.actions].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-8 py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full text-gray-400 dark:text-gray-600">
                                                <FaFileInvoiceDollar size={32} className="opacity-20" />
                                            </div>
                                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                                                {t.noData}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((expense) => (
                                    <tr
                                        key={expense.id}
                                        className="group hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors duration-200"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[15px] font-bold text-gray-900 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {expense.title}
                                                </span>
                                                {expense.description && (
                                                    <span className="text-xs text-gray-400 truncate max-w-xs">{expense.description}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold leading-tight ${categoryColors[expense.category] || categoryColors.Other}`}>
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-indigo-600 dark:text-indigo-400 font-black text-lg">
                                            ${expense.amount.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-gray-800 dark:text-gray-300">
                                            {formatKhmerDate(expense.date, lang)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onEdit(expense)}
                                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(expense)}
                                                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {currentItems.length > 0 && (
                            <tfoot className="bg-indigo-50/20 dark:bg-slate-800/30">
                                <tr className="border-t border-gray-100 dark:border-slate-800">
                                    <td colSpan={2} className="px-8 py-6 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                                        {lang === 'km' ? "សរុបក្នុងទំព័រនេះ" : "Page Total"}
                                    </td>
                                    <td className="px-8 py-6 text-indigo-600 dark:text-indigo-400 font-black text-xl">
                                        ${currentItems.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-2 px-8">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-100 dark:border-slate-700">
                        {lang === 'km' ? `ទំព័រ ${currentPage} នៃ ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === 1
                                ? "bg-gray-50 dark:bg-slate-900 text-gray-300 dark:text-slate-600 border-gray-100 dark:border-slate-800 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm active:scale-95"
                                }`}
                        >
                            <FaChevronLeft size={12} />
                            {lang === 'km' ? 'ថយក្រោយ' : 'Previous'}
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === totalPages
                                ? "bg-gray-50 dark:bg-slate-900 text-gray-300 dark:text-slate-600 border-gray-100 dark:border-slate-800 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm active:scale-95"
                                }`}
                        >
                            {lang === 'km' ? 'បន្ទាប់' : 'Next'}
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;
