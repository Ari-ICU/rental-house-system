"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTools, FaCheckCircle } from "react-icons/fa";
import { getAllBills } from "@/services/billService";
import { getAllRentals } from "@/services/rentalService";
import { useLang } from "@/context/LangContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface AppNotification {
    id: string;
    title: string;
    titleKm: string;
    message: string;
    messageKm: string;
    type: "info" | "warning" | "error" | "success";
    timestamp: string;
    link: string;
}

export default function NotificationCenter() {
    const { lang } = useLang();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch and build notifications list
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const [bills, rentals] = await Promise.all([getAllBills(), getAllRentals()]);

                const list: AppNotification[] = [];

                // 1. Unpaid Bills -> Warnings
                bills.forEach((b) => {
                    const isRentUnpaid = b.electricityStatus === "Unpaid" || b.waterStatus === "Unpaid";
                    if (isRentUnpaid) {
                        const total = (Number(b.rentAmount || 0) + Number(b.electricityAmount) + Number(b.waterAmount)).toFixed(2);
                        list.push({
                            id: `bill-unpaid-${b.id}`,
                            title: `Payment Due: Room ${b.rental?.roomNumber || 'N/A'}`,
                            titleKm: `វិក្កយបត្រត្រូវបង់៖ បន្ទប់ ${b.rental?.roomNumber || 'N/A'}`,
                            message: `Rent & Utilities are unpaid for ${b.month}. Total: $${total}`,
                            messageKm: `ថ្លៃជួល និងសេវាកម្មមិនទាន់ទូទាត់សម្រាប់ខែ ${b.month}។ សរុប៖ $${total}`,
                            type: "warning",
                            timestamp: b.createdAt || new Date().toISOString(),
                            link: `/dashboard/bills`,
                        });
                    }
                });

                // 2. Reserved & Maintenance Rentals
                rentals.forEach((r) => {
                    if (r.status === "Reserved") {
                        list.push({
                            id: `rental-reserved-${r.id}`,
                            title: `Room ${r.roomNumber} Reserved`,
                            titleKm: `បន្ទប់ ${r.roomNumber} ត្រូវបានកក់ទុក`,
                            message: `Reserved by ${r.ClientName} starting ${r.startDate || 'soon'}.`,
                            messageKm: `កក់ទុកដោយ ${r.ClientName} ចាប់ផ្តើមពីថ្ងៃទី ${r.startDate || 'ឆាប់ៗ'}។`,
                            type: "info",
                            timestamp: r.createdAt || new Date().toISOString(),
                            link: `/dashboard/rentals/${r.id}`,
                        });
                    } else if (r.status === "Maintenance") {
                        list.push({
                            id: `rental-maint-${r.id}`,
                            title: `Room ${r.roomNumber} Maintenance`,
                            titleKm: `បន្ទប់ ${r.roomNumber} កំពុងជួសជុល`,
                            message: `Room status set to maintenance.`,
                            messageKm: `ស្ថានភាពបន្ទប់ត្រូវបានផ្លាស់ប្តូរទៅជាកំពុងជួសជុល។`,
                            type: "error",
                            timestamp: r.updatedAt || new Date().toISOString(),
                            link: `/dashboard/rentals/${r.id}`,
                        });
                    }
                });

                // Sort by timestamp descending
                list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setNotifications(list);
            } catch (err) {
                console.error("Failed to load notifications:", err);
            }
        };

        loadNotifications();
    }, []);

    // Load read state from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("read-notifications");
        if (stored) {
            try {
                setReadIds(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Toggle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const unreadNotifications = notifications.filter((n) => !readIds.includes(n.id));
    const unreadCount = unreadNotifications.length;

    const markAsRead = (id: string) => {
        if (!readIds.includes(id)) {
            const next = [...readIds, id];
            setReadIds(next);
            localStorage.setItem("read-notifications", JSON.stringify(next));
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map((n) => n.id);
        setReadIds(allIds);
        localStorage.setItem("read-notifications", JSON.stringify(allIds));
    };

    const handleNotificationClick = (n: AppNotification) => {
        markAsRead(n.id);
        setIsOpen(false);
        router.push(n.link);
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return lang === "en" ? "Just now" : "មុននេះបន្តិច";
        if (diffMins < 60) return lang === "en" ? `${diffMins}m ago` : `${diffMins}នាទីមុន`;
        if (diffHours < 24) return lang === "en" ? `${diffHours}h ago` : `${diffHours}ម៉ោងមុន`;
        return lang === "en" ? `${diffDays}d ago` : `${diffDays}ថ្ងៃមុន`;
    };

    const getIcon = (type: AppNotification["type"]) => {
        switch (type) {
            case "warning":
                return <FaExclamationTriangle className="text-amber-500 text-base shrink-0" />;
            case "error":
                return <FaTools className="text-rose-500 text-base shrink-0" />;
            case "success":
                return <FaCheckCircle className="text-emerald-500 text-base shrink-0" />;
            default:
                return <FaInfoCircle className="text-blue-500 text-base shrink-0" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors relative"
                aria-label="View notifications"
            >
                <FaBell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-slate-950 animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden z-50 flex flex-col max-h-[480px]"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {lang === "en" ? "Notifications" : "ការជូនដំណឹង"}
                                {unreadCount > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] rounded-full font-medium">
                                        {unreadCount} {lang === "en" ? "new" : "ថ្មី"}
                                    </span>
                                )}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                                >
                                    <FaCheck className="text-[9px]" />
                                    {lang === "en" ? "Mark all as read" : "ដៅថាអានរួចទាំងអស់"}
                                </button>
                            )}
                        </div>

                        {/* List Items */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2">
                                    <FaBell className="text-2xl opacity-20" />
                                    <p className="text-xs font-medium">
                                        {lang === "en" ? "No notifications yet" : "មិនទាន់មានការជូនដំណឹងនៅឡើយទេ"}
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const isRead = readIds.includes(n.id);
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-left transition-colors flex gap-3 items-start relative ${
                                                !isRead ? "bg-indigo-50/10 dark:bg-indigo-500/5" : ""
                                            }`}
                                        >
                                            {/* Unread Indicator Dot */}
                                            {!isRead && (
                                                <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                                            )}

                                            <div className="mt-0.5">{getIcon(n.type)}</div>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <h4 className={`text-xs font-semibold text-slate-800 dark:text-slate-100 ${!isRead ? "font-bold" : ""}`}>
                                                    {lang === "en" ? n.title : n.titleKm}
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                                                    {lang === "en" ? n.message : n.messageKm}
                                                </p>
                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-1.5">
                                                    {formatTimeAgo(n.timestamp)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
