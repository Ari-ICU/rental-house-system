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
        <div className="space-y-5 mb-6">
            {/* Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
                        <FaHome className="text-white text-base" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            {lang === "en" ? "Rentals" : "ការជួល"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {lang === "en"
                                ? `${totalCount} total · ${activeCount} active`
                                : `សរុប ${totalCount} · សកម្ម ${activeCount}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 text-xs" />
                        </div>
                        <input
                            type="text"
                            placeholder={lang === "en"
                                ? "Search by tenant name or property..."
                                : "ស្វែងរក..."}
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 text-sm bg-gray-50 hover:bg-white transition-all placeholder-gray-400"
                            aria-label={lang === "en" ? "Search rentals" : "ស្វែងរកការជួល"}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Backup Button */}
                        {onBackup && (
                            <button
                                onClick={onBackup}
                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm whitespace-nowrap"
                                title={lang === "en" ? "Backup Data" : "ចម្លងទិន្នន័យទុក"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span className="hidden md:inline">{lang === "en" ? "Backup" : "បម្រុងទុក"}</span>
                            </button>
                        )}

                        {/* Add Button */}
                        {onAdd && (
                            <button
                                onClick={onAdd}
                                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-md shadow-violet-200 hover:shadow-violet-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
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
