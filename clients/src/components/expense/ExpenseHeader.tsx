"use client";

import React from "react";
import { FaSearch, FaPlus, FaMoneyBillWave, FaFileExport } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

interface ExpenseHeaderProps {
    onSearch: (query: string) => void;
    onAdd: () => void;
    onExport: () => void;
    total: number;
}

const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({ onSearch, onAdd, onExport, total }) => {
    const { lang } = useLang();

    return (
        <div className="flex flex-col gap-8 mb-4">
            {/* Title & Action Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        <FaMoneyBillWave size={12} />
                        {lang === 'km' ? "ការគ្រប់គ្រងហិរញ្ញវត្ថុ" : "Financial Management"}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {lang === 'km' ? "ការចំណាយ" : "Expenses"}
                        <span className="text-indigo-600">.</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl text-balance">
                            {lang === 'km'
                                ? "តាមដានរាល់ការចំណាយលើការថែទាំ ពន្ធ ប្រាក់បៀវត្សរ៍ និងសេវាកម្មផ្សេងៗ។"
                                : "Track all maintenance, taxes, salaries, and utility costs for your properties."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {lang === 'km' ? "ចំណាយសរុបបច្ចុប្បន្ន" : "Current Total Expenses"}
                        </span>
                        <span className="text-2xl font-black text-indigo-600">
                            ${total.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={onExport}
                        className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-6 py-4 rounded-2xl font-bold border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                    >
                        <FaFileExport size={16} className="text-slate-400" />
                        {lang === 'km' ? "ទាញយក" : "Export"}
                    </button>

                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/25 shrink-0"
                    >
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <FaPlus size={14} />
                        </div>
                        {lang === 'km' ? "បន្ថែមចំណាយ" : "Add Expense"}
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <FaSearch size={18} />
                </div>
                <input
                    type="text"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder={lang === 'km' ? "ស្វែងរកតាមចំណងជើង ប្រភេទ ឬការពិពណ៌នា..." : "Search by title, category, or description..."}
                    className="block w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                />
            </div>
        </div>
    );
};

export default ExpenseHeader;
