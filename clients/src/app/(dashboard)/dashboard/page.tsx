"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import MetricCard from "@/components/MetricCard";
import RecentRentalsTable from "@/components/RecentRentalsTable";
import TableSkeleton from "@/components/common/TableSkeleton";
import { FaBed, FaUser, FaMoneyBillWave, FaExclamationTriangle, FaWallet, FaChartLine } from "react-icons/fa";
import { useLang } from "@/context/LangContext";
import { Rental } from "@/types/rents";
import { Bill } from "@/types/bill";
import { Expense } from "@/types/expense";
import { getAllRentals } from "@/services/rentalService";
import { getAllBills } from "@/services/billService";
import { getAllExpenses } from "@/services/expenseService";

export default function DashboardPage() {
    const { lang } = useLang();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAllRentals(), getAllBills(), getAllExpenses()])
            .then(([rentalsData, billsData, expensesData]) => {
                setRentals(rentalsData);
                setBills(billsData || []);
                setExpenses(expensesData || []);
            })
            .catch(() => {
                setRentals([]);
                setBills([]);
                setExpenses([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const totalRooms = rentals.length;
    const totalTenants = rentals.filter((r) => r.ClientName).length;

    // Calculate revenue (Paid bills)
    const totalRevenue = bills
        .filter(b => b.electricityStatus === 'Paid' && b.waterStatus === 'Paid')
        .reduce((sum, b) => sum + (Number(b.rentAmount) || 0) + Number(b.electricityAmount) + Number(b.waterAmount), 0);

    const unpaidCount = bills.filter(b => b.electricityStatus === 'Unpaid' || b.waterStatus === 'Unpaid').length;

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    const t = {
        en: {
            recentRentals: "Recent Rentals",
            totalRooms: "Total Rooms",
            totalTenants: "Total Tenants",
            totalRevenue: "Total Revenue",
            unpaidBills: "Unpaid Bills",
            totalExpenses: "Total Expenses",
            netProfit: "Net Profit"
        },
        kh: {
            recentRentals: "ការជួលថ្មីៗ",
            totalRooms: "បន្ទប់សរុប",
            totalTenants: "អ្នកជួលសរុប",
            totalRevenue: "ប្រាក់ចំណូលសរុប",
            unpaidBills: "វិក្កយបត្រមិនទាន់ទូទាត់",
            totalExpenses: "ចំណាយសរុប",
            netProfit: "ប្រាក់ចំណេញសុទ្ធ"
        },
    };

    const langKey = lang === "km" ? "kh" : lang;

    const metrics = [
        { title: t[langKey].totalRooms, value: loading ? "—" : totalRooms, icon: <FaBed size={30} /> },
        { title: t[langKey].totalTenants, value: loading ? "—" : totalTenants, icon: <FaUser size={30} /> },
        { title: t[langKey].totalRevenue, value: loading ? "—" : `$${totalRevenue.toFixed(2)}`, icon: <FaMoneyBillWave size={30} /> },
        { title: t[langKey].unpaidBills, value: loading ? "—" : unpaidCount, icon: <FaExclamationTriangle size={30} /> },
        { title: t[langKey].totalExpenses, value: loading ? "—" : `$${totalExpenses.toFixed(2)}`, icon: <FaWallet size={30} /> },
        { title: t[langKey].netProfit, value: loading ? "—" : `$${netProfit.toFixed(2)}`, icon: <FaChartLine size={30} /> },
    ];

    return (
        <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.title}
                        title={metric.title}
                        value={metric.value}
                        icon={metric.icon}
                    />
                ))}
            </div>

            {/* Recent Rentals */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                        {lang === "en" ? "Recent Rentals" : "ការជួលថ្មីៗ"}
                    </h2>
                    <Link href="/dashboard/rentals" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                        {lang === "en" ? "View All" : "មើលទាំងអស់"} &rarr;
                    </Link>
                </div>

                {loading ? (
                    <TableSkeleton rows={6} cols={5} />
                ) : (
                    <RecentRentalsTable rentals={rentals.slice(0, 10)} />
                )}
            </div>
        </div>
    );
}
