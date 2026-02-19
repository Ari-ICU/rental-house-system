"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import MetricCard from "@/components/MetricCard";
import RecentRentalsTable from "@/components/RecentRentalsTable";
import { FaBed, FaUser } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { getAllRentals } from "@/services/rentalService";

export default function DashboardPage() {
    const { lang } = useLang();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllRentals()
            .then(setRentals)
            .catch(() => setRentals([]))
            .finally(() => setLoading(false));
    }, []);

    const totalRooms = rentals.length;
    const totalTenants = rentals.filter((r) => r.ClientName).length;

    const t = {
        en: { recentRentals: "Recent Rentals", totalRooms: "Total Rooms", totalTenants: "Total Tenants" },
        kh: { recentRentals: "ការជួលថ្មីៗ", totalRooms: "បន្ទប់សរុប", totalTenants: "អ្នកជួលសរុប" },
    };

    const langKey = lang === "km" ? "kh" : lang;

    const metrics = [
        { title: t[langKey].totalRooms, value: loading ? "—" : totalRooms, icon: <FaBed size={30} /> },
        { title: t[langKey].totalTenants, value: loading ? "—" : totalTenants, icon: <FaUser size={30} /> },
    ];

    return (
        <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.title}
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                        bgColor="bg-white"
                    />
                ))}
            </div>

            {/* Recent Rentals */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">
                        {lang === "en" ? "Recent Rentals" : "ការជួលថ្មីៗ"}
                    </h2>
                    <Link href="/dashboard/rentals" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                        {lang === "en" ? "View All" : "មើលទាំងអស់"} &rarr;
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-7 h-7 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <RecentRentalsTable rentals={rentals.slice(0, 10)} />
                )}
            </div>
        </div>
    );
}
