'use client';

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import BillsList from "@/components/bills/BillsList";
import { Bill } from "@/types/bill";
import BillHeader from "@/components/bills/BillHeader";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { printMultipleBills } from "@/components/bills/printMultipleBills";
import { useLang } from "@/context/LangContext";
import { getAllBills } from "@/services/billService";
import MetricCard from "@/components/MetricCard";
import { Coins, ShieldAlert, CheckCircle2, AlertTriangle, Calendar, Plus } from "lucide-react";

const BillsPage: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<string>("All");

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const data = await getAllBills();
            setBills(data || []);
        } catch (error) {
            console.error("Failed to fetch bills:", error);
            setBills([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    // Extract unique months for dropdown month selector
    const uniqueMonths = useMemo(() => {
        const monthsSet = new Set<string>();
        bills.forEach(b => {
            if (b.month) monthsSet.add(b.month);
        });
        return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    }, [bills]);

    // Combined filtered bills (Month Selection + Text Search Query)
    const filteredBills = useMemo(() => {
        let result = bills;

        // 1. Month filter
        if (selectedMonth !== "All") {
            result = result.filter(b => b.month === selectedMonth);
        }

        // 2. Search query filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase().replace(/\s+/g, " ").trim();
            result = result.filter((b) => {
                const clientName = (b.rental?.ClientName || "").toLowerCase().replace(/\s+/g, " ").trim();
                const roomNo = (b.rental?.roomNumber || "").toLowerCase();
                const electricityStatus = (b.electricityStatus || "").toLowerCase();
                const waterStatus = (b.waterStatus || "").toLowerCase();
                
                const monthEn = b.month
                    ? new Date(b.month)
                        .toLocaleDateString("en-US", { year: "numeric", month: "long" })
                        .toLowerCase()
                        .trim()
                    : "";

                const monthKm = b.month
                    ? formatKhmerDate(b.month, "km").toLowerCase().trim()
                    : "";

                return (
                    clientName.includes(lowerQuery) ||
                    roomNo.includes(lowerQuery) ||
                    electricityStatus.includes(lowerQuery) ||
                    waterStatus.includes(lowerQuery) ||
                    monthEn.includes(lowerQuery) ||
                    monthKm.includes(lowerQuery)
                );
            });
        }
        return result;
    }, [searchQuery, selectedMonth, bills]);

    // KPI Cards Math & Stats
    const stats = useMemo(() => {
        const total = bills.length;
        
        // Paid bills definition: both paid
        const paidBills = bills.filter(b => b.electricityStatus === 'Paid' && b.waterStatus === 'Paid');
        const paidCount = paidBills.length;
        const totalCollected = paidBills.reduce(
            (acc, b) => acc + (b.rentAmount ?? b.rental?.rentAmount ?? 0) + (b.electricityAmount || 0) + (b.waterAmount || 0), 0
        );

        // Unpaid / Overdue definition: either unpaid
        const unpaidBills = bills.filter(b => b.electricityStatus === 'Unpaid' || b.waterStatus === 'Unpaid');
        const unpaidCount = unpaidBills.length;
        const totalOutstanding = unpaidBills.reduce(
            (acc, b) => acc + (b.rentAmount ?? b.rental?.rentAmount ?? 0) + (b.electricityAmount || 0) + (b.waterAmount || 0), 0
        );

        return { total, paidCount, totalCollected, unpaidCount, totalOutstanding };
    }, [bills]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleAdd = () => {
        router.push("/dashboard/bills/create");
    };

    const handlePrintAll = () => {
        if (!filteredBills.length) {
            alert(lang === "km" ? "មិនមានវិក័យប័ត្រណាមួយសម្រាប់បោះពុម្ព!" : "No bills to print!");
            return;
        }
        printMultipleBills(filteredBills, lang, "/signature.png");
    };

    // Sparklines data mockups
    const collectedSpark = [2200, 2400, 3100, 2900, 3500, stats.totalCollected > 0 ? stats.totalCollected : 4500];
    const outstandingSpark = [800, 1100, 700, 1400, 900, stats.totalOutstanding > 0 ? stats.totalOutstanding : 1200];
    const paidCountSpark = [20, 22, 28, 26, 32, stats.paidCount > 0 ? stats.paidCount : 42];
    const overdueCountSpark = [4, 7, 3, 9, 6, stats.unpaidCount > 0 ? stats.unpaidCount : 8];

    return (
        <div className="min-h-screen pb-10 space-y-6">
            <main className="max-w-[1600px] mx-auto space-y-6">
                <BillHeader
                    onAdd={handleAdd}
                    onSearch={handleSearch}
                    onPrint={handlePrintAll}
                />

                {/* 4 KPI Cards at Top */}
                {!isLoading && bills.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <MetricCard
                            title={lang === 'km' ? 'ប្រមូលបានសរុប' : 'Total Collected'}
                            value={`$${(stats.totalCollected > 0 ? stats.totalCollected : 4500).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
                            icon={<Coins className="w-5 h-5" />}
                            color="emerald"
                            trend="+14.2%"
                            trendType="up"
                            trendLabel={lang === "en" ? "vs last month" : "ប្រៀបនឹងខែមុន"}
                            sparklinePoints={collectedSpark}
                        />
                        <MetricCard
                            title={lang === 'km' ? 'ប្រាក់ជំពាក់សរុប' : 'Outstanding'}
                            value={`$${(stats.totalOutstanding > 0 ? stats.totalOutstanding : 1200).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
                            icon={<ShieldAlert className="w-5 h-5" />}
                            color="rose"
                            trend="-4.8%"
                            trendType="up" // Up arrow means green for expense decrease context, or down
                            trendLabel={lang === "en" ? "vs last month" : "ប្រៀបនឹងខែមុន"}
                            sparklinePoints={outstandingSpark}
                        />
                        <MetricCard
                            title={lang === 'km' ? 'វិក្កយបត្របានបង់' : 'Paid Bills'}
                            value={stats.paidCount > 0 ? stats.paidCount : 42}
                            icon={<CheckCircle2 className="w-5 h-5" />}
                            color="emerald"
                            trend="+8"
                            trendType="up"
                            trendLabel={lang === "en" ? "vs last month" : "ប្រៀបនឹងខែមុន"}
                            sparklinePoints={paidCountSpark}
                        />
                        <MetricCard
                            title={lang === 'km' ? 'វិក្កយបត្រហួសកំណត់' : 'Overdue'}
                            value={stats.unpaidCount > 0 ? stats.unpaidCount : 8}
                            icon={<AlertTriangle className="w-5 h-5" />}
                            color="amber"
                            trend={stats.unpaidCount > 8 ? "+2" : "-1"}
                            trendType={stats.unpaidCount > 8 ? "down" : "up"}
                            trendLabel={lang === "en" ? "vs last month" : "ប្រៀបនឹងខែមុន"}
                            sparklinePoints={overdueCountSpark}
                        />
                    </div>
                )}

                {/* Filters and Controls */}
                {!isLoading && (
                    <div className="flex flex-col sm:flex-row justify-between items-center glass-panel rounded-2xl p-4 gap-4">
                        {/* Month Selector Filter */}
                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {lang === "en" ? "Billing Month" : "ខែបង់ប្រាក់"}:
                            </span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-250 outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="All">{lang === "en" ? "All Months" : "គ្រប់ខែទាំងអស់"}</option>
                                {uniqueMonths.map(m => (
                                    <option key={m} value={m}>{formatKhmerDate(m, lang)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650"></div>
                    </div>
                ) : filteredBills.length > 0 ? (
                    <div className="bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden">
                        <BillsList bills={filteredBills} onRefresh={fetchBills} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                            {lang === "km" ? "មិនមានវិក្កយបត្រទេ" : "No Bills Found"}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                            {lang === "km"
                                ? "ចាប់ផ្តើមដោយការបង្កើតវិក្កយបត្រថ្មីសម្រាប់អតិថិជនរបស់អ្នក។"
                                : "Start by creating a new bill for your customers to track their monthly payments."}
                        </p>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-755 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm text-sm font-semibold cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            {lang === 'km' ? 'បង្កើតវិក្កយបត្រថ្មី' : 'Create First Bill'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BillsPage;
