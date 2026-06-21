"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaSearch,
    FaHome,
    FaKey,
    FaDoorOpen,
    FaFileInvoiceDollar,
    FaWallet,
    FaChartBar,
    FaCog,
    FaPlus,
    FaAdjust,
    FaGlobe,
    FaUser,
} from "react-icons/fa";
import { getAllRentals } from "@/services/rentalService";
import { Rental } from "@/types/rents";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const { lang, toggleLang } = useLang();
    const { theme, setTheme } = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Toggle palette with Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Fetch rentals for search context when opened
    useEffect(() => {
        if (isOpen) {
            getAllRentals()
                .then((data) => setRentals(data))
                .catch((err) => console.error("Command palette rentals fetch error:", err));
            setSearch("");
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle clicks outside the command palette
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Built-in static commands
    const navigationCommands = [
        { icon: <FaHome />, label: lang === "en" ? "Go to Dashboard" : "ទៅកាន់ផ្ទាំងគ្រប់គ្រង", action: () => router.push("/dashboard") },
        { icon: <FaKey />, label: lang === "en" ? "Go to Rentals" : "ទៅកាន់ការជួល", action: () => router.push("/dashboard/rentals") },
        { icon: <FaDoorOpen />, label: lang === "en" ? "Go to Rooms Layout" : "ទៅកាន់ប្លង់បន្ទប់", action: () => router.push("/dashboard/rooms") },
        { icon: <FaFileInvoiceDollar />, label: lang === "en" ? "Go to Bills" : "ទៅកាន់វិក្កយបត្រ", action: () => router.push("/dashboard/bills") },
        { icon: <FaWallet />, label: lang === "en" ? "Go to Expenses" : "ទៅកាន់ការចំណាយ", action: () => router.push("/dashboard/expenses") },
        { icon: <FaChartBar />, label: lang === "en" ? "Go to Reports" : "ទៅកាន់របាយការណ៍", action: () => router.push("/dashboard/reports") },
        { icon: <FaCog />, label: lang === "en" ? "Go to Settings" : "ទៅកាន់ការកំណត់", action: () => router.push("/dashboard/settings") },
    ];

    const actionCommands = [
        { icon: <FaPlus />, label: lang === "en" ? "Create New Tenant/Rental" : "បង្កើតកិច្ចសន្យាជួលថ្មី", action: () => router.push("/dashboard/rentals/create") },
        { icon: <FaPlus />, label: lang === "en" ? "Create New Bill/Invoice" : "បង្កើតវិក្កយបត្រថ្មី", action: () => router.push("/dashboard/bills") },
        { icon: <FaAdjust />, label: lang === "en" ? "Toggle Dark/Light Theme" : "ប្តូរពណ៌ងងឹត/ភ្លឺ", action: () => setTheme(theme === "dark" ? "light" : "dark") },
        { icon: <FaGlobe />, label: lang === "en" ? "Switch Language (ខ្មែរ / EN)" : "ប្តូរភាសា (ខ្មែរ / EN)", action: () => toggleLang() },
    ];

    // Memoized filtered search list
    const allFiltered = React.useMemo(() => {
        const query = search.toLowerCase().trim();
        
        // Filtered navigation
        const filteredNavigation = navigationCommands.filter((cmd) =>
            cmd.label.toLowerCase().includes(query)
        );

        // Filtered actions
        const filteredActions = actionCommands.filter((cmd) =>
            cmd.label.toLowerCase().includes(query)
        );

        // Filtered rentals (tenants or room numbers)
        const filteredRentals = query
            ? rentals.filter(
                  (r) =>
                      r.ClientName.toLowerCase().includes(query) ||
                      r.roomNumber.toLowerCase().includes(query)
              )
            : [];

        return [
            ...filteredNavigation.map(c => ({ ...c, type: 'nav' })),
            ...filteredActions.map(c => ({ ...c, type: 'action' })),
            ...filteredRentals.map(r => ({
                icon: <FaUser />,
                label: `${r.ClientName} (Room ${r.roomNumber})`,
                action: () => router.push(`/dashboard/rentals/${r.id}`),
                type: 'rental'
            }))
        ];
    }, [search, rentals, lang, theme, router]);

    // Handle Keyboard Navigation (Arrow keys and Enter)
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((prev) => (prev + 1) % Math.max(1, allFiltered.length));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((prev) => (prev - 1 + allFiltered.length) % Math.max(1, allFiltered.length));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (allFiltered[activeIndex]) {
                    allFiltered[activeIndex].action();
                    setIsOpen(false);
                }
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [isOpen, activeIndex, allFiltered]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        ref={containerRef}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[50vh]"
                    >
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-850">
                            <FaSearch className="text-slate-400 dark:text-slate-500 mr-3 text-lg" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={lang === "en" ? "Search pages, actions, tenants..." : "ស្វែងរក ទំព័រ សកម្មភាព អ្នកជួល..."}
                                className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm py-1"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setActiveIndex(0);
                                }}
                            />
                            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                ESC
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {allFiltered.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-xs font-medium">
                                    {lang === "en" ? "No results found" : "រកមិនឃើញលទ្ធផល"}
                                </div>
                            ) : (
                                <>
                                    {/* Navigation Group */}
                                    {allFiltered.filter(c => c.type === 'nav').length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                                                {lang === "en" ? "Navigation" : "ការរុករក"}
                                            </div>
                                            {allFiltered.map((cmd, idx) => {
                                                if (cmd.type !== 'nav') return null;
                                                const isSelected = idx === activeIndex;
                                                return (
                                                    <button
                                                        key={`nav-${cmd.label}`}
                                                        onClick={() => { cmd.action(); setIsOpen(false); }}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                                                            isSelected
                                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                        }`}
                                                    >
                                                        <span className={isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                                                            {cmd.icon}
                                                        </span>
                                                        <span className="flex-1 truncate">{cmd.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Actions Group */}
                                    {allFiltered.filter(c => c.type === 'action').length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                                                {lang === "en" ? "Actions" : "សកម្មភាព"}
                                            </div>
                                            {allFiltered.map((cmd, idx) => {
                                                if (cmd.type !== 'action') return null;
                                                const isSelected = idx === activeIndex;
                                                return (
                                                    <button
                                                        key={`action-${cmd.label}`}
                                                        onClick={() => { cmd.action(); setIsOpen(false); }}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                                                            isSelected
                                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                        }`}
                                                    >
                                                        <span className={isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                                                            {cmd.icon}
                                                        </span>
                                                        <span className="flex-1 truncate">{cmd.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Tenants Group */}
                                    {allFiltered.filter(c => c.type === 'rental').length > 0 && (
                                        <div>
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
                                                {lang === "en" ? "Rentals & Tenants" : "កិច្ចសន្យា និងអ្នកជួល"}
                                            </div>
                                            {allFiltered.map((cmd, idx) => {
                                                if (cmd.type !== 'rental') return null;
                                                const isSelected = idx === activeIndex;
                                                return (
                                                    <button
                                                        key={`rental-${cmd.label}`}
                                                        onClick={() => { cmd.action(); setIsOpen(false); }}
                                                        onMouseEnter={() => setActiveIndex(idx)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-colors ${
                                                            isSelected
                                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                                                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                        }`}
                                                    >
                                                        <span className={isSelected ? "text-white" : "text-slate-400 dark:text-slate-500"}>
                                                            {cmd.icon}
                                                        </span>
                                                        <span className="flex-1 truncate">{cmd.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer Help */}
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border dark:border-slate-700">↑↓</kbd> to navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="bg-white dark:bg-slate-800 px-1 rounded shadow-sm border dark:border-slate-700">Enter</kbd> to select
                                </span>
                            </div>
                            <div>
                                {lang === "en" ? "Cmd+K to search" : "Cmd+K ដើម្បីស្វែងរក"}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
