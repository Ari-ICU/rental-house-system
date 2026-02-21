"use client";

import { useLang } from "@/context/LangContext";
import React, { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

interface ReportsHeaderProps {
    onSearch?: (query: string) => void;
    onGenerate?: () => void;
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ onSearch, onGenerate }) => {
    const { lang } = useLang();
    const [searchQuery, setSearchQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch?.(value);
    };

    return (
        <header className="px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-white/50 dark:from-slate-900/50 to-transparent backdrop-blur-sm rounded-2xl mb-6 shadow-sm border border-white/20 dark:border-slate-800/50">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    {lang === 'km' ? 'របាយការណ៍' : 'Reports'}
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                        {lang === 'km' ? 'ប្រព័ន្ធ' : 'System'}
                    </span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {lang === 'km'
                        ? 'វិភាគ តាមដាន និងទាញយករបាយការណ៍អាជីវកម្មជួលរបស់អ្នក'
                        : 'Analyze, track and export your rental business performance'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                <div className="relative w-full sm:w-72 group">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder={lang === 'km' ? 'ស្វែងរករបាយការណ៍...' : 'Search reports...'}
                        value={searchQuery}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <button
                    onClick={onGenerate}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-bold whitespace-nowrap active:scale-95"
                >
                    <FaPlus size={14} />
                    {lang === 'km' ? 'បង្កើតរបាយការណ៍' : 'Create Report'}
                </button>
            </div>
        </header>
    );
};

export default ReportsHeader;
