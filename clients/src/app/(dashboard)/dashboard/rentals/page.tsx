'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RentalHeader from "@/components/rentals/RentalHeader";
import RentalList from "@/components/rentals/RentalList";
import { Rental, RentalStatus } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { FaHome, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

const statusMap: { [key: string]: RentalStatus } = {
    "active": "Active",
    "reserved": "Reserved",
    "completed": "Completed",
    "maintenance": "Maintenance",
};

const RentalPage: React.FC = () => {
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
            color: "from-violet-500 to-indigo-600",
            shadow: "shadow-violet-200",
            bg: "bg-violet-50",
            text: "text-violet-700",
        },
        {
            label: lang === "en" ? "Renting" : "កំពុងជួល",
            value: activeCount,
            icon: FaCheckCircle,
            color: "from-emerald-500 to-teal-600",
            shadow: "shadow-emerald-200",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
        },
        {
            label: lang === "en" ? "Reserved" : "បានកក់",
            value: reservedCount,
            icon: FaClock,
            color: "from-blue-500 to-indigo-500",
            shadow: "shadow-blue-200",
            bg: "bg-blue-50",
            text: "text-blue-700",
        },
        {
            label: lang === "en" ? "Completed" : "បានបញ្ចប់",
            value: completedCount,
            icon: FaHome,
            color: "from-gray-400 to-gray-500",
            shadow: "shadow-gray-200",
            bg: "bg-gray-50",
            text: "text-gray-600",
        },
        {
            label: lang === "en" ? "Maintenance" : "ការជួសជុល",
            value: maintenanceCount,
            icon: FaTimesCircle,
            color: "from-rose-500 to-pink-500",
            shadow: "shadow-rose-200",
            bg: "bg-rose-50",
            text: "text-rose-700",
        },
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200 animate-pulse">
                        <FaHome className="text-white text-lg" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">
                            {lang === "en" ? "Loading rentals..." : "កំពុងផ្ទុក..."}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {lang === "en" ? "Please wait a moment" : "សូមរង់ចាំ"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl text-sm flex items-center gap-3 shadow-sm">
                    <FaTimesCircle className="text-red-400 flex-shrink-0 text-xl" />
                    <div>
                        <p className="font-semibold">
                            {lang === "en" ? "Failed to load" : "ផ្ទុកបានបរាជ័យ"}
                        </p>
                        <p className="text-xs text-red-400 mt-0.5">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <RentalHeader
                onSearch={handleSearch}
                onAdd={handleAdd}
                onBackup={handleBackup}
                totalCount={allRentals.length}
                activeCount={activeCount}
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                        >
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md ${card.shadow} flex-shrink-0`}>
                                <Icon className="text-white text-base" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-xs text-gray-400 leading-tight">{card.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <RentalList rentals={rentals} />
        </div>
    );
};

export default RentalPage;
