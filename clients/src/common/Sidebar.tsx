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
    FaPlug,
    FaCog,
    FaChevronLeft,
    FaMoneyBillWave,
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

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const linkGroups: LinkGroup[] = [
        {
            title: "Insights",
            titleKh: "ការយល់ដឹង",
            links: [{ name: "Dashboard", nameKh: "ផ្ទាំងគ្រប់គ្រង", href: "/dashboard", icon: <FaTachometerAlt className="w-4 h-4" /> }],
        },
        {
            title: "Operations",
            titleKh: "ប្រតិបត្តិការ",
            links: [
                { name: "Rentals", nameKh: "ការជួល", href: "/dashboard/rentals", icon: <FaFileContract className="w-4 h-4" /> },
                { name: "Expenses", nameKh: "ចំណាយ", href: "/dashboard/expenses", icon: <FaMoneyBillWave className="w-4 h-4" /> },
                { name: "Utilities & Bills", nameKh: "សេវាអគ្គិសនី និងទឹក", href: "/dashboard/bills", icon: <FaPlug className="w-4 h-4" /> },
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
                    icon: <FaCamera className="w-4 h-4" />,
                },
            ],
        },
        {
            title: "Analytics",
            titleKh: "ការវិភាគ",
            links: [{ name: "Performance Reports", nameKh: "របាយការណ៍", href: "/dashboard/reports", icon: <FaChartBar className="w-4 h-4" /> }],
        },
        {
            title: "Preferences",
            titleKh: "ចំណូលចិត្ត",
            links: [
                { name: "System Settings", nameKh: "ការកំណត់", href: "/dashboard/settings", icon: <FaCog className="w-4 h-4" /> },
            ],
        },
        {
            title: "Help & Support",
            titleKh: "ជំនួយ និងការគាំទ្រ",
            links: [
                { name: "Support Hub", nameKh: "មជ្ឈមណ្ឌលគាំទ្រ", href: "/dashboard/support", icon: <FaLifeRing className="w-4 h-4" /> },
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
                    group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
                    ${collapsed ? "justify-center" : "justify-start"}
                    ${active
                        ? "bg-slate-100 dark:bg-indigo-500/10 text-slate-900 dark:text-indigo-400 font-medium"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }
                `}
            >
                <div className={`flex items-center justify-center ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {link.icon}
                </div>
                {!collapsed && (
                    <span className="text-sm truncate">
                        {lang === 'en' ? link.name : link.nameKh}
                    </span>
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-800 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-sm border border-slate-700 whitespace-nowrap z-50">
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
                        <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                            {lang === 'en' ? group.title : group.titleKh}
                        </h3>
                    )}
                    <div className="space-y-1">
                        {group.links.map((link) => (
                            <NavItem key={link.name} link={link} collapsed={collapsed} onLinkClick={onLinkClick} />
                        ))}
                    </div>
                </div>
            ))}

            <div className="pt-6 pb-8 border-t border-slate-100 dark:border-slate-800 mt-6 mx-3">
                <button
                    onClick={() => {
                        if (confirm(lang === 'en' ? 'Are you sure you want to logout?' : 'តើអ្នកប្រាកដជាចង់ចាកចេញមែនទេ?')) {
                            logout();
                            if (onLinkClick) onLinkClick();
                        }
                    }}
                    className={`
                        group relative flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 w-full
                        ${collapsed ? "justify-center" : "justify-start"}
                        text-slate-600 hover:text-red-600 hover:bg-red-50
                    `}
                >
                    <div className="flex items-center justify-center text-slate-400 group-hover:text-red-500">
                        <FaSignOutAlt className="w-4 h-4" />
                    </div>
                    {!collapsed && (
                        <span className="text-sm font-medium truncate">
                            {lang === 'en' ? 'Logout' : 'ចាកចេញ'}
                        </span>
                    )}
                    {collapsed && (
                        <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-800 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-sm border border-slate-700 whitespace-nowrap z-50">
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
                    hidden lg:flex flex-col bg-white dark:bg-slate-950 h-screen transition-all duration-300
                    border-r border-slate-200 dark:border-slate-800 relative
                    ${isCollapsed ? "w-[80px]" : "w-[260px]"}
                    sticky top-0 z-50
                `}
            >
                {/* Header / Logo */}
                <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between px-6'} transition-all duration-300`}>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">R</span>
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-900 dark:text-slate-50 tracking-tight leading-none text-lg">
                                    RentFlow
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                    )}
                </div>

                {isCollapsed && (
                    <div className="flex justify-center mt-4 mb-2">
                        <button
                            onClick={toggleCollapse}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <FaBars size={12} />
                        </button>
                    </div>
                )}

                {renderNav(isCollapsed)}
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
                            className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-white flex flex-col shadow-xl border-r border-slate-200 lg:hidden"
                        >
                            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
                                        <span className="text-white font-bold text-lg">R</span>
                                    </div>
                                    <span className="font-semibold text-slate-900 tracking-tight text-lg">
                                        RentFlow
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>
                            {renderNav(false, onClose)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
