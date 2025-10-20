'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { FaEdit, FaTrash, FaSave, FaTimes, FaChevronLeft, FaChevronRight, FaEye, FaCalendarAlt } from "react-icons/fa";

import { Rental, RentalStatus } from "@/types/rents";
import { formatKhmerDate } from "@/utils/dateFormatter";
import KhmerCalendar from "@/utils/KhmerCalendar";
import { useLang } from "@/context/LangContext";

interface RentalListProps {
    rentals: Rental[];
    itemsPerPageOptions?: number[];
}

const statusColors: { [key in RentalStatus]: string } = {
    "In-Active": "bg-red-100 text-red-800",
    "Non-Active": "bg-yellow-100 text-yellow-800",
    "Past": "bg-gray-100 text-gray-800",
};

const allStatuses: RentalStatus[] = [
    "In-Active",
    "Non-Active",
    "Past",
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
        setEditingId(rental.id);
        setEditForm(rental);
        setShowDatePopup(false);
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

    const handleDelete = (id: number) => {
        if (confirm(lang === "en"
            ? "Are you sure you want to delete this rental agreement? This action cannot be undone."
            : "តើអ្នកប្រាកដទេថាចង់លុបកិច្ចសន្យាជួលនេះ? ការប្រតិបត្តិនេះមិនអាចដកចេញបាន។"
        )) {
            const newRentals = localRentals.filter(r => r.id !== id);
            setLocalRentals(newRentals);
            const newTotalPages = Math.ceil(newRentals.length / itemsPerPage);
            if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
            setShowDatePopup(false);
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
        // Optionally auto-close: setShowDatePopup(false);
    };

    const handleViewDetails = (rental: Rental) => {
        router.push(`/dashboard/rentals/${rental.id}`);
    };

    const t = {
        client: lang === "en" ? "Client" : "អតិថិជន",
        room: lang === "en" ? "Room" : "បន្ទប់",
        status: lang === "en" ? "Status" : "ស្ថានភាព",
        rentAmount: lang === "en" ? "Rent Amount" : "ចំនួនជួល",
        startDate: lang === "en" ? "Start Date" : "ថ្ងៃចាប់ផ្តើម",
        endDate: lang === "en" ? "End Date" : "ថ្ងៃបញ្ចប់",
        actions: lang === "en" ? "Actions" : "សកម្មភាព",
        filterStatus: lang === "en" ? "Filter by Status" : "តម្រៀបតាមស្ថានភាព",
        itemsPerPageLabel: lang === "en" ? "Items per Page" : "ទំនិញក្នុងមួយទំព័រ",
        allStatuses: lang === "en" ? "All Statuses" : "ស្ថានភាពទាំងអស់",
        noRentals: lang === "en"
            ? "No rentals found matching the selected filters."
            : "មិនមានការជួលទេដែលបំពេញលក្ខខណ្ឌដែលបានជ្រើស។"
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">{t.filterStatus}</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value as RentalStatus | "All"); setCurrentPage(1); setShowDatePopup(false); }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        <option value="All">{t.allStatuses}</option>
                        {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700">{t.itemsPerPageLabel}</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); setShowDatePopup(false); }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        {itemsPerPageOptions.map(opt => <option key={opt} value={opt}>{opt} {lang === "en" ? "per page" : "ក្នុងមួយទំព័រ"}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full border border-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">
                                {lang === "en" ? "ID" : "លេខសម្គាល់"}
                            </th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.client}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.room}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.status}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.rentAmount}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.startDate}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.endDate}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRentals.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4 text-sm text-gray-500">{t.noRentals}</td>
                            </tr>
                        ) : currentRentals.map((rental, idx) => {
                            const isEditing = editingId === rental.id;
                            return (
                                <tr key={rental.id} className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {rental.id}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <input type="text" value={editForm.ClientName || ""} onChange={(e) => updateEditForm("ClientName", e.target.value)} className="border border-gray-300 rounded px-2 py-1 w-full text-xs" placeholder={lang === "en" ? "Enter tenant name" : "បញ្ចូលឈ្មោះអ្នកជួល"} />
                                        ) : rental.ClientName || "N/A"}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <input type="text" value={editForm.roomNumber || ""} onChange={(e) => updateEditForm("roomNumber", e.target.value)} className="border border-gray-300 rounded px-2 py-1 w-full text-xs" placeholder={lang === "en" ? "Enter room number" : "បញ្ចូលលេខបន្ទប់"} />
                                        ) : rental.roomNumber || "N/A"}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <select value={editForm.status || ""} onChange={(e) => updateEditForm("status", e.target.value as RentalStatus)} className="border border-gray-300 rounded px-2 py-1 text-xs w-full">
                                                {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                            </select>
                                        ) : (
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors[rental.status]}`}>{rental.status}</span>
                                        )}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <input type="number" value={editForm.rentAmount || 0} onChange={(e) => updateEditForm("rentAmount", parseFloat(e.target.value) || 0)} className="border border-gray-300 rounded px-2 py-1 w-full text-xs" min="0" step="0.01" />
                                        ) : `$${rental.rentAmount.toLocaleString()}/mo`}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <button
                                                type="button"
                                                className="w-full text-left border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs"
                                                onClick={() => handleDateEdit("startDate")}
                                            >
                                                <span>{formatKhmerDate(editForm.startDate as string, lang)}</span>
                                                <FaCalendarAlt size={12} className="ml-2" />
                                            </button>
                                        ) : formatKhmerDate(rental.startDate, lang) || 'N/A'}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                        {isEditing ? (
                                            <button
                                                type="button"
                                                className="w-full text-left border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs"
                                                onClick={() => handleDateEdit("endDate")}
                                            >
                                                <span>{formatKhmerDate(editForm.endDate as string, lang)}</span>
                                                <FaCalendarAlt size={12} className="ml-2" />
                                            </button>
                                        ) : formatKhmerDate(rental.endDate, lang) || 'N/A'}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm flex gap-1 sm:gap-2">
                                        {isEditing ? (
                                            <>
                                                <button onClick={() => handleSaveEdit(rental.id)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition" title={lang === "en" ? "Save changes" : "រក្សាទុកការផ្លាស់ប្តូរ"}><FaSave size={12} /></button>
                                                <button onClick={handleCancelEdit} className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition" title={lang === "en" ? "Cancel edit" : "បោះបង់ការកែប្រែ"}><FaTimes size={12} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleViewDetails(rental)} className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600" title={lang === "en" ? "View" : "មើល"}><FaEye size={12} /></button>
                                                <button onClick={() => handleEditStart(rental)} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition" title={lang === "en" ? "Edit rental details" : "កែប្រែព័ត៌មានជួល"}><FaEdit size={12} /></button>
                                                <button onClick={() => handleDelete(rental.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition" title={lang === "en" ? "Delete rental" : "លុបការជួល"}><FaTrash size={12} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`p-2 rounded border text-sm ${currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"} transition`}><FaChevronLeft size={14} /></button>
                    <span className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded border">{currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`p-2 rounded border text-sm ${currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"} transition`}><FaChevronRight size={14} /></button>
                </div>
            )}

            {/* Date Picker Popup */}
            {showDatePopup && editingId && editForm && (
                <KhmerCalendar
                    selectedDate={editingDateField ? (editForm[editingDateField] as string) || "" : ""}
                    onChange={handleDateChange}
                    lang={lang}
                    onClose={() => setShowDatePopup(false)}
                    isPopup={true}
                />
            )}
        </div>
    );
};

export default RentalList;