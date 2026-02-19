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
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-30 transition-all duration-200 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    <FaBars size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">
                        {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h1>
                    <p className="text-xs text-gray-500 hidden md:block">
                        {lang === 'en' ? 'Welcome back, Admin' : 'សូមស្វាគមន៍មកវិញ'}
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                {/* Search Bar - hidden on mobile for simplicity */}
                <div className="hidden md:flex items-center px-3 py-2 bg-gray-100/50 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200 transition-all w-64">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400" />
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                {/* Language Switcher */}
                <button
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
                    aria-label="Switch language"
                >
                    <div className="w-5 h-5 rounded-full overflow-hidden relative shadow-sm border border-gray-200">
                        <img
                            src={lang === 'en' ? flags.km : flags.en}
                            alt={lang === 'en' ? 'Khmer' : 'English'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </button>

                {/* Notification Bell (Visual only) */}
                <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all relative">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile */}
                <button
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                    aria-label="User profile"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow-md">
                        A
                    </div>
                    {/* <FaUserCircle size={32} className="text-gray-300" /> */}
                </button>
            </div>
        </header>
    );
};

export default Header;
