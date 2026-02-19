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
                <div className="hidden md:block relative" ref={searchRef}>
                    <div className="flex items-center px-4 py-2 bg-gray-100/50 hover:bg-gray-100 rounded-full border border-gray-100 hover:border-violet-200 transition-all w-72 focus-within:ring-2 focus-within:ring-violet-500/10 focus-within:border-violet-300">
                        <FaSearch className="w-3.5 h-3.5 text-gray-400 mr-2.5" />
                        <input
                            type="text"
                            placeholder={lang === 'en' ? 'Search rentals...' : 'ស្វែងរកការជួល...'}
                            className="bg-transparent border-none outline-none text-sm text-gray-700 w-full placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => searchQuery && setShowResults(true)}
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && results.length > 0 && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2">
                                {results.map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => handleSelectResult(r.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                                            <FaUser size={12} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{r.ClientName}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><FaDoorOpen size={10} /> {r.roomNumber}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span>{r.status}</span>
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
                                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-violet-600 border-t border-gray-100 transition-colors uppercase tracking-wider"
                            >
                                {lang === 'en' ? 'View all results' : 'មើលលទ្ធផលទាំងអស់'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                {/* Language Switcher */}
                <button
                    onClick={toggleLang}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
                    aria-label="Switch language"
                >
                    <div className="w-5 h-5 rounded-full overflow-hidden relative shadow-sm border border-gray-200">
                        <Image
                            src={lang === 'en' ? flags.km : flags.en}
                            alt={lang === 'en' ? 'Khmer' : 'English'}
                            fill
                            className="object-cover"
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
