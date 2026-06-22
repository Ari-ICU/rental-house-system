import React, { useState, useEffect, useRef } from "react";
import { Menu, Search, User, Plus, ChevronDown, Sun, Moon } from "lucide-react";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCenter from "@/components/common/NotificationCenter";

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
    const [mounted, setMounted] = useState(false);
    
    // Dropdown States
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
    
    const searchRef = useRef<HTMLDivElement>(null);
    const quickActionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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
            if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
                setIsQuickActionsOpen(false);
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
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-40 glass-header shadow-sm transition-colors">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 flex-shrink-0 rounded-md transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex flex-col">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                        {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h1>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Global Search */}
                <div className="hidden md:block relative w-64" ref={searchRef}>
                    <div className={`
                        flex items-center px-3.5 py-2 bg-slate-100/50 dark:bg-slate-900/40 border rounded-xl transition-all duration-300
                        ${showResults ? 'border-indigo-500/80 ring-4 ring-indigo-500/5 shadow-glow-indigo' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'}
                    `}>
                        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-2" />
                        <input
                            type="text"
                            placeholder={lang === 'en' ? 'Search...' : 'ស្វែងរក...'}
                            className="bg-transparent border-none outline-none text-xs text-slate-850 dark:text-slate-100 w-full placeholder-slate-450 dark:placeholder-slate-500 font-medium"
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
                                className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
                            >
                                <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                    {lang === 'en' ? 'Results' : 'លទ្ធផល'}
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {results.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => handleSelectResult(r.id)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                                        {r.ClientName}
                                                    </p>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {r.roomNumber}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
                                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors border-t border-slate-200 dark:border-slate-800"
                                >
                                    {lang === 'en' ? 'View All Results' : 'មើលទាំងអស់'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Actions Dropdown */}
                <div className="relative" ref={quickActionsRef}>
                    <button
                        onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all duration-205"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{lang === "en" ? "Quick Action" : "សកម្មភាពរហ័ស"}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isQuickActionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isQuickActionsOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-850 shadow-xl rounded-xl overflow-hidden z-50 py-1"
                            >
                                <button
                                    onClick={() => { router.push('/dashboard/rentals/create'); setIsQuickActionsOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    {lang === "en" ? "+ New Rental" : "+ បន្ថែមការជួល"}
                                </button>
                                <button
                                    onClick={() => { router.push('/dashboard/bills/create'); setIsQuickActionsOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    {lang === "en" ? "+ Add Bill" : "+ បង្កើតវិក្កយបត្រ"}
                                </button>
                                <button
                                    onClick={() => { router.push('/dashboard/expenses?action=create'); setIsQuickActionsOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    {lang === "en" ? "+ Add Expense" : "+ បន្ថែមចំណាយ"}
                                </button>
                                <button
                                    onClick={() => { router.push('/dashboard/rooms?action=create'); setIsQuickActionsOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                                >
                                    {lang === "en" ? "+ Add Room" : "+ បន្ថែមបន្ទប់"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Language Switch */}
                <button
                    onClick={toggleLang}
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden cursor-pointer"
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

                {/* Notifications */}
                <NotificationCenter />

                {/* Theme Switch */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                    aria-label="Toggle Dark Mode"
                >
                    {mounted ? (
                        theme === 'dark' ? (
                            <Sun className="w-4 h-4" />
                        ) : (
                            <Moon className="w-4 h-4" />
                        )
                    ) : (
                        <div className="w-4 h-4" />
                    )}
                </button>

                {/* Profile Avatar */}
                <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-indigo-500/10">
                        A
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">Admin</p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest leading-none">System</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
