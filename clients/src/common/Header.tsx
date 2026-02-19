import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaSearch, FaUser, FaDoorOpen } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
                return name.includes(normalized) || room.includes(normalized);
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
            .slice(0, 5); // Show top 5 only for header search

        setResults(filtered);
        setShowResults(true);
    };

    const handleSelectResult = (id: number) => {
        router.push(`/dashboard/rentals/${id}`);
        setShowResults(false);
        setSearchQuery("");
    };

    // You can replace these URLs with your own local SVGs if needed
    const flags = {
        en: "/flags/us.png", // English flag
        km: "/flags/kh.png", // Khmer flag
    };

    return (
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 z-30 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
            {/* Left - Mobile Menu Trigger & Title */}
            <div className="flex items-center gap-6">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden p-2.5 -ml-2 text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all active:scale-95"
                    aria-label="Toggle mobile menu"
                >
                    <FaBars size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight leading-none">
                        {lang === 'en' ? 'Dashboard' : 'ផ្ទាំងគ្រប់គ្រង'}
                    </h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1.5 hidden md:block">
                        {lang === 'en' ? 'Overview & Statistics' : 'ទិដ្ឋភាពទូទៅ និងស្ថិតិ'}
                    </p>
                </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3 sm:gap-6">
                {/* Search Bar */}
                <div className="hidden md:block relative" ref={searchRef}>
                    <div className="group flex items-center px-4 py-3 bg-gray-50/50 hover:bg-white border border-gray-200/50 hover:border-violet-200 focus-within:bg-white focus-within:border-violet-500/30 focus-within:ring-4 focus-within:ring-violet-500/10 rounded-2xl transition-all duration-300 w-80 shadow-sm ease-out">
                        <FaSearch className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors mr-3" />
                        <input
                            type="text"
                            placeholder={lang === 'en' ? 'Search rentals...' : 'ស្វែងរកការជួល...'}
                            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full placeholder-gray-400 transition-all"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute top-full mt-4 left-0 right-0 bg-white/90 backdrop-blur-xl rounded-[1.5rem] shadow-2xl shadow-violet-500/10 border border-white/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-2 space-y-1">
                                <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {lang === 'en' ? 'Results' : 'លទ្ធផល'}
                                </div>
                                {results.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => handleSelectResult(r.id)}
                                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-violet-50/80 transition-all group text-left"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-violet-100/50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                            <FaUser size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-violet-700 transition-colors">
                                                {r.ClientName}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mt-0.5">
                                                <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md shadow-sm border border-gray-100">
                                                    <FaDoorOpen size={9} className="text-gray-400" />
                                                    {r.roomNumber}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider
                                                    ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
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
                                className="w-full py-3.5 bg-gray-50/50 hover:bg-violet-50 text-xs font-black text-violet-600 border-t border-gray-100 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                {lang === 'en' ? 'View all results' : 'មើលលទ្ធផលទាំងអស់'}
                                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                {/* Language Switcher */}
                <button
                    onClick={toggleLang}
                    className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-white border border-gray-200/50 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 transition-all active:scale-95"
                    aria-label="Switch language"
                >
                    <div className="w-6 h-6 rounded-full overflow-hidden relative shadow-sm ring-2 ring-white group-hover:ring-violet-100 transition-all">
                        <Image
                            src={lang === 'en' ? flags.km : flags.en}
                            alt={lang === 'en' ? 'Khmer' : 'English'}
                            fill
                            className="object-cover"
                        />
                    </div>
                </button>

                {/* Notification Bell */}
                <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                </button>

                {/* Profile */}
                <button
                    className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group active:scale-95"
                    aria-label="User profile"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">
                        A
                    </div>
                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-gray-700 leading-none group-hover:text-violet-700 transition-colors">Admin</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Manager</p>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Header;
