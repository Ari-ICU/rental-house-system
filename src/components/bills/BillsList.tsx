'use client';

import React, { useState, useEffect } from "react";
import {
    FaEdit,
    FaTrash,
    FaChevronLeft,
    FaSave,
    FaTimes,
    FaChevronRight,
    FaEye,
    FaCalendarAlt,
    FaPrint
} from "react-icons/fa";
import { Bill } from "@/types/bill";
import { formatKhmerDate } from "@/utils/dateFormatter";
import KhmerCalendar from "@/utils/KhmerCalendar";
import BillViewModal from "@/components/bills/BillViewModal";
import { useLang } from "@/context/LangContext";
import { printBill } from "@/components/bills/printBill";


interface BillsListProps {
    bills: Bill[];
    itemsPerPageOptions?: number[];
}

const statusColors: Record<"Paid" | "Unpaid", string> = {
    Paid: "bg-green-100 text-green-800",
    Unpaid: "bg-red-100 text-red-800",
};

const allStatuses: ("Paid" | "Unpaid" | "All")[] = ["All", "Paid", "Unpaid"];

const BillsList: React.FC<BillsListProps> = ({
    bills = [],
    itemsPerPageOptions = [5, 10, 20],
}) => {
    const { lang } = useLang();
    const [localBills, setLocalBills] = useState<Bill[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [statusFilter, setStatusFilter] =
        useState<"Paid" | "Unpaid" | "All">("All");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Bill | null>(null);
    const [showDatePopup, setShowDatePopup] = useState(false);

    // Modal state
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    useEffect(() => {
        setLocalBills(bills || []);
    }, [bills]);

    const filteredBills =
        statusFilter === "All"
            ? localBills
            : localBills.filter(
                (b) =>
                    b.electricityStatus === statusFilter ||
                    b.waterStatus === statusFilter
            );

    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const currentBills = filteredBills.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const handleEditStart = (bill: Bill) => {
        setEditingId(bill.id);
        setEditForm(bill);
        setShowDatePopup(false);
    };


    const handleDelete = (id: number) => {
        if (
            confirm(
                lang === "en"
                    ? "Are you sure you want to delete this bill record?"
                    : "តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?"
            )
        ) {
            const newBills = localBills.filter((b) => b.id !== id);
            setLocalBills(newBills);
            const newTotalPages = Math.ceil(newBills.length / itemsPerPage);
            if (currentPage > newTotalPages) {
                setCurrentPage(Math.max(1, newTotalPages));
            }
            setShowDatePopup(false);
        }
    };

    const handleView = (bill: Bill) => {
        setSelectedBill(bill);
        setViewModalOpen(true);
    };

    const closeViewModal = () => {
        setViewModalOpen(false);
        setSelectedBill(null);
    };

    const handlePrint = (bill: Bill) => {
        printBill(bill, lang);
    };

    const updateEditForm = (updater: (current: Bill) => Bill) => {
        setEditForm((prev) => {
            if (!prev) return null;
            return updater(prev);
        });
    };

    const handleSave = () => {
        if (editForm && editingId !== null) {
            setLocalBills((prev) =>
                prev.map((b) => (b.id === editingId ? editForm : b))
            );
        }
        setEditingId(null);
        setEditForm(null);
        setShowDatePopup(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
        setShowDatePopup(false);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700">
                        {lang === "en" ? "Filter by Status" : "តម្រៀបតាមស្ថានភាព"}
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as
                                | "Paid"
                                | "Unpaid"
                                | "All");
                            setCurrentPage(1);
                            setShowDatePopup(false);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        {allStatuses.map((status) => (
                            <option key={status} value={status}>
                                {lang === "en"
                                    ? status
                                    : status === "Paid"
                                        ? "បានបង់"
                                        : status === "Unpaid"
                                            ? "មិនទាន់បង់"
                                            : "ទាំងអស់"}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700">
                        {lang === "en" ? "Items per Page" : "ទំនិញក្នុងមួយទំព័រ"}
                    </label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                            setShowDatePopup(false);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        {itemsPerPageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt} {lang === "en" ? "per page" : "ក្នុងមួយទំព័រ"}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full border border-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                lang === "en" ? "ID" : "លេខសម្គាល់",
                                lang === "en" ? "Client" : "អតិថិជន",
                                lang === "en" ? "Month" : "ខែ",
                                lang === "en" ? "Room Price ($)" : "តម្លៃបន្ទប់",
                                lang === "en" ? "Electricity ($)" : "អគ្គិសនី ($)",
                                lang === "en" ? "E-Status" : "ស្ថានភាពអគ្គិសនី",
                                lang === "en" ? "Water ($)" : "ទឹក ($)",
                                lang === "en" ? "W-Status" : "ស្ថានភាពទឹក",
                                lang === "en" ? "Actions" : "សកម្មភាព",
                            ].map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm text-gray-600 font-medium"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {/* Inside tbody of BillsList */}
                    <tbody>
                        {currentBills.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-4 text-gray-500">
                                    {lang === "en" ? "No bills found." : "មិនមានវិក្កយបត្រដែលស្គាល់។"}
                                </td>
                            </tr>
                        ) : (
                            currentBills.map((bill, idx) => {
                                const isEditing = editingId === bill.id;
                                const currentEditForm = isEditing ? editForm : null;
                                return (
                                    <tr
                                        key={bill.id}
                                        className={`border-b border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            {bill.id}
                                        </td>
                                        {/* Client */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={currentEditForm?.rental?.ClientName || ""}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({
                                                            ...prev,
                                                            rental: { ...prev.rental, ClientName: e.target.value },
                                                        }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                bill.rental?.ClientName
                                            )}
                                        </td>

                                        {/* Month */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <button
                                                    type="button"
                                                    className="w-full text-left border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs"
                                                    onClick={() => setShowDatePopup(true)}
                                                >
                                                    <span>{formatKhmerDate(currentEditForm?.month, lang)}</span>
                                                    <FaCalendarAlt size={12} className="ml-2" />
                                                </button>
                                            ) : (
                                                formatKhmerDate(bill.month, lang)
                                            )}
                                        </td>

                                        {/* Room Price */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={currentEditForm?.rental?.rentAmount || 0}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({
                                                            ...prev,
                                                            rental: { ...prev.rental, rentAmount: parseFloat(e.target.value) || 0 },
                                                        }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                `$${bill.rental?.rentAmount}/mo`
                                            )}
                                        </td>

                                        {/* Electricity Amount */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={currentEditForm?.electricityAmount || 0}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({ ...prev, electricityAmount: parseFloat(e.target.value) || 0 }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                bill.electricityAmount != null ? `$${bill.electricityAmount.toFixed(2)}` : 'N/A'
                                            )}
                                        </td>

                                        {/* Electricity Status */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={currentEditForm?.electricityStatus || ""}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({ ...prev, electricityStatus: e.target.value as "Paid" | "Unpaid" }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                >
                                                    <option value="Paid">{lang === "en" ? "Paid" : "បានបង់"}</option>
                                                    <option value="Unpaid">{lang === "en" ? "Unpaid" : "មិនទាន់បង់"}</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bill.electricityStatus]}`}
                                                >
                                                    {lang === "en"
                                                        ? bill.electricityStatus
                                                        : bill.electricityStatus === "Paid"
                                                            ? "បានបង់"
                                                            : "មិនទាន់បង់"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Water Amount */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={currentEditForm?.waterAmount || 0}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({ ...prev, waterAmount: parseFloat(e.target.value) || 0 }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                bill.waterAmount != null ? `$${bill.waterAmount.toFixed(2)}` : 'N/A'
                                            )}
                                        </td>

                                        {/* Water Status */}
                                        <td className="px-4 py-3 text-sm">
                                            {isEditing ? (
                                                <select
                                                    value={currentEditForm?.waterStatus || ""}
                                                    onChange={(e) =>
                                                        updateEditForm((prev) => ({ ...prev, waterStatus: e.target.value as "Paid" | "Unpaid" }))
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                >
                                                    <option value="Paid">{lang === "en" ? "Paid" : "បានបង់"}</option>
                                                    <option value="Unpaid">{lang === "en" ? "Unpaid" : "មិនទាន់បង់"}</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bill.waterStatus]}`}
                                                >
                                                    {lang === "en"
                                                        ? bill.waterStatus
                                                        : bill.waterStatus === "Paid"
                                                            ? "បានបង់"
                                                            : "មិនទាន់បង់"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                                        title={lang === "en" ? "Save changes" : "រក្សាទុកការផ្លាស់ប្តូរ"}
                                                    >
                                                        <FaSave size={12} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                                                        title={lang === "en" ? "Cancel edit" : "បោះបង់ការកែប្រែ"}
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleView(bill)}
                                                        className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition"
                                                        title={lang === "en" ? "View" : "មើល"}
                                                    >
                                                        <FaEye size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStart(bill)}
                                                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                                                        title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                    >
                                                        <FaEdit size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bill.id)}
                                                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                                                        title={lang === "en" ? "Delete" : "លុប"}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrint(bill)}
                                                        className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
                                                        title={lang === "en" ? "Print" : "បោះពុម្ព"}
                                                    >
                                                        <FaPrint size={12} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded border text-sm ${currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                            } transition`}
                    >
                        <FaChevronLeft size={14} />
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded border">
                        {currentPage} {lang === "en" ? "of" : "នៃ"} {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded border text-sm ${currentPage === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                            } transition`}
                    >
                        <FaChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* Date Picker Popup */}
            {showDatePopup && editingId && editForm && (
                <KhmerCalendar
                    selectedDate={editForm.month || ""}
                    onChange={(dateStr: string) => {
                        updateEditForm((prev) => ({ ...prev, month: dateStr }));
                        // Optionally close after selection: setShowDatePopup(false);
                    }}
                    lang={lang}
                    onClose={() => setShowDatePopup(false)}
                    isPopup={true}
                />
            )}

            {/* View Modal */}
            {viewModalOpen && selectedBill && (
                <BillViewModal bill={selectedBill} onClose={closeViewModal} />
            )}
        </div>
    );
};

export default BillsList;