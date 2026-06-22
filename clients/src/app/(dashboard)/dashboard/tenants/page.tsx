"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { getAllRentals } from "@/services/rentalService";
import { Rental } from "@/types/rents";
import TableSkeleton from "@/components/common/TableSkeleton";
import { 
    Users, 
    Phone, 
    Mail, 
    MessageSquare, 
    Home, 
    Calendar, 
    Briefcase,
    Search,
    ArrowUpRight
} from "lucide-react";
import { formatKhmerDate } from "@/utils/dateFormatter";

export default function TenantsPage() {
    const { lang } = useLang();
    const router = useRouter();
    
    const [allRentals, setAllRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("Active");

    const fetchTenants = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllRentals();
            // Sort by client name alphabetically
            const sorted = (data || []).sort((a, b) =>
                a.ClientName.localeCompare(b.ClientName, lang === 'km' ? 'km' : 'en')
            );
            setAllRentals(sorted);
        } catch (err) {
            console.error("Failed to fetch tenants:", err);
            setAllRentals([]);
        } finally {
            setLoading(false);
        }
    }, [lang]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    // Filter unique tenants list
    const filteredTenants = useMemo(() => {
        let result = allRentals;

        // Filter by lease status
        if (statusFilter !== "All") {
            result = result.filter(r => r.status === statusFilter);
        }

        // Filter by text search query
        if (search.trim()) {
            const query = search.toLowerCase().trim();
            result = result.filter(r => 
                r.ClientName.toLowerCase().includes(query) ||
                r.roomNumber.toLowerCase().includes(query) ||
                (r.clientPhone && r.clientPhone.includes(query)) ||
                (r.occupation && r.occupation.toLowerCase().includes(query))
            );
        }

        return result;
    }, [allRentals, statusFilter, search]);

    const t = {
        en: {
            title: "Tenant Directory",
            sub: "Manage and contact property tenants easily.",
            searchPlaceholder: "Search by tenant name, room, phone...",
            all: "All Statuses",
            active: "Active Tenants",
            reserved: "Upcoming (Reserved)",
            completed: "Past Tenants",
            noTenants: "No tenants match your search",
            phone: "Phone",
            startDate: "Start Date",
            occupation: "Occupation",
            viewContract: "View Contract",
            room: "Room",
            whatsapp: "Chat on WhatsApp",
            call: "Call Phone",
            email: "Send Email"
        },
        km: {
            title: "បញ្ជីឈ្មោះអ្នកជួល",
            sub: "គ្រប់គ្រង និងទំនាក់ទំនងជាមួយអ្នកស្នាក់នៅបន្ទប់បានយ៉ាងងាយស្រួល។",
            searchPlaceholder: "ស្វែងរកតាមឈ្មោះអ្នកជួល, លេខបន្ទប់, លេខទូរស័ព្ទ...",
            all: "គ្រប់ស្ថានភាព",
            active: "កំពុងស្នាក់នៅ",
            reserved: "បានកក់ទុក (រង់ចាំចូល)",
            completed: "ធ្លាប់ស្នាក់នៅ (បញ្ចប់)",
            noTenants: "រកមិនឃើញអ្នកជួលស្របតាមតម្រងឡើយ",
            phone: "លេខទូរស័ព្ទ",
            startDate: "ថ្ងៃចូលស្នាក់នៅ",
            occupation: "មុខរបរ",
            viewContract: "មើលកិច្ចសន្យា",
            room: "បន្ទប់",
            whatsapp: "ផ្ញើសារតាម WhatsApp",
            call: "ខលទូរស័ព្ទ",
            email: "ផ្ញើអ៊ីមែល"
        }
    };

    const activeLang = lang === "km" ? "km" : "en";

    const getStatusBadge = (status: Rental["status"]) => {
        switch (status) {
            case "Active":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/50";
            case "Reserved":
                return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-450 border border-amber-200 dark:border-amber-900/50";
            default:
                return "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-800";
        }
    };

    const getStatusLabel = (status: Rental["status"]) => {
        if (status === "Active") return lang === "en" ? "Active" : "កំពុងស្នាក់នៅ";
        if (status === "Reserved") return lang === "en" ? "Reserved" : "បានកក់ទុក";
        return lang === "en" ? "Completed" : "បានបញ្ចប់";
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                        {t[activeLang].title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        {t[activeLang].sub}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {filteredTenants.length} {lang === "en" ? "people" : "នាក់"}
                    </span>
                </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel rounded-2xl p-4 shadow-sm">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder={t[activeLang].searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 dark:border-slate-850 rounded-xl outline-none bg-slate-50/50 dark:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                    />
                </div>

                {/* Status Switcher tabs */}
                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto shrink-0 justify-end">
                    {[
                        { key: "All", label: t[activeLang].all },
                        { key: "Active", label: t[activeLang].active },
                        { key: "Reserved", label: t[activeLang].reserved },
                        { key: "Completed", label: t[activeLang].completed }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                statusFilter === tab.key
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid display */}
            {loading ? (
                <TableSkeleton rows={6} cols={3} />
            ) : filteredTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl">
                    <Users className="w-10 h-10 opacity-20 text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-650 dark:text-slate-400">
                        {t[activeLang].noTenants}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => {
                        const sanitizedPhone = tenant.clientPhone ? tenant.clientPhone.replace(/\D/g, "") : "";
                        return (
                            <div 
                                key={tenant.id}
                                className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5.5 flex flex-col justify-between hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300"
                            >
                                <div className="space-y-4">
                                    {/* Header Name & Room */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                                                {tenant.ClientName}
                                            </h4>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-indigo-650 dark:text-indigo-400 font-bold">
                                                <Home className="w-3.5 h-3.5" />
                                                <span>{t[activeLang].room} {tenant.roomNumber}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 uppercase tracking-wide ${getStatusBadge(tenant.status)}`}>
                                            {getStatusLabel(tenant.status)}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-650 dark:text-slate-400">
                                        {tenant.clientPhone && (
                                            <p className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="font-semibold">{tenant.clientPhone}</span>
                                            </p>
                                        )}
                                        {tenant.clientEmail && (
                                            <p className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{tenant.clientEmail}</span>
                                            </p>
                                        )}
                                        {tenant.occupation && (
                                            <p className="flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span>{tenant.occupation}</span>
                                            </p>
                                        )}
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{t[activeLang].startDate}: {tenant.startDate ? formatKhmerDate(tenant.startDate, lang) : "—"}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                                    {/* Call/Message Utils */}
                                    <div className="flex gap-2">
                                        {tenant.clientPhone && (
                                            <>
                                                <a 
                                                    href={`tel:${tenant.clientPhone}`}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors shadow-sm"
                                                    title={t[activeLang].call}
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </a>
                                                <a 
                                                    href={`https://wa.me/${sanitizedPhone}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors shadow-sm"
                                                    title={t[activeLang].whatsapp}
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </a>
                                            </>
                                        )}
                                        {tenant.clientEmail && (
                                            <a 
                                                href={`mailto:${tenant.clientEmail}`}
                                                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors shadow-sm"
                                                title={t[activeLang].email}
                                            >
                                                <Mail className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Link to detail page */}
                                    <button 
                                        onClick={() => router.push(`/dashboard/rentals/${tenant.id}`)}
                                        className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
                                    >
                                        <span>{t[activeLang].viewContract}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
