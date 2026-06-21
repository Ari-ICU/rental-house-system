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
        <div className="mb-8">
            {/* Title Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                        <FaHome className="text-lg" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                            {lang === "en" ? "Rentals" : "ការជួល"}
                        </h1>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1.5 flex items-center gap-1.5">
                            <span>
                                {lang === "en" ? "Total Contracts" : "កិច្ចសន្យាសរុប"}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold text-[10px]">
                                {totalCount}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                            <span>
                                {lang === "en" ? `${activeCount} active` : `សកម្ម ${activeCount}`}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <FaSearch className="text-slate-400 text-xs transition-colors group-focus-within:text-indigo-500" />
                        </div>
                        <input
                            type="text"
                            placeholder={lang === "en"
                                ? "Search by tenant, room, or phone..."
                                : "ស្វែងរកតាមឈ្មោះ បន្ទប់ ឬលេខទូរស័ព្ទ..."}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-550 text-xs bg-white/70 dark:bg-slate-900/70 dark:text-slate-100 hover:border-slate-350 dark:hover:border-slate-750 transition-all placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 shadow-sm"
                            aria-label={lang === "en" ? "Search rentals" : "ស្វែងរកការជួល"}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Backup Button */}
                        {onBackup && (
                            <button
                                onClick={onBackup}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-905 dark:hover:text-slate-100 transition-all text-xs font-semibold shadow-sm hover:shadow active:scale-98 whitespace-nowrap cursor-pointer"
                                title={lang === "en" ? "Backup Data" : "ចម្លងទិន្នន័យទុក"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 dark:text-slate-450"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span>{lang === "en" ? "Backup" : "បម្រុងទុក"}</span>
                            </button>
                        )}

                        {/* Add Button */}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-700 hover:to-violet-750 transition-all text-xs font-bold shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-none hover:-translate-y-0.5 active:translate-y-0 active:scale-98 whitespace-nowrap cursor-pointer"
                                aria-label={lang === "en" ? "Add new rental" : "បន្ថែមការជួលថ្មី"}
                            >
                                <FaPlus className="text-[10px]" />
                                <span>{lang === "en" ? "Add Rental" : "បន្ថែមការជួល"}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalHeader;
