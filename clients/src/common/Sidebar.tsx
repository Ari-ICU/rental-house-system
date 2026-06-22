'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Bed,
    FileText,
    Users,
    Receipt,
    Wallet,
    BarChart3,
    Video,
    UserCheck,
    Settings,
    HelpCircle,
    ChevronLeft,
    Menu,
    LogOut,
    X
} from "lucide-react";
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
    const { logout, user } = useAuth();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const linkGroups: LinkGroup[] = [
        {
            title: "Overview",
            titleKh: "ទិដ្ឋភាពទូទៅ",
            links: [
                { 
                    name: "Overview", 
                    nameKh: "ទិដ្ឋភាពទូទៅ", 
                    href: "/dashboard", 
                    icon: <LayoutDashboard className="w-4 h-4" /> 
                }
            ],
        },
        {
            title: "Property",
            titleKh: "អចលនទ្រព្យ",
            links: [
                { name: "Rooms", nameKh: "បន្ទប់ជួល", href: "/dashboard/rooms", icon: <Bed className="w-4 h-4" /> },
                { name: "Rentals", nameKh: "ការជួល", href: "/dashboard/rentals", icon: <FileText className="w-4 h-4" /> },
                { name: "Tenants", nameKh: "អ្នកជួល", href: "/dashboard/tenants", icon: <Users className="w-4 h-4" /> },
            ],
        },
        {
            title: "Finance",
            titleKh: "ហិរញ្ញវត្ថុ",
            links: [
                { name: "Bills", nameKh: "វិក្កយបត្រ", href: "/dashboard/bills", icon: <Receipt className="w-4 h-4" /> },
                { name: "Expenses", nameKh: "ចំណាយ", href: "/dashboard/expenses", icon: <Wallet className="w-4 h-4" /> },
                { name: "Reports", nameKh: "របាយការណ៍", href: "/dashboard/reports", icon: <BarChart3 className="w-4 h-4" /> },
            ],
        },
        {
            title: "System",
            titleKh: "ប្រព័ន្ធ",
            links: [
                { name: "Cameras", nameKh: "កាមេរ៉ា", href: "/dashboard/camera", icon: <Video className="w-4 h-4" /> },
                { name: "Users", nameKh: "អ្នកប្រើប្រាស់", href: "/dashboard/users", icon: <UserCheck className="w-4 h-4" /> },
                { name: "Settings", nameKh: "ការកំណត់", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
                { name: "Support Hub", nameKh: "ជំនួយការគាំទ្រ", href: "/dashboard/support", icon: <HelpCircle className="w-4 h-4" /> },
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
                    group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium
                    ${collapsed ? "justify-center" : "justify-start"}
                    ${active
                        ? "text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }
                `}
            >
                {/* Active Indicator Background */}
                {active && (
                    <motion.div
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/15 rounded-xl z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                )}

                {/* Left Active border bar */}
                {active && (
                    <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-gradient-to-b from-indigo-500 to-violet-600 dark:from-indigo-400 dark:to-violet-500 rounded-full z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                )}

                {/* Icon Container */}
                <div className={`relative z-10 flex items-center justify-center transition-colors duration-200 ${
                    active 
                        ? 'text-indigo-600 dark:text-indigo-400 scale-105' 
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}>
                    {link.icon}
                </div>

                {/* Label */}
                {!collapsed && (
                    <span className="relative z-10 text-[13px] tracking-wide truncate">
                        {lang === 'en' ? link.name : link.nameKh}
                    </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-slate-800 dark:border-slate-800 whitespace-nowrap z-50">
                        {lang === 'en' ? link.name : link.nameKh}
                    </div>
                )}
            </Link>
        );
    };

    const renderNav = (collapsed: boolean, onLinkClick?: () => void) => (
        <nav className="flex-1 overflow-y-auto mt-6 px-4 space-y-6 custom-scrollbar">
            {linkGroups.map((group) => (
                <div key={group.title} className="relative">
                    {!collapsed && (
                        <h3 className="px-3.5 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.15em] uppercase">
                            {lang === 'en' ? group.title : group.titleKh}
                        </h3>
                    )}
                    <div className="space-y-1.5">
                        {group.links.map((link) => (
                            <NavItem key={link.name} link={link} collapsed={collapsed} onLinkClick={onLinkClick} />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );

    const renderFooter = (collapsed: boolean, onLinkClick?: () => void) => {
        const initials = user?.name 
            ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : 'U';
            
        return (
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-900/60 bg-transparent transition-all duration-300">
                {collapsed ? (
                    <div className="flex flex-col items-center gap-3">
                        {/* Collapsed Profile Avatar */}
                        <div className="group relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md cursor-pointer">
                            {initials}
                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-slate-800 dark:border-slate-800 whitespace-nowrap z-50">
                                <p className="font-bold">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{user?.email || ''}</p>
                            </div>
                        </div>

                        {/* Collapsed Logout */}
                        <button
                            onClick={() => {
                                if (confirm(lang === 'en' ? 'Are you sure you want to logout?' : 'តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
                                    logout();
                                    if (onLinkClick) onLinkClick();
                                }
                            }}
                            className="group relative w-10 h-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-all duration-200"
                            aria-label="Logout"
                        >
                            <LogOut size={16} />
                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl border border-slate-800 dark:border-slate-800 whitespace-nowrap z-50">
                                {lang === 'en' ? 'Logout' : 'ចាកចេញ'}
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        {/* Profile Info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
                                {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                                    {user?.name || 'Administrator'}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none">
                                    {user?.email || 'admin@rentflow.com'}
                                </span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                if (confirm(lang === 'en' ? 'Are you sure you want to logout?' : 'តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
                                    logout();
                                    if (onLinkClick) onLinkClick();
                                }
                            }}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-all duration-200 shrink-0"
                            aria-label="Logout"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden lg:flex flex-col glass-sidebar h-screen transition-all duration-300
                    relative
                    ${isCollapsed ? "w-[80px]" : "w-[260px]"}
                    sticky top-0 z-50
                `}
            >
                {/* Header / Logo */}
                <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between px-6'} transition-all duration-300`}>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-base bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    RentFlow
                                </span>
                                <span className="text-[10px] font-bold text-indigo-500 tracking-widest mt-1 uppercase">Manager</span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 shadow-sm"
                            aria-label="Collapse Sidebar"
                        >
                            <ChevronLeft size={10} />
                        </button>
                    )}
                </div>

                {isCollapsed && (
                    <div className="flex justify-center mt-4 mb-2">
                        <button
                            onClick={toggleCollapse}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                            aria-label="Expand Sidebar"
                        >
                            <Menu size={11} />
                        </button>
                    </div>
                )}

                {renderNav(isCollapsed)}
                {renderFooter(isCollapsed)}
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden"
                            onClick={onClose}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-white dark:bg-slate-950 flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 lg:hidden"
                        >
                            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
                                        <span className="text-white font-bold text-lg">R</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-lg">
                                        RentFlow
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            {renderNav(false, onClose)}
                            {renderFooter(false, onClose)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
