'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import RentalHeader from "@/components/rentals/RentalHeader";
import RentalList from "@/components/rentals/RentalList";
import { Rental, RentalStatus } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { FaHome, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useLang } from "@/context/LangContext";

const statusMap: { [key: string]: RentalStatus } = {
    "in-active": "In-Active",
    "non-active": "Non-Active",
    past: "Past",
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

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                setLoading(true);
                const data = await getAllRentals();
                setAllRentals(data);
                setRentals(status ? data.filter((r) => r.status === status) : data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load rentals');
            } finally {
                setLoading(false);
            }
        };
        fetchRentals();
    }, [status]);

    const handleSearch = useCallback((query: string) => {
        const normalizedQuery = query
            .toLowerCase()
            .replace(/\//g, "-")
            .replace(/\s+/g, " ")
            .trim();

        const filtered = allRentals.filter((r) => {
            if (status && r.status !== status) return false;
            const tenantName = r.ClientName.toLowerCase().replace(/\s+/g, " ").trim();
            const roomNumber = r.roomNumber.toLowerCase().replace(/\s+/g, " ").trim();
            const startDate = r.startDate?.toLowerCase().replace(/\s+/g, " ").trim() || "";
            const endDate = r.endDate?.toLowerCase().replace(/\s+/g, " ").trim() || "";
            const khStartDate = r.startDate ? formatKhmerDate(r.startDate, "km").toLowerCase().replace(/\s+/g, " ").trim() : "";
            const khEndDate = r.endDate ? formatKhmerDate(r.endDate, "km").toLowerCase().replace(/\s+/g, " ").trim() : "";
            return (
                tenantName.includes(normalizedQuery) ||
                roomNumber.includes(normalizedQuery) ||
                startDate.includes(normalizedQuery) ||
                endDate.includes(normalizedQuery) ||
                khStartDate.includes(normalizedQuery) ||
                khEndDate.includes(normalizedQuery)
            );
        });
        setRentals(filtered);
    }, [allRentals, status]);

    const handleAdd = () => router.push("/dashboard/rentals/create");

    const activeCount = allRentals.filter(r => r.status === "In-Active").length;
    const inactiveCount = allRentals.filter(r => r.status === "Non-Active").length;
    const pastCount = allRentals.filter(r => r.status === "Past").length;

    const statCards = [
        {
            label: lang === "en" ? "Total Rentals" : "ការជួលសរុប",
            value: allRentals.length,
            icon: FaHome,
            color: "from-violet-500 to-indigo-600",
            shadow: "shadow-violet-200",
            bg: "bg-violet-50",
            text: "text-violet-700",
        },
        {
            label: lang === "en" ? "Active" : "សកម្ម",
            value: activeCount,
            icon: FaCheckCircle,
            color: "from-emerald-500 to-teal-600",
            shadow: "shadow-emerald-200",
            bg: "bg-emerald-50",
            text: "text-emerald-700",
        },
        {
            label: lang === "en" ? "Inactive" : "មិនសកម្ម",
            value: inactiveCount,
            icon: FaTimesCircle,
            color: "from-gray-400 to-gray-500",
            shadow: "shadow-gray-200",
            bg: "bg-gray-50",
            text: "text-gray-600",
        },
        {
            label: lang === "en" ? "Past" : "កន្លងផុត",
            value: pastCount,
            icon: FaClock,
            color: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-200",
            bg: "bg-amber-50",
            text: "text-amber-700",
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
