'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaCalendarAlt, FaInbox, FaSort, FaSortUp, FaSortDown, FaFileCsv, FaTrashAlt } from "react-icons/fa";
import CustomDropdown from "@/common/CustomDropdown";

import { Rental, RentalStatus } from "@/types/rents";
import { formatKhmerDate } from "@/utils/dateFormatter";
import KhmerCalendar from "@/utils/KhmerCalendar";
import { useLang } from "@/context/LangContext";
import { deleteRental, updateRental } from "@/services/rentalService";
import { motion, AnimatePresence } from "framer-motion";

interface RentalListProps {
    rentals: Rental[];
    itemsPerPageOptions?: number[];
}

const statusConfig: { [key in RentalStatus]: { label: string; labelKm: string; dot: string; badge: string } } = {
    "Active": { label: "Active", labelKm: "កំពុងជួល", dot: "bg-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    "Reserved": { label: "Reserved", labelKm: "កក់ទុក", dot: "bg-blue-400", badge: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" },
    "Completed": { label: "Completed", labelKm: "បានបញ្ចប់", dot: "bg-slate-400", badge: "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400" },
    "Maintenance": { label: "Maintenance", labelKm: "កំពុងជួសជុល", dot: "bg-rose-400", badge: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400" },
};

const allStatuses: RentalStatus[] = ["Active", "Reserved", "Completed", "Maintenance"];

const avatarGradients = [
    'from-violet-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
];

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
}

const calculateLeaseProgress = (startStrStr?: string, endStrStr?: string) => {
    if (!startStrStr || !endStrStr) return null;
    try {
        const start = new Date(startStrStr).getTime();
        const end = new Date(endStrStr).getTime();
        const now = new Date().getTime();
        if (isNaN(start) || isNaN(end) || end <= start) return null;

        const total = end - start;
        const elapsed = now - start;
        const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));

        const remainingMs = end - now;
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

        return { percent, remainingDays };
    } catch (e) {
        return null;
    }
};

const StatusBadge: React.FC<{ status: RentalStatus; lang: string }> = ({ status, lang }) => {
    const cfg = statusConfig[status] || statusConfig.Active;
    
    let pulseColor = "";
    if (status === "Active") pulseColor = "bg-emerald-400";
    else if (status === "Reserved") pulseColor = "bg-blue-400";
    else if (status === "Maintenance") pulseColor = "bg-rose-400";

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${cfg.badge} border border-transparent dark:border-slate-800/40`}>
            {pulseColor ? (
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColor} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColor}`}></span>
                </span>
            ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mr-1.5" />
            )}
            {lang === "en" ? cfg.label : cfg.labelKm}
        </span>
    );
};

