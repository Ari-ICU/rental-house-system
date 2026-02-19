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
    FaHome,
    FaPlug,
    FaCog
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
                { name: "Utility Support", nameKh: "សេវាអគ្គិសនី និងទឹក", href: "/dashboard/bills", icon: <FaPlug /> },
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
                        <h3 className="px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
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
                                                    className={`relative flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${isActive(subLink.href)
                                                        ? "text-indigo-400 bg-indigo-400/5 shadow-[inset_0_0_12px_rgba(129,140,248,0.05)]"
                                                        : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                                                        }`}
                                                    onClick={onLinkClick}
                                                >
                                                    {isActive(subLink.href) && (
                                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                    )}
                                                    <div className="absolute left-[27px] top-0 bottom-0 w-px bg-slate-800" />
                                                    <span className="tracking-wide">{lang === 'en' ? subLink.name : subLink.nameKh}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href={link.href || "#"}
                                        onClick={onLinkClick}
                                        className={`
                                        group relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300
                                        ${collapsed ? "justify-center" : "justify-start"}
                                        ${isActive(link.href)
                                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl shadow-indigo-500/30"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            }
                                    `}
                                    >
                                        {isActive(link.href) && !collapsed && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                        )}
                                        <span className={`text-xl transition-all duration-300 ${isActive(link.href) ? 'scale-110' : 'group-hover:text-indigo-400 group-hover:scale-110'}`}>
                                            {link.icon}
                                        </span>
                                        {!collapsed && <span className="tracking-wide">
                                            {lang === 'en' ? link.name : link.nameKh}
                                        </span>}
                                        {isActive(link.href) && !collapsed && (
                                            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        )}
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
                    hidden lg:flex flex-col bg-[#0b0e14] text-white h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                    border-r border-slate-800/50 relative
                    ${isCollapsed ? "w-24" : "w-72"}
                    sticky top-0 z-40
                `}
            >
                {/* Subtle Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-24 -right-24 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full"></div>
                </div>

                <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-8'} relative z-10`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                <FaHome className="text-white text-lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                                    {lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}
                                </span>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] -mt-1 opacity-80">
                                    {lang === 'en' ? 'Pro Edition' : 'ការបោះពុម្ពគាំទ្រ'}
                                </span>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform duration-300">
                            <FaHome className="text-white text-xl" />
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="text-slate-500 hover:text-white transition-all bg-slate-800/30 hover:bg-slate-800 p-2 rounded-xl group"
                        >
                            <FaBars size={14} className="group-hover:rotate-90 transition-transform duration-300" />
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
                    <div className="p-6 relative z-10">
                        <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-950/80 to-slate-900/80 border border-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                            {/* Card Background Decoration */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>

                            <div className="relative z-10">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4 text-indigo-400">
                                    <FaLifeRing size={18} className="animate-[spin_10s_linear_infinite]" />
                                </div>
                                <h4 className="text-[15px] font-black text-white mb-1">
                                    {lang === 'en' ? 'Need Assistance?' : 'ត្រូវការជំនួយ?'}
                                </h4>
                                <p className="text-[11px] text-slate-400 mb-5 font-medium leading-relaxed">
                                    {lang === 'en' ? 'Our team is ready to help you with anything.' : 'ក្រុមរបស់យើងត្រៀមខ្លួនជាស្រេចដើម្បីជួយអ្នក។'}
                                </p>
                                <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[14px] text-xs font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2">
                                    <FaLifeRing size={12} />
                                    {lang === 'en' ? 'Contact Support' : 'ទាក់ទងផ្នែកគាំទ្រ'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-[#0b0e14]/80 backdrop-blur-md z-50 lg:hidden transition-opacity"
                        onClick={onClose}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 lg:hidden w-80 bg-[#0b0e14] text-white flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)] border-r border-slate-800/50 transition-transform duration-500">
                        <div className="h-24 flex items-center justify-between px-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <FaHome className="text-white text-lg" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-xl tracking-tighter">
                                        {lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}
                                    </span>
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] -mt-1">
                                        {lang === 'en' ? 'Pro Edition' : 'ការបោះពុម្ពគាំទ្រ'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-500 hover:text-white transition-all bg-slate-800/30 p-2 rounded-xl"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>
                        {renderNav(false, onClose)}
                        <div className="p-8">
                            <div className="p-6 rounded-[28px] bg-gradient-to-br from-indigo-950/50 to-slate-900/50 border border-white/5 backdrop-blur-md">
                                <h4 className="text-sm font-black text-white mb-1">Need Assistance?</h4>
                                <button className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white rounded-[14px] text-xs font-black shadow-lg shadow-indigo-600/20">
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}
        </>
    );
};

export default Sidebar;

