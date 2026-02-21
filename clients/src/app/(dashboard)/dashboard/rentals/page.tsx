'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import RentalHeader from "@/components/rentals/RentalHeader";
import RentalList from "@/components/rentals/RentalList";
import { Rental, RentalStatus } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { FaHome, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

const statusMap: { [key: string]: RentalStatus } = {
    "active": "Active",
    "reserved": "Reserved",
    "completed": "Completed",
    "maintenance": "Maintenance",
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
            wrapperClass: "bg-indigo-50 text-indigo-600",
        },
        {
            label: lang === "en" ? "Renting" : "កំពុងជួល",
            value: activeCount,
            icon: FaCheckCircle,
            wrapperClass: "bg-emerald-50 text-emerald-600",
        },
        {
            label: lang === "en" ? "Reserved" : "បានកក់",
            value: reservedCount,
            icon: FaClock,
            wrapperClass: "bg-blue-50 text-blue-600",
        },
        {
            label: lang === "en" ? "Completed" : "បានបញ្ចប់",
            value: completedCount,
            icon: FaCheckCircle,
            wrapperClass: "bg-slate-100 text-slate-600",
        },
        {
            label: lang === "en" ? "Maintenance" : "ការជួសជុល",
            value: maintenanceCount,
            icon: FaTimesCircle,
            wrapperClass: "bg-rose-50 text-rose-600",
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
        <div className="space-y-6">
            <RentalHeader
                onSearch={handleSearch}
                onAdd={handleAdd}
                onBackup={handleBackup}
                totalCount={allRentals.length}
                activeCount={activeCount}
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                                        {card.label}
                                    </h3>
                                    <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-md ${card.wrapperClass}`}>
                                    <Icon className="text-lg" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <RentalList rentals={rentals} />
        </div>
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
