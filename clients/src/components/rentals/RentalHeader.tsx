'use client';

import React, { useState, ChangeEvent } from "react";
import { FaSearch, FaPlus, FaHome } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

interface RentalHeaderProps {
    onSearch?: (query: string) => void;
    onAdd?: () => void;
    onBackup?: () => void;
    totalCount?: number;
    activeCount?: number;
}

const RentalHeader: React.FC<RentalHeaderProps> = ({ onSearch, onAdd, onBackup, totalCount = 0, activeCount = 0 }) => {
    const { lang } = useLang();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) onSearch(value);
    };

    return (
        <div className="mb-6">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <FaHome className="text-base" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">
                            {lang === "en" ? "Rentals" : "ការជួល"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {lang === "en"
                                ? `${totalCount} total · ${activeCount} active`
                                : `សរុប ${totalCount} · សកម្ម ${activeCount}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-slate-400 text-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder={lang === "en"
                                ? "Search by tenant or property..."
                                : "ស្វែងរក..."}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white hover:border-slate-400 transition-colors placeholder-slate-400 text-slate-900 shadow-sm"
                            aria-label={lang === "en" ? "Search rentals" : "ស្វែងរកការជួល"}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Backup Button */}
                        {onBackup && (
                            <button
                                onClick={onBackup}
                                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
                                title={lang === "en" ? "Backup Data" : "ចម្លងទិន្នន័យទុក"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span className="hidden md:inline">{lang === "en" ? "Backup" : "បម្រុងទុក"}</span>
                            </button>
                        )}

                        {/* Add Button */}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm whitespace-nowrap"
                                aria-label={lang === "en" ? "Add new rental" : "បន្ថែមការជួលថ្មី"}
                            >
                                <FaPlus className="text-xs" />
                                {lang === "en" ? "Add Rental" : "បន្ថែម"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalHeader;
