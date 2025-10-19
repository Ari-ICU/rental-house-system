'use client';

import React, { useState, ChangeEvent } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";

interface BillHeaderProps {
    onSearch?: (query: string) => void;
    onAdd?: () => void;
}

const BillHeader: React.FC<BillHeaderProps> = ({ onSearch, onAdd }) => {
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

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4 w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">{getTitle()}</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-64 lg:w-80">
                    <input
                        type="text"
                        placeholder={placeholderText}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        aria-label={placeholderText}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>

                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 sm:px-6 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium w-full sm:w-auto"
                        aria-label={addButtonText}
                    >
                        <FaPlus className="text-sm" /> {addButtonText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default BillHeader;
