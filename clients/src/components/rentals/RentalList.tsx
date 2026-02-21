'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaSave, FaTimes, FaChevronLeft, FaChevronRight, FaEye, FaCalendarAlt, FaHome, FaInbox } from "react-icons/fa";
import CustomDropdown from "@/common/CustomDropdown";

import { Rental, RentalStatus } from "@/types/rents";
import { formatKhmerDate } from "@/utils/dateFormatter";
import KhmerCalendar from "@/utils/KhmerCalendar";
import { useLang } from "@/context/LangContext";
import { deleteRental } from "@/services/rentalService";

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

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
}

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Rental>>({});
    const [showDatePopup, setShowDatePopup] = useState(false);
    const [editingDateField, setEditingDateField] = useState<"startDate" | "endDate" | null>(null);

    useEffect(() => {
        setLocalRentals(rentals || []);
    }, [rentals]);

    const filteredRentals =
        statusFilter === "All"
            ? localRentals
            : localRentals.filter((r) => r.status === statusFilter);

    const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);
    const currentRentals = filteredRentals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
    };

    return (
        <div className="flex flex-col w-full">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 pb-4">
                {/* Status Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {(["All", ...allStatuses] as (RentalStatus | "All")[]).map((s) => {
                        const isActive = statusFilter === s;
                        const cfg = s !== "All" ? statusConfig[s as RentalStatus] : null;
                        return (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${isActive
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {s === "All"
                                    ? lang === "en" ? "All" : "ទាំងអស់"
                                    : lang === "en" ? cfg!.label : cfg!.labelKm}
                            </button>
                        );
                    })}
                </div>

                {/* Items Per Page */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>{lang === "en" ? "Show:" : "បង្ហាញ:"}</span>
                    <CustomDropdown
                        options={itemsPerPageOptions.map(opt => ({ value: String(opt), label: String(opt) }))}
                        value={String(itemsPerPage)}
                        onChange={(val) => { setItemsPerPage(parseInt(val)); setCurrentPage(1); }}
                        className="w-16"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="px-6 py-3 font-medium text-[13px]">#</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.client}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.room}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.status}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.rentAmount}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.startDate}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.endDate}</th>
                                <th className="px-6 py-3 font-medium text-[13px]">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {currentRentals.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
                                            <div className="w-12 h-12 rounded bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                                                <FaInbox className="text-xl text-slate-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-sm font-medium">{t.noRentals}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentRentals.map((rental, idx) => {
                                const isEditing = editingId === rental.id;
                                const cfg = statusConfig[rental.status];
                                const initials = getInitials(rental.ClientName || "?");

                                return (
                                    <tr
                                        key={rental.id}
                                        className={`group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isEditing ? "bg-slate-50/70 dark:bg-slate-800/30" : ""}`}
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                                            {String(idx + 1 + (currentPage - 1) * itemsPerPage).padStart(2, "0")}
                                        </td>

                                        {/* Client */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.ClientName || ""}
                                                    onChange={(e) => updateEditForm("ClientName", e.target.value)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                                                        {initials}
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-slate-50">{rental.ClientName || "N/A"}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Room */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.roomNumber || ""}
                                                    onChange={(e) => updateEditForm("roomNumber", e.target.value)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                />
                                            ) : (
                                                rental.roomNumber || "N/A"
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
                                                    className="w-full"
                                                />
                                            ) : (
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium leading-tight ${cfg.badge}`}>
                                                    {lang === "en" ? cfg.label : cfg.labelKm}
                                                </span>
                                            )}
                                        </td>

                                        {/* Rent Amount */}
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-50">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editForm.rentAmount || 0}
                                                    onChange={(e) => updateEditForm("rentAmount", parseFloat(e.target.value) || 0)}
                                                    className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-2 py-1.5 w-24 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                                    min="0" step="0.01"
                                                />
                                            ) : (
                                                <>${rental.rentAmount.toLocaleString()}</>
                                            )}
                                        </td>

                                        {/* Start Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1.5 text-sm w-full hover:bg-slate-50 dark:hover:bg-slate-800"
                                                    onClick={() => handleDateEdit("startDate")}
                                                >
                                                    <FaCalendarAlt className="text-slate-400 dark:text-slate-500 text-xs" />
                                                    <span>{formatKhmerDate(editForm.startDate as string, lang) || "—"}</span>
                                                </button>
                                            ) : (
                                                formatKhmerDate(rental.startDate, lang) || "—"
                                            )}
                                        </td>

                                        {/* End Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1.5 text-sm w-full hover:bg-slate-50 dark:hover:bg-slate-800"
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(rental.id)}
                                                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                                                            title={lang === "en" ? "Save" : "រក្សាទុក"}
                                                        >
                                                            <FaSave size={14} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                            title={lang === "en" ? "Cancel" : "បោះបង់"}
                                                        >
                                                            <FaTimes size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewDetails(rental)}
                                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title={lang === "en" ? "View" : "មើល"}
                                                        >
                                                            <FaEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStart(rental)}
                                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                        >
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rental.id)}
                                                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                            title={lang === "en" ? "Delete" : "លុប"}
                                                        >
                                                            <FaTrash size={13} />
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
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center px-4 py-2 rounded border text-sm font-medium transition-colors ${currentPage === 1
                                ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-800"
                                : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 shadow-sm"
                                }`}
                        >
                            {lang === 'en' ? 'Previous' : 'មុន'}
                        </button>
                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${page === currentPage
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-4 py-2 rounded border text-sm font-medium transition-colors ${currentPage === totalPages
                                ? "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-800"
                                : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 shadow-sm"
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
                    <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
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