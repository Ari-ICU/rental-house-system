import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaSearch, FaUser } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
    onMobileMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
    const { lang, toggleLang } = useLang();
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
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm transition-all duration-500">
            {/* Left Section */}
            <div className="flex items-center gap-6">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onMobileMenuToggle}
                    className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-indigo-500/10"
                >
                    <FaBars size={18} />
                </motion.button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                        {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 hidden sm:block" />
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 hidden md:block">
                        {lang === 'en' ? 'Real-time Property Analytics' : 'ការវិភាគលើអចលនទ្រព្យផ្ទាល់'}
                    </p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 md:gap-5">
                {/* Modern Search */}
                <div className="hidden lg:block relative" ref={searchRef}>
                    <div className={`
                        group flex items-center px-4 py-3 bg-slate-100/50 hover:bg-white border transition-all duration-300 w-80 rounded-[1.25rem]
                        ${showResults ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-xl' : 'border-transparent hover:border-slate-300 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10'}
                    `}>
                        <FaSearch className={`w-3.5 h-3.5 mr-3 transition-colors ${showResults ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <input
                            type="text"
                            placeholder={lang === 'en' ? 'Search anything...' : 'ស្វែងរកអ្វីៗគ្រប់យ៉ាង...'}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 w-full placeholder-slate-400 uppercase tracking-widest transition-all"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                    </div>

                    {/* Search Results */}
                    <AnimatePresence>
                        {showResults && results.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="absolute top-full mt-4 left-0 right-0 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 p-2"
                            >
                                <div className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                                    {lang === 'en' ? 'Smart Search Results' : 'លទ្ធផលស្វែងរក'}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                                    {results.map((r) => (
                                        <button
                                            key={r.id}
                                            onClick={() => handleSelectResult(r.id)}
                                            className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-slate-50 transition-all group text-left border border-transparent hover:border-slate-100"
                                        >
                                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                <FaUser size={14} className="text-indigo-600 group-hover:text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center bg-transparent">
                                                    <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                                                        {r.ClientName}
                                                    </p>
                                                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                                        {r.roomNumber}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1.5">
                                                    <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg shadow-sm border border-slate-100">
                                                        {r.clientPhone || 'No Phone'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider
                                                        ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        {r.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        router.push(`/dashboard/rentals?search=${searchQuery}`);
                                        setShowResults(false);
                                    }}
                                    className="w-full mt-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                                >
                                    {lang === 'en' ? 'Show All Results' : 'បង្ហាញលទ្ធផលទាំងអស់'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-2 hidden lg:block" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleLang}
                        className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-100/50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                    >
                        <div className="w-6 h-6 rounded-full overflow-hidden relative shadow-sm ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                            <Image
                                src={lang === 'en' ? flags.km : flags.en}
                                alt={lang === 'en' ? 'Khmer' : 'English'}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </motion.button>


                    {/* User Profile */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-100/50 transition-all border border-transparent hover:border-slate-200 group ml-2"
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-sm font-black shadow-xl shadow-indigo-600/20 group-hover:rotate-12 transition-transform">
                            A
                        </div>
                        <div className="hidden sm:block text-left mr-2">
                            <p className="text-xs font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">Administrator</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-70">Master Manager</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </header>
    );
};

export default Header;
