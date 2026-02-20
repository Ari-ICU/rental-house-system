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
    "Active": { label: "Active", labelKm: "កំពុងជួល", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    "Reserved": { label: "Reserved", labelKm: "កក់ទុក", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border border-blue-200" },
    "Completed": { label: "Completed", labelKm: "បានបញ្ចប់", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 border border-gray-200" },
    "Maintenance": { label: "Maintenance", labelKm: "កំពុងជួសជុល", dot: "bg-rose-400", badge: "bg-rose-50 text-rose-700 border border-rose-200" },
};

const allStatuses: RentalStatus[] = ["Active", "Reserved", "Completed", "Maintenance"];

function getInitials(name: string): string {
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");
}

const avatarGradients = [
    "from-violet-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-rose-500 to-pink-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
];

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
        rentAmount: lang === "en" ? "Rent / mo" : "ចំនួនជួល",
        startDate: lang === "en" ? "Start Date" : "ថ្ងៃចាប់ផ្តើម",
        endDate: lang === "en" ? "End Date" : "ថ្ងៃបញ្ចប់",
        actions: lang === "en" ? "Actions" : "សកម្មភាព",
        allStatuses: lang === "en" ? "All Statuses" : "ស្ថានភាពទាំងអស់",
        noRentals: lang === "en"
            ? "No rentals found matching the selected filters."
            : "មិនមានការជួលទេដែលបំពេញលក្ខខណ្ឌដែលបានជ្រើស។",
    };

    return (
        <div className="space-y-4">

            {/* Stats + Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5">

                {/* Status Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {(["All", ...allStatuses] as (RentalStatus | "All")[]).map((s) => {
                        const isActive = statusFilter === s;
                        const cfg = s !== "All" ? statusConfig[s as RentalStatus] : null;
                        return (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{lang === "en" ? "Show" : "បង្ហាញ"}</span>
                    <CustomDropdown
                        options={itemsPerPageOptions.map(opt => ({ value: String(opt), label: String(opt) }))}
                        value={String(itemsPerPage)}
                        onChange={(val) => { setItemsPerPage(parseInt(val)); setCurrentPage(1); }}
                        className="w-20"
                    />
                    <span>{lang === "en" ? "per page" : "ក្នុងមួយទំព័រ"}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="min-w-[1000px] w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.client}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.room}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.status}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.rentAmount}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.startDate}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.endDate}</th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentRentals.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                                                <FaInbox className="text-2xl text-gray-300" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-400">{t.noRentals}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentRentals.map((rental, idx) => {
                                const isEditing = editingId === rental.id;
                                const cfg = statusConfig[rental.status];
                                const gradient = avatarGradients[rental.id % avatarGradients.length];
                                const initials = getInitials(rental.ClientName || "?");

                                return (
                                    <tr
                                        key={rental.id}
                                        className={`group transition-colors hover:bg-violet-50/40 ${isEditing ? "bg-violet-50/60" : ""}`}
                                    >
                                        {/* ID */}
                                        <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                                            {String(idx + 1 + (currentPage - 1) * itemsPerPage).padStart(2, "0")}
                                        </td>

                                        {/* Client */}
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.ClientName || ""}
                                                    onChange={(e) => updateEditForm("ClientName", e.target.value)}
                                                    className="border border-violet-300 rounded-lg px-2.5 py-1.5 w-full text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                        <span className="text-white text-xs font-bold">{initials}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800">{rental.ClientName || "N/A"}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Room */}
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.roomNumber || ""}
                                                    onChange={(e) => updateEditForm("roomNumber", e.target.value)}
                                                    className="border border-violet-300 rounded-lg px-2.5 py-1.5 w-full text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                />
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <FaHome className="text-gray-300 text-xs" />
                                                    <span className="text-sm text-gray-700 font-medium">{rental.roomNumber || "N/A"}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-3.5">
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
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                    {lang === "en" ? cfg.label : cfg.labelKm}
                                                </span>
                                            )}
                                        </td>

                                        {/* Rent Amount */}
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editForm.rentAmount || 0}
                                                    onChange={(e) => updateEditForm("rentAmount", parseFloat(e.target.value) || 0)}
                                                    className="border border-violet-300 rounded-lg px-2.5 py-1.5 w-24 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                    min="0" step="0.01"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-800">
                                                    ${rental.rentAmount.toLocaleString()}
                                                    <span className="text-xs text-gray-400 font-normal">/mo</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Start Date */}
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-violet-300 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 text-xs w-full"
                                                    onClick={() => handleDateEdit("startDate")}
                                                >
                                                    <FaCalendarAlt className="text-violet-400 text-xs" />
                                                    <span>{formatKhmerDate(editForm.startDate as string, lang) || "—"}</span>
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-600">{formatKhmerDate(rental.startDate, lang) || "—"}</span>
                                            )}
                                        </td>

                                        {/* End Date */}
                                        <td className="px-5 py-3.5">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 border border-violet-300 rounded-lg px-2.5 py-1.5 hover:bg-violet-50 text-xs w-full"
                                                    onClick={() => handleDateEdit("endDate")}
                                                >
                                                    <FaCalendarAlt className="text-violet-400 text-xs" />
                                                    <span>{formatKhmerDate(editForm.endDate as string, lang) || "—"}</span>
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-600">{formatKhmerDate(rental.endDate, lang) || "—"}</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(rental.id)}
                                                            className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition shadow-sm"
                                                            title={lang === "en" ? "Save" : "រក្សាទុក"}
                                                        >
                                                            <FaSave size={11} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="w-7 h-7 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition"
                                                            title={lang === "en" ? "Cancel" : "បោះបង់"}
                                                        >
                                                            <FaTimes size={11} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewDetails(rental)}
                                                            className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition"
                                                            title={lang === "en" ? "View" : "មើល"}
                                                        >
                                                            <FaEye size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStart(rental)}
                                                            className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center hover:bg-violet-100 transition"
                                                            title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                        >
                                                            <FaEdit size={11} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rental.id)}
                                                            className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                                                            title={lang === "en" ? "Delete" : "លុប"}
                                                        >
                                                            <FaTrash size={11} />
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
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
                        <p className="text-xs text-gray-400">
                            {lang === "en"
                                ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredRentals.length)} of ${filteredRentals.length}`
                                : `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredRentals.length)} នៃ ${filteredRentals.length}`}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                            >
                                <FaChevronLeft size={11} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${page === currentPage
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                                        : "text-gray-500 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                            >
                                <FaChevronRight size={11} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Date Picker Popup */}
            {showDatePopup && editingId && editForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
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