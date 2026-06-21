'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RentalHeader from "@/components/rentals/RentalHeader";
import RentalList from "@/components/rentals/RentalList";
import { Rental, RentalStatus } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { FaHome, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { motion } from "framer-motion";

const statusMap: { [key: string]: RentalStatus } = {
    "active": "Active",
    "reserved": "Reserved",
    "completed": "Completed",
    "maintenance": "Maintenance",
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            type: "spring" as const, 
            stiffness: 100, 
            damping: 15 
        } 
    },
};

const RentalPageContent: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { lang } = useLang();

    const statusParam = params.status;
    const statusKey =
        typeof statusParam === "string" ? statusParam.toLowerCase() : "";
    const status: RentalStatus | undefined = statusMap[statusKey];

    const [allRentals, setAllRentals] = useState<Rental[]>([]);
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams.get('search') || "";

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                setLoading(true);
                const data = await getAllRentals();
                // Initially sort by name alphabetically
                const sortedData = data.sort((a, b) =>
                    a.ClientName.localeCompare(b.ClientName, lang === 'km' ? 'km' : 'en')
                );
                setAllRentals(sortedData);

                // If there's a search query in URL, filter immediately
                if (urlSearchQuery) {
                    const normalized = urlSearchQuery.toLowerCase().trim();
                    const filtered = sortedData.filter(r => {
                        if (status && r.status !== status) return false;
                        return r.ClientName.toLowerCase().includes(normalized) ||
                            r.roomNumber.toLowerCase().includes(normalized);
                    });
                    setRentals(filtered);
                } else {
                    setRentals(status ? sortedData.filter((r) => r.status === status) : sortedData);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load rentals');
            } finally {
                setLoading(false);
            }
        };
        fetchRentals();
    }, [status, lang, urlSearchQuery]);

    const handleSearch = useCallback((query: string) => {
        const normalizedQuery = query.toLowerCase().trim();

        if (!normalizedQuery) {
            setRentals(status ? allRentals.filter(r => r.status === status) : allRentals);
            return;
        }

        const filtered = allRentals.filter((r) => {
            if (status && r.status !== status) return false;

            const tenantName = (r.ClientName || "").toLowerCase();
            const roomNumber = (r.roomNumber || "").toLowerCase();
            const phone = (r.clientPhone || "").toLowerCase();

            return (
                tenantName.includes(normalizedQuery) ||
                roomNumber.includes(normalizedQuery) ||
                phone.includes(normalizedQuery)
            );
        }).sort((a, b) => {
            // Priority 1: Exact matches or starts with the query
            const aName = a.ClientName.toLowerCase();
            const bName = b.ClientName.toLowerCase();
            const aStarts = aName.startsWith(normalizedQuery);
            const bStarts = bName.startsWith(normalizedQuery);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            // Priority 2: Standard alphabetical sort (respecting Khmer/English rules)
            return a.ClientName.localeCompare(b.ClientName, lang === 'km' ? 'km' : 'en');
        });

        setRentals(filtered);
    }, [allRentals, status, lang]);

    const handleAdd = () => router.push("/dashboard/rentals/create");

    const handleBackup = async () => {
        try {
            const response = await fetch('/api/rentals/export');
            if (!response.ok) throw new Error('Backup failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rental_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Backup error:', err);
            alert(lang === "en" ? "Failed to download backup" : "ការចម្លងទុកបានបរាជ័យ");
        }
    };

    const activeCount = allRentals.filter(r => r.status === "Active").length;
    const reservedCount = allRentals.filter(r => r.status === "Reserved").length;
    const completedCount = allRentals.filter(r => r.status === "Completed").length;
    const maintenanceCount = allRentals.filter(r => r.status === "Maintenance").length;

    const statCards = [
        {
            label: lang === "en" ? "Total Units" : "យូនីតសរុប",
            value: allRentals.length,
            icon: FaHome,
            wrapperClass: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
            desc: lang === "en" ? "Total lease contracts" : "កិច្ចសន្យាជួលសរុប",
        },
        {
            label: lang === "en" ? "Active renting" : "កំពុងជួល",
            value: activeCount,
            icon: FaCheckCircle,
            wrapperClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
            desc: lang === "en" ? "Rooms currently occupied" : "បន្ទប់កំពុងស្នាក់នៅ",
        },
        {
            label: lang === "en" ? "Reserved rooms" : "បានកក់ទុក",
            value: reservedCount,
            icon: FaClock,
            wrapperClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
            desc: lang === "en" ? "Leases pending check-in" : "រង់ចាំចូលស្នាក់នៅ",
        },
        {
            label: lang === "en" ? "Completed leases" : "បានបញ្ចប់",
            value: completedCount,
            icon: FaCheckCircle,
            wrapperClass: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50",
            desc: lang === "en" ? "Expired or closed leases" : "កិច្ចសន្យាបានបញ្ចប់",
        },
        {
            label: lang === "en" ? "Maintenance" : "ការជួសជុល",
            value: maintenanceCount,
            icon: FaTimesCircle,
            wrapperClass: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
            desc: lang === "en" ? "Units undergoing repair" : "យូនីតកំពុងជួសជុល",
        },
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-md text-sm flex items-center gap-3 shadow-sm">
                    <FaTimesCircle className="text-rose-500 flex-shrink-0 text-xl" />
                    <div>
                        <p className="font-medium text-rose-900">
                            {lang === "en" ? "Failed to load" : "ផ្ទុកបានបរាជ័យ"}
                        </p>
                        <p className="text-xs text-rose-600 mt-0.5">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={containerVariants}
        >
            <RentalHeader
                onSearch={handleSearch}
                onAdd={handleAdd}
                onBackup={handleBackup}
                totalCount={allRentals.length}
                activeCount={activeCount}
            />

            {/* Stat Cards */}
            <motion.div 
                className="grid grid-cols-2 lg:grid-cols-5 gap-4"
                variants={containerVariants}
            >
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.01 }}
                            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-slate-450 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                                        {card.label}
                                    </h3>
                                    <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{card.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-xl border ${card.wrapperClass} flex items-center justify-center shadow-sm`}>
                                    <Icon className="text-lg" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                                {card.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>

            <RentalList rentals={rentals} />
        </motion.div>
    );
};

const RentalPage: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <RentalPageContent />
        </Suspense>
    );
};

export default RentalPage;
