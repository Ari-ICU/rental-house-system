'use client';

import React, { useState, ChangeEvent } from "react";
import { FaSearch, FaPlus, FaPrint } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";

interface BillHeaderProps {
    onSearch?: (query: string) => void;
    onAdd?: () => void;
    onPrint?: () => void;
}

const BillHeader: React.FC<BillHeaderProps> = ({ onSearch, onAdd, onPrint }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const { lang } = useLang();

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) onSearch(value);
    };

    const getTitle = () => {
        const segments = pathname.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1] || "bills";
        const formatted = lastSegment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        const title = formatted.toLowerCase().includes("bill") ? formatted : `${formatted} Bills`;
        return lang === "en" ? title : "វិក្កយបត្រ"; // Khmer translation
    };

    const placeholderText = lang === "en"
        ? "Search bills by customer name or bill number..."
        : "ស្វែងរកវិក្កយបត្រតាមឈ្មោះអតិថិជន ឬ លេខវិក្កយបត្រ";

    const addButtonText = lang === "en" ? "Add Bill" : "បន្ថែមវិក្កយបត្រ";
    const printButtonText = lang === "en" ? "Print All" : "បោះពុម្ពទាំងអស់";

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 w-full px-2">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{getTitle()}</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                    {lang === 'en' ? 'Manage and track all payment records' : 'គ្រប់គ្រង និងតាមដានរាល់កំណត់ត្រាការបង់ប្រាក់'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative group flex-grow sm:w-72">
                    <input
                        type="text"
                        placeholder={placeholderText}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        aria-label={placeholderText}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                </div>

                <div className="flex items-center gap-2">
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
                            aria-label={addButtonText}
                        >
                            <FaPlus className="text-xs" /> {addButtonText}
                        </button>
                    )}

                    {onPrint && (
                        <button
                            onClick={onPrint}
                            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
                            aria-label={printButtonText}
                        >
                            <FaPrint className="text-slate-400 text-sm" /> {printButtonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillHeader;