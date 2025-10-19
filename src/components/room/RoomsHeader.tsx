"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";

interface RoomsHeaderProps {
    onAddRoom?: () => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}

const RoomsHeader: React.FC<RoomsHeaderProps> = ({ onAddRoom, searchQuery, setSearchQuery }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Rooms</h1>

            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {setSearchQuery && (
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64"
                    />
                )}
                {onAddRoom && (
                    <button
                        onClick={onAddRoom}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaPlus /> Add Room
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoomsHeader;
