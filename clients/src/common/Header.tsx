import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaSearch, FaUser } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
    onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
    const { lang, toggleLang } = useLang();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [allRentals, setAllRentals] = useState<Rental[]>([]);
    const [results, setResults] = useState<Rental[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const data = await getAllRentals();
                setAllRentals(data);
            } catch (err) {
                console.error("Failed to fetch rentals for global search", err);
            }
        };
        fetchRentals();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        const normalized = query.toLowerCase().trim();

        if (!normalized) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const filtered = allRentals
            .filter((r) => {
                const name = (r.ClientName || "").toLowerCase();
                const room = (r.roomNumber || "").toLowerCase();
                const phone = (r.clientPhone || "").toLowerCase();
                const email = (r.clientEmail || "").toLowerCase();
                const idCard = (r.clientIDCard || "").toLowerCase();

                return (
                    name.includes(normalized) ||
                    room.includes(normalized) ||
                    phone.includes(normalized) ||
                    email.includes(normalized) ||
                    idCard.includes(normalized)
                );
            })
            .sort((a, b) => {
                const aName = a.ClientName.toLowerCase();
                const bName = b.ClientName.toLowerCase();
                const aStarts = aName.startsWith(normalized);
                const bStarts = bName.startsWith(normalized);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                return a.ClientName.localeCompare(b.ClientName, lang === 'km' ? 'km' : 'en');
            })
            .slice(0, 5);

        setResults(filtered);
        setShowResults(true);
    };

    const handleSelectResult = (id: number) => {
        router.push(`/dashboard/rentals/${id}`);
        setShowResults(false);
        setSearchQuery("");
    };

    const flags = {
        en: "/flags/us.png",
        km: "/flags/kh.png",
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 flex-shrink-0 rounded-md transition-colors"
                >
                    <FaBars className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex flex-col">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                        {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:block relative w-72" ref={searchRef}>
                    <div className={`
                        flex items-center px-3 py-2 bg-white border rounded-md transition-colors
                        ${showResults ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-300 hover:border-slate-400'}
                    `}>
                        <FaSearch className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder={lang === 'en' ? 'Search...' : 'ស្វែងរក...'}
                            className="bg-transparent border-none outline-none text-sm text-slate-900 w-full placeholder-slate-400"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showResults && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50"
                            >
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100">
                                    {lang === 'en' ? 'Results' : 'លទ្ធផល'}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {results.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => handleSelectResult(r.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                <FaUser className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-medium text-slate-900 truncate">
                                                        {r.ClientName}
                                                    </p>
                                                    <span className="text-xs text-slate-500">
                                                        {r.roomNumber}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                                    {r.clientPhone || 'No Phone'}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        router.push(`/dashboard/rentals?search=${searchQuery}`);
                                        setShowResults(false);
                                    }}
                                    className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 text-xs font-semibold transition-colors border-t border-slate-200"
                                >
                                    {lang === 'en' ? 'View All Results' : 'មើលទាំងអស់'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Language Switch */}
                <button
                    onClick={toggleLang}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden"
                >
                    <div className="w-full h-full relative">
                        <Image
                            src={lang === 'en' ? flags.km : flags.en}
                            alt={lang === 'en' ? 'Khmer' : 'English'}
                            fill
                            className="object-cover"
                        />
                    </div>
                </button>

                {/* Theme Switch */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === 'dark' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {/* Profile */}
                <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-semibold">
                        A
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none">Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
