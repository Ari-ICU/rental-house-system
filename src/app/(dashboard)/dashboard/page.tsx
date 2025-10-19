"use client";

import MetricCard from "@/components/MetricCard";
import RecentRentalsTable from "@/components/RecentRentalsTable";
import { FaBed, FaUser } from "react-icons/fa"
import { useLang } from "@/context/LangContext";;
import { allRentals } from "@/data/rents";

export default function DashboardPage() {
    const { lang } = useLang();
    // Metrics calculation
    const totalRooms = allRentals.length;
    const totalTenants = allRentals.filter(r => r.ClientName).length;

    const t = {
        en: { recentRentals: "Recent Rentals", totalRooms: "Total Rooms", totalTenants: "Total Tenants" },
        kh: { recentRentals: "ការជួលថ្មីៗ", totalRooms: "បន្ទប់សរុប", totalTenants: "អ្នកជួលសរុប" },
    };

    const langKey = lang === "km" ? "kh" : lang;

    const metrics = [
        { title: t[langKey].totalRooms, value: totalRooms, icon: <FaBed size={30} /> },
        { title: t[langKey].totalTenants, value: totalTenants, icon: <FaUser size={30} /> },
    ];


    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div>
                <h2>{lang === "en" ? "Recent Rentals" : "ការជួលថ្មីៗ"}</h2>
                <RecentRentalsTable rentals={allRentals.slice(0, 10)} />
            </div>
        </div>
    );
}
