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

const BillsPage: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const data = await getAllBills();
            setBills(data);
        } catch (error) {
            console.error("Failed to fetch bills:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const filteredBills = useMemo(() => {
        if (!searchQuery.trim()) return bills;

        const lowerQuery = searchQuery.toLowerCase().replace(/\s+/g, " ").trim();

        return bills.filter((b) => {
            const clientName = (b.rental?.ClientName || "").toLowerCase().replace(/\s+/g, " ").trim();
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
                electricityStatus.includes(lowerQuery) ||
                waterStatus.includes(lowerQuery) ||
                monthEn.includes(lowerQuery) ||
                monthKm.includes(lowerQuery)
            );
        });
    }, [searchQuery, bills]);

    const stats = useMemo(() => {
        const total = bills.length;
        const unpaidCount = bills.filter(b => b.electricityStatus === 'Unpaid' || b.waterStatus === 'Unpaid').length;
        const totalRevenue = bills.reduce((acc, b) => acc + (b.electricityAmount || 0) + (b.waterAmount || 0), 0);

        return { total, unpaidCount, totalRevenue };
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

    return (
        <div className="min-h-screen pb-10">
            <main className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto">
                <BillHeader
                    onAdd={handleAdd}
                    onSearch={handleSearch}
                    onPrint={handlePrintAll}
                />

                {/* Summary Cards */}
                {!isLoading && bills.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-2">
                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-slate-500 text-sm font-medium">
                                        {lang === 'km' ? 'វិក្កយបត្រសរុប' : 'Total Bills'}
                                    </h3>
                                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-slate-500 text-sm font-medium">
                                        {lang === 'km' ? 'មិនទាន់បង់' : 'Unpaid Bills'}
                                    </h3>
                                    <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.unpaidCount}</p>
                                </div>
                                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-slate-500 text-sm font-medium">
                                        {lang === 'km' ? 'ចំណូលសរុប' : 'Total Revenue'}
                                    </h3>
                                    <p className="text-2xl font-semibold text-slate-900 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center items-center py-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredBills.length > 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <BillsList bills={filteredBills} onRefresh={fetchBills} />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">
                            {lang === "km" ? "មិនមានវិក្កយបត្រទេ" : "No Bills Found"}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-sm">
                            {lang === "km"
                                ? "ចាប់ផ្តើមដោយការបង្កើតវិក្កយបត្រថ្មីសម្រាប់អតិថិជនរបស់អ្នក។"
                                : "Start by creating a new bill for your customers to track their monthly payments."}
                        </p>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-md hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            {lang === 'km' ? 'បង្កើតវិក្កយបត្រថ្មី' : 'Create First Bill'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BillsPage;