const LeaseProgressBar: React.FC<{ startDate?: string; endDate?: string; lang: string }> = ({ startDate, endDate, lang }) => {
    const progress = calculateLeaseProgress(startDate, endDate);
    if (!progress) return null;

    const { percent, remainingDays } = progress;
    
    let barColor = "bg-indigo-600 dark:bg-indigo-500";
    let textColor = "text-slate-500 dark:text-slate-400";
    let labelText = "";
    
    if (remainingDays <= 0) {
        barColor = "bg-rose-500";
        textColor = "text-rose-600 dark:text-rose-400 font-semibold animate-pulse";
        labelText = lang === "en" ? "Expired" : "ហួសកំណត់";
    } else if (remainingDays <= 30) {
        barColor = "bg-amber-500 animate-pulse";
        textColor = "text-amber-600 dark:text-amber-400 font-semibold";
        labelText = lang === "en" ? `${remainingDays}d left` : `នៅសល់ ${remainingDays}ថ្ងៃ`;
    } else {
        labelText = lang === "en" ? `${remainingDays}d left` : `នៅសល់ ${remainingDays}ថ្ងៃ`;
    }

    return (
        <div className="w-full mt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[9px] font-semibold">
                <span className={textColor}>{labelText}</span>
                <span className="text-slate-400 dark:text-slate-500">{Math.round(percent)}%</span>
            </div>
            <div className="w-full h-1 bg-slate-105 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${barColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

const RentalList: React.FC<RentalListProps> = ({
    rentals = [],
    itemsPerPageOptions = [10, 20],
}) => {
    const router = useRouter();
    const { lang } = useLang();
    const [localRentals, setLocalRentals] = useState<Rental[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [statusFilter, setStatusFilter] = useState<RentalStatus | "All">("All");
    
    // Additional Advanced Filters
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");

    // Sorting State
    const [sortField, setSortField] = useState<keyof Rental | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

    // Bulk Action Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkStatus, setBulkStatus] = useState<string>("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Rental>>({});
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [editingDateField, setEditingDateField] = useState<"startDate" | "endDate" | null>(null);

    useEffect(() => {
        setLocalRentals(rentals || []);
        setSelectedIds([]); // Clear selection when data changes
    }, [rentals]);

    // Apply filters
    const getFilteredRentals = () => {
        return localRentals.filter((r) => {
            const matchesStatus = statusFilter === "All" || r.status === statusFilter;
            const matchesMinPrice = minPrice === "" || r.rentAmount >= parseFloat(minPrice);
            const matchesMaxPrice = maxPrice === "" || r.rentAmount <= parseFloat(maxPrice);
            return matchesStatus && matchesMinPrice && matchesMaxPrice;
        });
    };

    // Apply sorting
    const getSortedRentals = (data: Rental[]) => {
        if (!sortField || !sortDirection) return data;

        return [...data].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;

            // Handle strings
            if (typeof valA === "string" && typeof valB === "string") {
                return sortDirection === "asc"
                    ? valA.localeCompare(valB, lang === "km" ? "km" : "en")
                    : valB.localeCompare(valA, lang === "km" ? "km" : "en");
            }

            // Handle numbers/booleans/dates
            if (valA < valB) return sortDirection === "asc" ? -1 : 1;
            if (valA > valB) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    };

    const filteredList = getFilteredRentals();
    const sortedFilteredRentals = getSortedRentals(filteredList);

    const totalPages = Math.ceil(sortedFilteredRentals.length / itemsPerPage);
    const currentRentals = sortedFilteredRentals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: keyof Rental) => {
        if (sortField === field) {
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else if (sortDirection === "desc") {
                setSortField(null);
                setSortDirection(null);
            }
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const renderSortIcon = (field: keyof Rental) => {
        if (sortField !== field) return <FaSort className="text-slate-350 shrink-0 text-[10px]" />;
        return sortDirection === "asc"
            ? <FaSortUp className="text-indigo-600 dark:text-indigo-400 shrink-0 text-xs" />
            : <FaSortDown className="text-indigo-600 dark:text-indigo-400 shrink-0 text-xs" />;
    };

    // Bulk selection triggers
    const handleSelectRow = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const pageIds = currentRentals.map((r) => r.id);
        const allSelected = pageIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...new Set([...prev, ...pageIds])]);
        }
    };

    // Bulk Delete Action
    const handleBulkDelete = async () => {
        const confirmMsg = lang === "en"
            ? `Are you sure you want to delete the ${selectedIds.length} selected rentals? This cannot be undone.`
            : `តើអ្នកប្រាកដទេថាចង់លុបកិច្ចសន្យាទាំង ${selectedIds.length} ដែលបានជ្រើសរើសនេះ?`;

        if (window.confirm(confirmMsg)) {
            try {
                // Delete selected items sequentially
                for (const id of selectedIds) {
                    await deleteRental(id);
                }
                const updatedList = localRentals.filter((r) => !selectedIds.includes(r.id));
                setLocalRentals(updatedList);
                setSelectedIds([]);
                setCurrentPage(1);
            } catch (err) {
                console.error("Bulk delete failure:", err);
                alert(lang === "en" ? "Failed to delete some rentals." : "ការលុបកិច្ចសន្យាខ្លះបានបរាជ័យ។");
            }
        }
    };

    // Bulk Status Update Action
    const handleBulkStatusChange = async (newStatus: RentalStatus) => {
        try {
            for (const id of selectedIds) {
                await updateRental(id, { status: newStatus });
            }
            // Update local state
            setLocalRentals(prev =>
                prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: newStatus } : r))
            );
            setSelectedIds([]);
            setBulkStatus("");
        } catch (err) {
            console.error("Bulk status update failure:", err);
            alert("Failed to update status for some rentals.");
        }
    };

    // CSV Export Logic
    const handleExportCSV = () => {
        const dataToExport = selectedIds.length > 0
            ? localRentals.filter((r) => selectedIds.includes(r.id))
            : sortedFilteredRentals;

        if (dataToExport.length === 0) {
            alert(lang === "en" ? "No rentals to export." : "មិនមានទិន្នន័យសម្រាប់ទាញយកទេ។");
            return;
        }

        const headers = [
            "ID", "Client Name", "Room Number", "Status", "Rent Amount ($)",
            "Deposit ($)", "Start Date", "End Date", "Phone", "Email", "Nationality"
        ];

        const escapeCsv = (str: string | undefined | null) => {
            if (!str) return '""';
            return `"${String(str).replace(/"/g, '""')}"`;
        };

        const rows = dataToExport.map((r) => [
            r.id,
            escapeCsv(r.ClientName),
            escapeCsv(r.roomNumber),
            escapeCsv(r.status),
            r.rentAmount,
            r.depositAmount || 0,
            escapeCsv(r.startDate),
            escapeCsv(r.endDate),
            escapeCsv(r.clientPhone),
            escapeCsv(r.clientEmail),
            escapeCsv(r.nationality),
        ]);

        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `rentals_export_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditStart = (rental: Rental) => {
        router.push(`/dashboard/rentals/edit/${rental.id}`);
    };

    const handleSaveEdit = (id: number) => {
        setLocalRentals(prev =>
            prev.map(r => (r.id === id ? { ...r, ...editForm } : r))
        );
        setEditingId(null);
        setEditForm({});
        setShowDatePopup(false);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
        setShowDatePopup(false);
        setEditingDateField(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm(lang === "en"
            ? "Are you sure you want to delete this rental? This cannot be undone."
            : "តើអ្នកប្រាកដទេថាចង់លុបកិច្ចសន្យាជួលនេះ?"
        )) {
            try {
                await deleteRental(id);
                const newRentals = localRentals.filter(r => r.id !== id);
                setLocalRentals(newRentals);
                const newTotalPages = Math.ceil(newRentals.length / itemsPerPage);
                if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
            } catch (err) {
                alert(lang === "en" ? "Failed to delete rental" : "ការលុបបានបរាជ័យ");
                console.error(err);
            }
        }
    };

    const updateEditForm = (field: keyof Rental, value: string | number) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateEdit = (field: "startDate" | "endDate") => {
        setEditingDateField(field);
        setShowDatePopup(true);
    };

    const handleDateChange = (dateStr: string) => {
        if (editingDateField && editingId !== null) {
            updateEditForm(editingDateField, dateStr);
        }
    };

    const handleViewDetails = (rental: Rental) => {
        router.push(`/dashboard/rentals/${rental.id}`);
    };

    const t = {
        client: lang === "en" ? "Client" : "អតិថិជន",
        room: lang === "en" ? "Room" : "បន្ទប់",
        status: lang === "en" ? "Status" : "ស្ថានភាព",
        rentAmount: lang === "en" ? "Rent" : "ចំនួនជួល",
        startDate: lang === "en" ? "Start Date" : "ថ្ងៃចាប់ផ្តើម",
        endDate: lang === "en" ? "End Date" : "ថ្ងៃបញ្ចប់",
        actions: lang === "en" ? "Actions" : "សកម្មភាព",
        allStatuses: lang === "en" ? "All Statuses" : "ស្ថានភាពទាំងអស់",
        noRentals: lang === "en"
            ? "No rentals found matching the selected filters."
            : "មិនមានការជួលទេដែលបំពេញលក្ខខណ្ឌដែលបានជ្រើស។",
        bulkDeleteBtn: lang === "en" ? "Delete Selected" : "លុបដែលបានជ្រើស",
        bulkStatusPlaceholder: lang === "en" ? "Change Status" : "ប្តូរស្ថានភាព",
        minRentPlaceholder: lang === "en" ? "Min Rent" : "តម្លៃជួលទាបបំផុត",
        maxRentPlaceholder: lang === "en" ? "Max Rent" : "តម្លៃជួលខ្ពស់បំផុត",
    };

    const allOnCurrentPageSelected = currentRentals.length > 0 && 
        currentRentals.every((r) => selectedIds.includes(r.id));

    return (
        <div className="flex flex-col w-full space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 shadow-sm">
                
                {/* Status Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {(["All", ...allStatuses] as (RentalStatus | "All")[]).map((s) => {
                        const isActive = statusFilter === s;
                        const cfg = s !== "All" ? statusConfig[s as RentalStatus] : null;
                        return (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                                    ? "bg-indigo-650 text-white shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700"
                                    : "bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`}
                            >
                                {s === "All"
                                    ? lang === "en" ? "All" : "ទាំងអស់"
                                    : lang === "en" ? cfg!.label : cfg!.labelKm}
                            </button>
                        );
                    })}
                </div>

                {/* Price/Rent filters & CSV export button */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-[10px]">$</span>
                        <input
                            type="number"
                            placeholder={t.minRentPlaceholder}
                            value={minPrice}
                            onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                            className="pl-6 pr-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-xl outline-none text-xs w-28 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-550 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                            min="0"
                        />
                    </div>
                    <span className="text-slate-350 dark:text-slate-700 text-xs font-bold">—</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-[10px]">$</span>
                        <input
                            type="number"
                            placeholder={t.maxRentPlaceholder}
                            value={maxPrice}
                            onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                            className="pl-6 pr-3 py-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-xl outline-none text-xs w-28 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-550 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                            min="0"
                        />
                    </div>

                    {/* CSV Report Export Button */}
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 dark:shadow-none transition-colors cursor-pointer active:scale-98"
                        title={lang === "en" ? "Export to CSV" : "ទាញយកជា CSV"}
                    >
                        <FaFileCsv className="text-sm" />
                        <span>{lang === "en" ? "Export" : "ទាញយក"}</span>
                    </button>

                    {/* Items Per Page */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-450 dark:text-slate-550 ml-2">
                        <span>{lang === "en" ? "Show:" : "បង្ហាញ:"}</span>
                        <CustomDropdown
                            options={itemsPerPageOptions.map(opt => ({ value: String(opt), label: String(opt) }))}
                            value={String(itemsPerPage)}
                            onChange={(val) => { setItemsPerPage(parseInt(val)); setCurrentPage(1); }}
                            className="w-20 text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Panel Overlay */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-indigo-50/50 dark:bg-indigo-955/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl shadow-md backdrop-blur-md"
                    >
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                            {lang === "en"
                                ? `${selectedIds.length} rental(s) selected`
                                : `បានជ្រើសរើសកិច្ចសន្យាចំនួន ${selectedIds.length}`}
                        </span>
                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                            <CustomDropdown
                                options={allStatuses.map((s) => ({
                                    value: s,
                                    label: lang === "en" ? statusConfig[s].label : statusConfig[s].labelKm,
                                }))}
                                value={bulkStatus}
                                onChange={(val) => {
                                    setBulkStatus(val);
                                    handleBulkStatusChange(val as RentalStatus);
                                }}
                                placeholder={t.bulkStatusPlaceholder}
                                className="w-44 text-xs"
                            />
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 dark:shadow-none transition-colors cursor-pointer active:scale-98"
                            >
                                <FaTrashAlt className="text-xs" />
                                <span>{t.bulkDeleteBtn}</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Cards Grid view */}
            {currentRentals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-sm md:hidden">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 flex items-center justify-center shadow-inner">
                        <FaInbox className="text-2xl text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="text-center space-y-1.5 max-w-sm px-4">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.noRentals}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            {lang === "en" 
                                ? "Try adjusting your search queries or active filters to find matching rental agreements."
                                : "សូមព្យាយាមផ្លាស់ប្តូរការស្វែងរក ឬលក្ខខណ្ឌចម្រោះ ដើម្បីស្វែងរកកិច្ចសន្យាជួល។"}
                        </p>
                    </div>
                    {(statusFilter !== "All" || minPrice !== "" || maxPrice !== "") && (
                        <button
                            onClick={() => {
                                setStatusFilter("All");
                                setMinPrice("");
                                setMaxPrice("");
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-750 cursor-pointer"
                        >
                            {lang === "en" ? "Clear Filters" : "សម្អាតលក្ខខណ្ឌចម្រោះ"}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {currentRentals.map((rental, idx) => {
                        const isSelected = selectedIds.includes(rental.id);
                        const gradient = avatarGradients[rental.id % avatarGradients.length];
                        const initials = getInitials(rental.ClientName || "?");
                        
                        return (
                            <div 
                                key={rental.id}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                                    isSelected 
                                        ? "border-indigo-500 shadow-md ring-1 ring-indigo-500/25 bg-indigo-50/5 dark:bg-indigo-950/5" 
                                        : "border-slate-200/80 dark:border-slate-800/80 shadow-sm"
                                } p-4 space-y-4 hover:shadow-md transition-all duration-200`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSelectRow(rental.id)}
                                            className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm`}>
                                            {initials}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-905 dark:text-slate-100 text-xs leading-tight hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleViewDetails(rental)}>
                                                {rental.ClientName || "N/A"}
                                            </h4>
                                            {(rental.clientPhone || rental.clientEmail) && (
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                                                    {rental.clientPhone || rental.clientEmail}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-150/10 font-bold text-[10px]">
                                        {lang === "en" ? `Room ${rental.roomNumber}` : `បន្ទប់ ${rental.roomNumber}`}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800/50 py-2.5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.status}</span>
                                        <div className="mt-1">
                                            <StatusBadge status={rental.status} lang={lang} />
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.rentAmount}</span>
                                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50 mt-0.5">${rental.rentAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-[10px] text-slate-450 dark:text-slate-500 font-semibold">
                                        <span>{formatKhmerDate(rental.startDate, lang)}</span>
                                        <span>{formatKhmerDate(rental.endDate, lang)}</span>
                                    </div>
                                    <LeaseProgressBar startDate={rental.startDate} endDate={rental.endDate} lang={lang} />
                                </div>
                                
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                                    <button
                                        onClick={() => handleViewDetails(rental)}
                                        className="p-2 text-slate-450 hover:text-indigo-655 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer"
                                        title={lang === "en" ? "View" : "មើល"}
                                    >
                                        <FaEye size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleEditStart(rental)}
                                        className="p-2 text-slate-450 hover:text-indigo-655 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer"
                                        title={lang === "en" ? "Edit" : "កែប្រែ"}
                                    >
                                        <FaEdit size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rental.id)}
                                        className="p-2 text-slate-455 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer"
                                        title={lang === "en" ? "Delete" : "លុប"}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Desktop View Table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60 text-slate-450 dark:text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                            <tr>
                                {/* Bulk Selection Checkbox */}
                                <th className="px-5 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={allOnCurrentPageSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-4 w-12 text-center">#</th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors select-none"
                                    onClick={() => handleSort("ClientName")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.client}
                                        {renderSortIcon("ClientName")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors select-none"
                                    onClick={() => handleSort("roomNumber")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.room}
                                        {renderSortIcon("roomNumber")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors select-none"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.status}
                                        {renderSortIcon("status")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors select-none"
                                    onClick={() => handleSort("rentAmount")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.rentAmount}
                                        {renderSortIcon("rentAmount")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors select-none"
                                    onClick={() => handleSort("startDate")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.startDate}
                                        {renderSortIcon("startDate")}
                                    </div>
                                </th>
                                <th className="px-6 py-4">{t.endDate}</th>
                                <th className="px-6 py-4">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {currentRentals.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 flex items-center justify-center shadow-inner">
                                                <FaInbox className="text-2xl text-slate-300 dark:text-slate-655" />
                                            </div>
                                            <div className="text-center space-y-1.5 max-w-sm">
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.noRentals}</p>
                                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                                    {lang === "en" 
                                                        ? "Try adjusting your search queries or active filters to find matching rental agreements."
                                                        : "សូមព្យាយាមផ្លាស់ប្តូរការស្វែងរក ឬលក្ខខណ្ឌចម្រោះ ដើម្បីស្វែងរកកិច្ចសន្យាជួល។"}
                                                </p>
                                            </div>
                                            {(statusFilter !== "All" || minPrice !== "" || maxPrice !== "") && (
                                                <button
                                                    onClick={() => {
                                                        setStatusFilter("All");
                                                        setMinPrice("");
                                                        setMaxPrice("");
                                                        setCurrentPage(1);
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-750 cursor-pointer"
                                                >
                                                    {lang === "en" ? "Clear Filters" : "សម្អាតលក្ខខណ្ឌចម្រោះ"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : currentRentals.map((rental, idx) => {
                                const isEditing = editingId === rental.id;
                                const isSelected = selectedIds.includes(rental.id);
                                const gradient = avatarGradients[rental.id % avatarGradients.length];
                                const initials = getInitials(rental.ClientName || "?");

                                return (
                                    <tr
                                        key={rental.id}
                                        className={`group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                                            isEditing ? "bg-slate-50/70 dark:bg-slate-800/30" : ""
                                        } ${isSelected ? "bg-indigo-50/10 dark:bg-indigo-500/5" : ""}`}
                                    >
                                        {/* Row Checkbox */}
                                        <td className="px-5 py-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(rental.id)}
                                                className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </td>

                                        {/* Index ID */}
                                        <td className="px-4 py-4 text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap text-center text-xs font-semibold">
                                            {String(idx + 1 + (currentPage - 1) * itemsPerPage).padStart(2, "0")}
                                        </td>

                                        {/* Client */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.ClientName || ""}
                                                    onChange={(e) => updateEditForm("ClientName", e.target.value)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-full text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => handleViewDetails(rental)}>{rental.ClientName || "N/A"}</span>
                                                        {(rental.clientPhone || rental.clientEmail) && (
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                                                {rental.clientPhone || rental.clientEmail}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Room */}
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.roomNumber || ""}
                                                    onChange={(e) => updateEditForm("roomNumber", e.target.value)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-full text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-150/10 font-bold text-[10px]">
                                                    {rental.roomNumber || "N/A"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <CustomDropdown
                                                    options={allStatuses.map(status => ({
                                                        value: status,
                                                        label: lang === "en" ? statusConfig[status].label : statusConfig[status].labelKm
                                                    }))}
                                                    value={editForm.status || ""}
                                                    onChange={(val) => updateEditForm("status", val as RentalStatus)}
                                                    className="w-full text-xs"
                                                />
                                            ) : (
                                                <StatusBadge status={rental.status} lang={lang} />
                                            )}
                                        </td>

                                        {/* Rent Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-50 text-xs">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editForm.rentAmount || 0}
                                                    onChange={(e) => updateEditForm("rentAmount", parseFloat(e.target.value) || 0)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-24 text-xs focus:outline-none"
                                                    min="0" step="0.01"
                                                />
                                            ) : (
                                                <>${rental.rentAmount.toLocaleString()}</>
                                            )}
                                        </td>

                                        {/* Start Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-550 dark:text-slate-400 text-xs font-medium">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1.5 text-xs w-full hover:bg-slate-50"
                                                    onClick={() => handleDateEdit("startDate")}
                                                >
                                                    <FaCalendarAlt className="text-slate-400 dark:text-slate-500 text-xs" />
                                                    <span>{formatKhmerDate(editForm.startDate as string, lang) || "—"}</span>
                                                </button>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span>{formatKhmerDate(rental.startDate, lang) || "—"}</span>
                                                    {!isEditing && (
                                                        <div className="w-28">
                                                            <LeaseProgressBar startDate={rental.startDate} endDate={rental.endDate} lang={lang} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* End Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-550 dark:text-slate-400 text-xs font-medium">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1.5 text-xs w-full hover:bg-slate-50"
                                                    onClick={() => handleDateEdit("endDate")}
                                                >
                                                    <FaCalendarAlt className="text-slate-400 dark:text-slate-500 text-xs" />
                                                    <span>{formatKhmerDate(editForm.endDate as string, lang) || "—"}</span>
                                                </button>
                                            ) : (
                                                formatKhmerDate(rental.endDate, lang) || "—"
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(rental.id)}
                                                            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm"
                                                            title={lang === "en" ? "Save" : "រក្សាទុក"}
                                                        >
                                                            <FaSave size={12} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                            title={lang === "en" ? "Cancel" : "បោះបង់"}
                                                        >
                                                            <FaTimes size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewDetails(rental)}
                                                            className="p-2 text-slate-450 hover:text-indigo-650 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800/80 cursor-pointer"
                                                            title={lang === "en" ? "View" : "មើល"}
                                                        >
                                                            <FaEye size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStart(rental)}
                                                            className="p-2 text-slate-450 hover:text-indigo-655 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800/80 cursor-pointer"
                                                            title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                        >
                                                            <FaEdit size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rental.id)}
                                                            className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800/80 cursor-pointer"
                                                            title={lang === "en" ? "Delete" : "លុប"}
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-250 cursor-pointer ${currentPage === 1
                                ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed bg-transparent"
                                : "border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 shadow-sm"
                                }`}
                        >
                            {lang === 'en' ? 'Previous' : 'មុន'}
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer ${page === currentPage
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none"
                                        : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-250 cursor-pointer ${currentPage === totalPages
                                ? "border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed bg-transparent"
                                : "border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 shadow-sm"
                                }`}
                        >
                            {lang === 'en' ? 'Next' : 'បន្ទាប់'}
                        </button>
                    </div>
                )}
            </div>

            {/* Date Picker Popup */}
            {showDatePopup && editingId && editForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md animate-in fade-in duration-200">
                        <KhmerCalendar
                            selectedDate={editingDateField ? (editForm[editingDateField] as string) || "" : ""}
                            onChange={handleDateChange}
                            lang={lang}
                            onClose={() => setShowDatePopup(false)}
                            isPopup={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RentalList;