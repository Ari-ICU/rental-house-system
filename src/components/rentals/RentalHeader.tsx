'use client';

import React, { useState, ChangeEvent } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";

interface RentalHeaderProps {
    onSearch?: (query: string) => void;
    onAdd?: () => void;
}

const RentalHeader: React.FC<RentalHeaderProps> = ({ onSearch, onAdd }) => {
    const { lang } = useLang();
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) onSearch(value);
    };

    const getTitle = () => {
        const segments = pathname.split("/").filter(Boolean);
        const lastSegment = segments[segments.length - 1] || "rentals";
        const formatted = lastSegment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
        const titleEn = formatted.toLowerCase().includes("rentals") ? formatted : `${formatted} Rentals`;
        const titleKh = "ការជួល"; // You can customize based on route if needed
        return lang === "en" ? titleEn : titleKh;
    };

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4 w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">{getTitle()}</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full sm:w-64 lg:w-80">
                    <input
                        type="text"
                        placeholder={lang === "en" 
                            ? "Search rentals by tenant name or property address..." 
                            : "ស្វែងរកការជួលតាមឈ្មោះអ្នកជួល ឬអាសយដ្ឋានអចលនទ្រព្យ..."}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        aria-label={lang === "en" ? "Search rentals" : "ស្វែងរកការជួល"}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>

                {onAdd && (
                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 sm:px-6 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium w-full sm:w-auto"
                        aria-label={lang === "en" ? "Add new rental" : "បន្ថែមការជួលថ្មី"}
                    >
                        <FaPlus className="text-sm" /> {lang === "en" ? "Add Rental" : "បន្ថែមការជួល"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RentalHeader;
