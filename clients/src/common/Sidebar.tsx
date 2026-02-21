'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaTachometerAlt,
    FaFileContract,
    FaChartBar,
    FaCamera,
    FaBars,
    FaLifeRing,
    FaTimes,
    FaHome,
    FaPlug,
    FaCog,
    FaChevronLeft,
    FaShieldAlt,
    FaSignOutAlt
} from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { useAuth } from "@/context/AuthContext";

interface LinkItem {
    name: string;
    nameKh?: string;
    href?: string;
    icon: React.ReactNode;
    subLinks?: LinkItem[];
}

interface LinkGroup {
    title: string;
    titleKh?: string;
    links: LinkItem[];
}

const Sidebar: React.FC<{ isMobileOpen: boolean; onClose: () => void }> = ({ isMobileOpen, onClose }) => {
    const { lang } = useLang();
    const { logout } = useAuth();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target) {
                setScrolled(target.scrollTop > 10);
            }
        };
        const scrollContainer = document.querySelector('.custom-scrollbar');
        scrollContainer?.addEventListener('scroll', handleScroll);
        return () => scrollContainer?.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const linkGroups: LinkGroup[] = [
        {
            title: "Insights",
            titleKh: "ការយល់ដឹង",
            links: [{ name: "Dashboard", nameKh: "ផ្ទាំងគ្រប់គ្រង", href: "/dashboard", icon: <FaTachometerAlt /> }],
        },
        {
            title: "Operations",
            titleKh: "ប្រតិបត្តិការ",
            links: [
                { name: "Rentals", nameKh: "ការជួល", href: "/dashboard/rentals", icon: <FaFileContract /> },
                { name: "Utilities & Bills", nameKh: "សេវាអគ្គិសនី និងទឹក", href: "/dashboard/bills", icon: <FaPlug /> },
            ],
        },
        {
            title: "Security",
            titleKh: "សន្តិសុខ",
            links: [
                {
                    name: "Camera Hub",
                    nameKh: "មជ្ឈមណ្ឌលកាមេរ៉ា",
                    href: "/dashboard/camera",
                    icon: <FaCamera />,
                },
            ],
        },
        {
            title: "Analytics",
            titleKh: "ការវិភាគ",
            links: [{ name: "Performance Reports", nameKh: "របាយការណ៍", href: "/dashboard/reports", icon: <FaChartBar /> }],
        },
        {
            title: "Preferences",
            titleKh: "ចំណូលចិត្ត",
            links: [
                { name: "System Settings", nameKh: "ការកំណត់", href: "/dashboard/settings", icon: <FaCog /> },
            ],
        },
        {
            title: "Help & Support",
            titleKh: "ជំនួយ និងការគាំទ្រ",
            links: [
                { name: "Support Hub", nameKh: "មជ្ឈមណ្ឌលគាំទ្រ", href: "/dashboard/support", icon: <FaLifeRing /> },
            ],
        },
    ];

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        return pathname.startsWith(href) && href !== '/dashboard';
    };

    const NavItem = ({ link, collapsed, onLinkClick }: { link: LinkItem; collapsed: boolean; onLinkClick?: () => void }) => {
        const active = isActive(link.href);

        return (
            <Link
                href={link.href || "#"}
                onClick={onLinkClick}
                className={`
                    group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500
                    ${collapsed ? "justify-center" : "justify-start"}
                    ${active
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_4px_12px_rgba(99,102,241,0.15)]"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent"
                    }
                `}
            >
                {active && !collapsed && (
                    <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
                    />
                )}
                <span className={`text-xl transition-all duration-300 ${active ? 'scale-110 text-indigo-400' : 'group-hover:text-indigo-400 group-hover:scale-110'}`}>
                    {link.icon}
                </span>
                {!collapsed && (
                    <span className={`text-[13.5px] font-bold tracking-wide transition-opacity duration-300 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {lang === 'en' ? link.name : link.nameKh}
                    </span>
                )}
                {active && !collapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}

                {/* TOOLTIP FOR COLLAPSED STATE */}
                {collapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl border border-slate-700 whitespace-nowrap z-50">
                        {lang === 'en' ? link.name : link.nameKh}
                    </div>
                )}
            </Link>
        );
    };

    const renderNav = (collapsed: boolean, onLinkClick?: () => void) => (
        <nav className="flex-1 overflow-y-auto mt-4 px-4 space-y-8 custom-scrollbar scroll-smooth">
            {linkGroups.map((group) => (
                <div key={group.title} className="relative">
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <h3 className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.25em]">
                                {lang === 'en' ? group.title : group.titleKh}
                            </h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        {group.links.map((link) => (
                            <NavItem key={link.name} link={link} collapsed={collapsed} onLinkClick={onLinkClick} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Logout Button */}
            <div className="pt-4 pb-8">
                <button
                    onClick={() => {
                        if (confirm(lang === 'en' ? 'Are you sure you want to logout?' : 'តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
                            logout();
                            if (onLinkClick) onLinkClick();
                        }
                    }}
                    className={`
                        group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full
                        ${collapsed ? "justify-center" : "justify-start"}
                        text-rose-400 hover:text-white hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20
                    `}
                >
                    <span className="text-xl transition-all duration-300 group-hover:scale-110">
                        <FaSignOutAlt />
                    </span>
                    {!collapsed && (
                        <span className="text-[13.5px] font-bold tracking-wide">
                            {lang === 'en' ? 'Logout' : 'ចាកចេញ'}
                        </span>
                    )}
                    {collapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl border border-slate-700 whitespace-nowrap z-50">
                            {lang === 'en' ? 'Logout' : 'ចាកចេញ'}
                        </div>
                    )}
                </button>
            </div>
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden lg:flex flex-col bg-[#080a0f] text-white h-screen transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    border-r border-slate-800/40 relative
                    ${isCollapsed ? "w-[90px]" : "w-[290px]"}
                    sticky top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.3)]
                `}
            >
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-40">
                    <div className="absolute -top-[10%] -left-[20%] w-[150%] h-[50%] bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent blur-[120px] rounded-full rotate-12" />
                    <div className="absolute bottom-0 right-0 w-full h-[30%] bg-gradient-to-t from-violet-900/10 to-transparent blur-3xl opacity-50" />
                </div>

                {/* Logo & Toggle Header */}
                <div className={`h-28 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-7'} relative z-10 transition-all duration-500`}>
                    <div className="flex items-center gap-3.5 group cursor-pointer relative">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                            <div className="relative w-11 h-11 rounded-2xl bg-[#0d1117] border border-slate-700/50 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                <img src="/logo.png" alt="RentFlow Logo" className="w-full h-full object-contain p-1.5" />
                            </div>
                        </div>

                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col select-none"
                            >
                                <span className="font-black text-xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                                    Rent<span className="text-indigo-400">Flow</span>
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1.5 flex items-center gap-1.5 opacity-70">
                                    <FaShieldAlt className="text-indigo-500/60" />
                                    {lang === 'en' ? 'Premium 1.0' : 'បុព្វលាភ ១.០'}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900/50 border border-slate-800/50 text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 group shadow-lg"
                        >
                            <FaChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                        </button>
                    )}
                </div>

                {/* Collapse Toggle for Smallened State */}
                {isCollapsed && (
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={toggleCollapse}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-900/50 border border-slate-800/50 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all duration-300"
                        >
                            <FaBars size={14} />
                        </button>
                    </div>
                )}

                {/* Scroll Indicator */}
                <div className={`absolute top-28 left-0 right-0 h-8 bg-gradient-to-b from-[#080a0f] to-transparent z-20 pointer-events-none transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

                {renderNav(isCollapsed)}

                {/* PRO BANNER / Support Card */}
                {!isCollapsed && (
                    <div className="p-6 mt-auto">
                        <Link href="/dashboard/support" className="block relative group p-5 rounded-[2.5rem] bg-gradient-to-br from-[#0d1117] to-[#080a0f] border border-slate-800/50 overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30">
                            {/* Animated Inner Glow */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <FaLifeRing className="text-indigo-400 text-xl animate-[spin_8s_linear_infinite]" />
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0d1117] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-black/30 overflow-hidden`}>
                                                {i === 3 ? (
                                                    <span className="text-indigo-400">+</span>
                                                ) : (
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                                                        alt="Agent"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white tracking-tight">
                                        {lang === 'en' ? 'Support Hub' : 'ការគាំទ្រ'}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                                        {lang === 'en' ? 'Get help with your rental management instantly.' : 'ទទួលបានជំនួយភ្លាមៗ។'}
                                    </p>
                                </div>
                                <div className="w-full py-3.5 bg-indigo-600 group-hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-2xl text-[11px] font-black transition-all shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] active:scale-[0.97] flex items-center justify-center gap-2">
                                    {lang === 'en' ? 'Contact Us' : 'ទាក់ទងមកយើង'}
                                    <FaChevronLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={10} />
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* FOOTER MINI (when collapsed) */}
                {isCollapsed && (
                    <div className="p-4 mt-auto flex flex-col items-center gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:border-indigo-400 transition-all cursor-pointer shadow-lg shadow-black/40">
                            <FaLifeRing size={16} />
                        </div>
                        <div className="h-4 w-1 bg-slate-800 rounded-full" />
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#080a0f]/90 backdrop-blur-xl z-[60] lg:hidden"
                            onClick={onClose}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[70] lg:hidden w-[310px] bg-[#080a0f] text-white flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.6)] border-r border-slate-800/40"
                        >
                            <div className="h-32 flex items-center justify-between px-8">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                                        <FaHome className="text-white text-xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-2xl tracking-tighter">
                                            Rent<span className="text-indigo-400">Flow</span>
                                        </span>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mt-1.5">
                                            {lang === 'en' ? 'Pro Edition' : 'ការបោះពុម្ពគាំទ្រ'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl"
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>
                            {renderNav(false, onClose)}

                            <div className="p-8">
                                <Link href="/dashboard/support" onClick={onClose} className="block p-6 rounded-[2.5rem] bg-gradient-to-br from-[#0d1117] to-[#080a0f] border border-slate-800/50 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                                        <FaLifeRing className="text-indigo-400 text-xl" />
                                    </div>
                                    <h4 className="text-sm font-black text-white mb-2 leading-none">Need Assistance?</h4>
                                    <p className="text-[11px] text-slate-500 font-bold mb-5 leading-relaxed">Our experts are available 24/7 to help with any system issues.</p>
                                    <div className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2">
                                        Contact Support
                                        <FaChevronLeft className="rotate-180" size={10} />
                                    </div>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
