'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaFileContract,
    FaUsers,
    FaChartBar,
    FaCamera,
    FaBars,
    FaLifeRing,
    FaChevronDown,
    FaTimes,
    FaHome
} from "react-icons/fa";
import { useLang } from "@/context/LangContext";

interface LinkItem {
    name: string;
    nameKh?: string;
    href?: string;
    icon?: React.ReactNode;
    subLinks?: LinkItem[];
}

interface LinkGroup {
    title: string;
    titleKh?: string;
    links: LinkItem[];
}

const Sidebar: React.FC<{ isMobileOpen: boolean; onClose: () => void }> = ({ isMobileOpen, onClose }) => {
    const { lang } = useLang();
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (isCollapsed) {
            setOpenDropdowns({});
        }
    }, [isCollapsed]);

    const toggleDropdown = (name: string) => {
        setOpenDropdowns((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const linkGroups: LinkGroup[] = [
        {
            title: "Main",
            titleKh: "មុខងារ​ចម្បង",
            links: [{ name: "Dashboard", nameKh: "ផ្ទាំងគ្រប់គ្រង", href: "/dashboard", icon: <FaTachometerAlt /> }],
        },
        {
            title: "Management",
            titleKh: "ការគ្រប់គ្រង",
            links: [
                { name: "Rentals", nameKh: "ការជួល", href: "/dashboard/rentals", icon: <FaFileContract /> },
                { name: "Electricity and Water Bills", nameKh: "វិក្កយបត្រ​អគ្គិសនី និង​ទឹក", href: "/dashboard/bills", icon: <FaUsers /> },
            ],
        },
        {
            title: "Camera Controller",
            titleKh: "កាមេរ៉ា",
            links: [
                {
                    name: "Manage Cameras",
                    nameKh: "គ្រប់គ្រងកាមេរ៉ា",
                    href: "/dashboard/camera",
                    icon: <FaCamera />,
                },
            ],
        },
        {
            title: "Reports & Analytics",
            titleKh: "របាយការណ៍ និងវិភាគ",
            links: [{ name: "Reports", nameKh: "របាយការណ៍", href: "/dashboard/reports", icon: <FaChartBar /> }],
        },
        {
            title: "Support",
            titleKh: "គាំទ្រ",
            links: [{ name: "Help Center", nameKh: "មជ្ឈមណ្ឌល​ជំនួយ", href: "/dashboard/help", icon: <FaLifeRing /> }],
        },
    ];

    const isActive = (href?: string) => {
        if (!href) return false;
        if (href === '/dashboard' && pathname === '/dashboard') return true;
        return pathname.startsWith(href) && href !== '/dashboard';
    };

    const renderNav = (collapsed: boolean, onLinkClick?: () => void) => (
        <nav className="flex-1 overflow-y-auto mt-4 px-3 custom-scrollbar">
            {linkGroups.map((group) => (
                <div key={group.title} className="mb-6">
                    {!collapsed && (
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {lang === 'en' ? group.title : group.titleKh}
                        </h3>
                    )}
                    <div className="space-y-1">
                        {group.links.map((link) => (
                            <div key={link.name} className="flex flex-col">
                                {link.subLinks ? (
                                    <>
                                        <div
                                            className={`flex items-center ${collapsed ? "justify-center" : "justify-between"
                                                } gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 cursor-pointer group`}
                                            onClick={() => !collapsed && toggleDropdown(link.name)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-lg transition-colors ${openDropdowns[link.name] ? 'text-purple-400' : 'text-gray-400 group-hover:text-purple-400'}`}>
                                                    {link.icon}
                                                </span>
                                                {!collapsed && <span className="text-sm font-medium">{lang === 'en' ? link.name : link.nameKh}</span>}
                                            </div>
                                            {!collapsed && (
                                                <button
                                                    className={`p-1 rounded-full hover:bg-white/10 text-gray-400 transition-transform duration-200 ${openDropdowns[link.name] ? 'rotate-180' : ''}`}
                                                >
                                                    <FaChevronDown size={10} />
                                                </button>
                                            )}
                                        </div>
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openDropdowns[link.name] && !collapsed ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                            {link.subLinks.map((subLink) => (
                                                <Link
                                                    key={subLink.name}
                                                    href={subLink.href || "#"}
                                                    className={`flex items-center gap-3 pl-11 pr-3 py-2 rounded-lg text-sm transition-colors ${isActive(subLink.href)
                                                        ? "bg-purple-600/10 text-purple-400"
                                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                                        }`}
                                                    onClick={onLinkClick}
                                                >
                                                    <span>{lang === 'en' ? subLink.name : subLink.nameKh}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={link.href || "#"}
                                        onClick={onLinkClick}
                                        className={`
                                        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                        ${collapsed ? "justify-center" : "justify-start"}
                                        ${isActive(link.href)
                                                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                                                : "text-gray-300 hover:bg-white/5 hover:text-white"
                                            }
                                    `}
                                    >
                                        <span className={`text-lg transition-colors ${isActive(link.href) ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`}>
                                            {link.icon}
                                        </span>
                                        {!collapsed && <span>{lang === 'en' ? link.name : link.nameKh}</span>}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden lg:flex flex-col bg-[#0f172a] text-white h-screen transition-all duration-300 ease-in-out
                    border-r border-gray-800
                    ${isCollapsed ? "w-20" : "w-72"}
                    sticky top-0 z-40
                `}
            >
                <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-gray-800 bg-[#0f172a]`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <FaHome className="text-white text-sm" />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                {lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}
                            </span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <FaHome className="text-white text-sm" />
                        </div>
                    )}

                    {!isCollapsed && (
                        <button onClick={toggleCollapse} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
                            <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                                <div className="w-4 h-0.5 bg-current rounded-full"></div>
                            </div>
                        </button>
                    )}
                </div>

                {/* Collapse Toggle Button (when collapsed) */}
                {isCollapsed && (
                    <div className="flex justify-center py-4 border-b border-gray-800">
                        <button onClick={toggleCollapse} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
                            <FaBars />
                        </button>
                    </div>
                )}

                {renderNav(isCollapsed)}

                {/* User Profile / Footer could go here */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-gray-800">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10">
                            <h4 className="text-sm font-semibold text-white mb-1">Need Help?</h4>
                            <p className="text-xs text-gray-400 mb-3">Check our docs</p>
                            <button className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors">
                                Documentation
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
                        onClick={onClose}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 lg:hidden w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl transition-transform duration-300">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                                    <FaHome className="text-white text-sm" />
                                </div>
                                <span className="font-bold text-lg">{lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}</span>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        {renderNav(false, onClose)}
                    </aside>
                </>
            )}
        </>
    );
};

export default Sidebar;

