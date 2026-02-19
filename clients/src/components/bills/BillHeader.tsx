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
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{getTitle()}</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">
                    {lang === 'en' ? 'Manage and track all payment records' : 'គ្រប់គ្រង និងតាមដានរាល់កំណត់ត្រាការបង់ប្រាក់'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <div className="relative group flex-grow sm:w-80">
                    <input
                        type="text"
                        placeholder={placeholderText}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-[22px] shadow-sm group-hover:shadow-md focus:outline-none focus:ring-4 focus:ring-violet-50 focus:border-violet-200 transition-all text-sm font-medium placeholder:text-gray-300"
                        aria-label={placeholderText}
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 text-lg transition-colors group-focus-within:text-violet-500" />
                </div>

                <div className="flex items-center gap-3">
                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="flex items-center justify-center gap-2.5 bg-gradient-to-br from-violet-600 to-indigo-600 text-white px-8 py-3.5 rounded-[22px] hover:shadow-xl hover:shadow-violet-200 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm font-bold shadow-lg shadow-violet-100 whitespace-nowrap"
                            aria-label={addButtonText}
                        >
                            <FaPlus className="text-xs" /> {addButtonText}
                        </button>
                    )}

                    {onPrint && (
                        <button
                            onClick={onPrint}
                            className="flex items-center justify-center gap-2.5 bg-white text-gray-700 border border-gray-100 px-6 py-3.5 rounded-[22px] hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold shadow-sm whitespace-nowrap"
                            aria-label={printButtonText}
                        >
                            <FaPrint className="text-gray-400 text-sm" /> {printButtonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillHeader;