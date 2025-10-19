'use client';

import React from "react";
import { FaUserCircle, FaBars } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

interface HeaderProps {
    onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
    const { lang, toggleLang } = useLang();

    // You can replace these URLs with your own local SVGs if needed
    const flags = {
        en: "/flags/us.png", // English flag
        km: "/flags/kh.png", // Khmer flag
    };

    return (
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:px-6 md:py-4 sticky top-0 z-40">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden text-gray-700 hover:text-gray-900"
                    aria-label="Toggle mobile menu"
                >
                    <FaBars size={20} />
                </button>
                <h1 className="text-lg md:text-xl font-semibold">
                    {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Language Switcher with Flag Images */}
                <button
                    onClick={toggleLang}
                    className="px-2 py-1 border rounded hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Switch language"
                >
                    <img
                        src={lang === 'en' ? flags.km : flags.en}
                        alt={lang === 'en' ? 'Khmer' : 'English'}
                        className="w-8 h-5"
                    />
                </button>

                <button
                    className="text-gray-700 hover:text-gray-900"
                    aria-label="User profile"
                >
                    <FaUserCircle size={32} />
                </button>
            </div>
        </header>
    );
};

export default Header;
