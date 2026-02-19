"use client";

import React, { useState } from "react";

interface ReportsHeaderProps {
    onSearch?: (query: string) => void;
    onGenerate?: () => void; // <-- Add onGenerate prop
}

const ReportsHeader: React.FC<ReportsHeaderProps> = ({ onSearch, onGenerate }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearch?.(value);
    };

    return (
        <header className="p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Reports</h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Generate and manage custom reports
                </p>
            </div>
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={handleChange}
                    className="border rounded px-3 py-1 sm:px-4 sm:py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                    onClick={onGenerate} 
                    className="bg-blue-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-blue-600 transition"
                >
                    Create Report
                </button>
            </div>
        </header>
    );
};

export default ReportsHeader;
