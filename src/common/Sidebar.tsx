'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FaTachometerAlt,
    FaFileContract,
    FaUsers,
    FaChartBar,
    FaCamera,
    FaBars,
    FaLifeRing,
    FaChevronDown,
    FaChevronUp,
    FaTimes,
} from "react-icons/fa";
import { useLang } from "@/context/LangContext";

interface LinkItem {
    name: string;
    nameKh?: string; // Khmer translation
    href?: string;
    icon?: React.ReactNode;
    subLinks?: LinkItem[];
}

interface LinkGroup {
    title: string;
    titleKh?: string; // Khmer translation
    links: LinkItem[];
}

const Sidebar: React.FC<{ isMobileOpen: boolean; onClose: () => void }> = ({ isMobileOpen, onClose }) => {
    const { lang } = useLang();
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

    const renderNav = (collapsed: boolean, onLinkClick?: () => void) => (
        <nav className="flex-1 overflow-y-auto mt-4">
            {linkGroups.map((group) => (
                <div key={group.title} className="mb-4">
                    {!collapsed && (
                        <span className="px-4 text-gray-400 uppercase text-xs tracking-wider">
                            {lang === 'en' ? group.title : group.titleKh}
                        </span>
                    )}
                    {group.links.map((link) => (
                        <div key={link.name} className="flex flex-col">
                            {link.subLinks ? (
                                <>
                                    <div
                                        className={`flex items-center ${
                                            collapsed ? "justify-center" : "justify-between"
                                        } gap-4 p-4 hover:bg-gray-700 transition-colors cursor-pointer`}
                                    >
                                        <Link
                                            href={link.href || "#"}
                                            className="flex items-center gap-4 flex-1"
                                            onClick={onLinkClick}
                                        >
                                            <span className="text-lg">{link.icon}</span>
                                            {!collapsed && <span>{lang === 'en' ? link.name : link.nameKh}</span>}
                                        </Link>
                                        {!collapsed && (
                                            <button
                                                onClick={() => toggleDropdown(link.name)}
                                                className="p-2 hover:bg-gray-700 rounded text-white focus:outline-none"
                                            >
                                                <span className="text-sm">
                                                    {openDropdowns[link.name] ? <FaChevronUp /> : <FaChevronDown />}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    {openDropdowns[link.name] &&
                                        !collapsed &&
                                        link.subLinks.map((subLink) => (
                                            <Link
                                                key={subLink.name}
                                                href={subLink.href || "#"}
                                                className="flex items-center gap-4 pl-12 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                                                onClick={onLinkClick}
                                            >
                                                <span className="text-lg">{subLink.icon}</span>
                                                <span>{lang === 'en' ? subLink.name : subLink.nameKh}</span>
                                            </Link>
                                        ))}
                                </>
                            ) : (
                                <Link
                                    href={link.href || "#"}
                                    className={`flex items-center gap-4 p-4 hover:bg-gray-700 transition-colors ${
                                        collapsed ? "justify-center" : "justify-start"
                                    }`}
                                    onClick={onLinkClick}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {!collapsed && <span>{lang === 'en' ? link.name : link.nameKh}</span>}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden lg:flex bg-gray-800 text-white h-screen transition-all duration-300 flex flex-col
                    ${isCollapsed ? "w-16" : "w-64"}
                    sticky top-0 z-40
                `}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <span
                        className={`font-bold text-lg transition-all duration-300 ${
                            isCollapsed ? "opacity-0 w-0 overflow-hidden" : ""
                        }`}
                    >
                        {lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}
                    </span>
                    <button onClick={toggleCollapse} className="text-white focus:outline-none">
                        <FaBars />
                    </button>
                </div>
                {renderNav(isCollapsed)}
            </aside>

            {/* Mobile Sidebar */}
            {isMobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                        onClick={onClose}
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 lg:hidden w-full bg-gray-800 text-white flex flex-col max-w-sm">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <span className="font-bold text-lg">{lang === 'en' ? 'RentManager' : 'គ្រប់គ្រងជួល'}</span>
                            <button onClick={onClose} className="text-white focus:outline-none">
                                <FaTimes />
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
