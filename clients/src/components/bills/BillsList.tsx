'use client';

import React, { useState, useEffect } from "react";
import {
    FaEdit,
    FaTrash,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaPrint
} from "react-icons/fa";
import { Bill } from "@/types/bill";
import { formatKhmerDate } from "@/utils/dateFormatter";
import BillViewModal from "@/components/bills/BillViewModal";
import { useLang } from "@/context/LangContext";
import { printBill } from "@/components/bills/printBill";


import { deleteBill } from "@/services/billService";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";
import CustomDropdown from "@/common/CustomDropdown";

interface BillsListProps {
    bills: Bill[];
    itemsPerPageOptions?: number[];
    onRefresh?: () => void;
}

const statusColors: Record<"Paid" | "Unpaid", string> = {
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    Unpaid: "bg-rose-50 text-rose-700 border border-rose-100",
};

const allStatuses: ("Paid" | "Unpaid" | "All")[] = ["All", "Paid", "Unpaid"];

const BillsList: React.FC<BillsListProps> = ({
    bills = [],
    itemsPerPageOptions = [10, 20],
    onRefresh,
}) => {
    const { lang } = useLang();
    const router = useRouter();
    const [localBills, setLocalBills] = useState<Bill[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [statusFilter, setStatusFilter] =
        useState<"Paid" | "Unpaid" | "All">("All");

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


    const handleDelete = async (id: number) => {
        if (
            confirm(
                lang === "en"
                    ? "Are you sure you want to delete this bill record?"
                    : "តើអ្នកពិតជាចង់លុបវិក្កយបត្រនេះមែនទេ?"
            )
        ) {
            try {
                await deleteBill(id);
                toast.success(lang === 'en' ? 'Bill deleted' : 'បានលុបវិក្កយបត្រ');
                if (onRefresh) onRefresh();
            } catch (err) {
                console.error(err);
                toast.error(lang === 'en' ? 'Delete failed' : 'លុបមិនបានសម្រេច');
            }
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
        printBill(bill, lang, '/signature.png');
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 px-2">
                <div className="text-sm text-gray-400 font-medium italic">
                    {lang === 'en'
                        ? `Showing ${currentBills.length} of ${filteredBills.length} records`
                        : `បង្ហាញ ${currentBills.length} ក្នុងចំណោម ${filteredBills.length} កំណត់ត្រា`}
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            {lang === "en" ? "Filter by Status" : "តម្រៀបតាមស្ថានភាព"}
                        </label>
                        <CustomDropdown
                            options={allStatuses.map((status) => ({
                                value: status,
                                label: lang === "en" ? status : status === "Paid" ? "បានបង់" : status === "Unpaid" ? "មិនទាន់បង់" : "ទាំងអស់"
                            }))}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val as any);
                                setCurrentPage(1);
                            }}
                            className="w-40"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                            {lang === "en" ? "Total Items" : "ចំនួនសរុប"}
                        </label>
                        <CustomDropdown
                            options={itemsPerPageOptions.map((opt) => ({
                                value: String(opt),
                                label: `${opt} ${lang === "en" ? "per page" : "ក្នុងមួយទំព័រ"}`
                            }))}
                            value={String(itemsPerPage)}
                            onChange={(val) => {
                                setItemsPerPage(parseInt(val));
                                setCurrentPage(1);
                            }}
                            className="w-40"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden">
                <table className="min-w-full border-separate border-spacing-0">
                    <thead className="bg-gray-50/50">
                        <tr>
                            {[
                                lang === "en" ? "ID" : "លេខសម្គាល់",
                                lang === "en" ? "Client & Room" : "អតិថិជន & បន្ទប់",
                                lang === "en" ? "Bill Month" : "វិក្កយបត្រខែ",
                                lang === "en" ? "Room Price" : "តម្លៃបន្ទប់",
                                lang === "en" ? "E-Stat" : "ស្ថានភាពអគ្គិសនី",
                                lang === "en" ? "W-Stat" : "ស្ថានភាពទឹក",
                                lang === "en" ? "Total Due" : "សរុបត្រូវបង់",
                                lang === "en" ? "Actions" : "សកម្មភាព",
                            ].map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-100"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentBills.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-20 text-gray-400 bg-gray-50/30 italic">
                                    {lang === "en" ? "No matches found." : "រកមិនឃើញលទ្ធផលដែលត្រូវគ្នា។"}
                                </td>
                            </tr>
                        ) : (
                            currentBills.map((bill, idx) => {
                                const totalAmount = (bill.rental?.rentAmount || 0) + (bill.electricityAmount || 0) + (bill.waterAmount || 0);
                                return (
                                    <tr
                                        key={bill.id}
                                        className="hover:bg-violet-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-5 text-sm font-medium text-gray-400 tabular-nums">
                                            #{bill.id}
                                        </td>
                                        {/* Client & Room */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800 tracking-tight">
                                                    {bill.rental?.ClientName || 'N/A'}
                                                </span>
                                                <span className="text-[11px] text-violet-500 font-bold uppercase mt-0.5">
                                                    Room: {bill.rental?.roomNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Month */}
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">
                                                <svg className="w-3.5 h-3.5 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                {formatKhmerDate(bill.month, lang)}
                                            </div>
                                        </td>

                                        {/* Room Price */}
                                        <td className="px-6 py-5 text-sm font-bold text-gray-700">
                                            ${bill.rental?.rentAmount?.toFixed(2) || '0.00'}
                                        </td>

                                        {/* Electricity Status */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[bill.electricityStatus]}`}>
                                                    {lang === "en" ? bill.electricityStatus : bill.electricityStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium ml-0.5">
                                                    ${bill.electricityAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Water Status */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[bill.waterStatus]}`}>
                                                    {lang === "en" ? bill.waterStatus : bill.waterStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium ml-0.5">
                                                    ${bill.waterAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Total Due */}
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-black text-violet-700 bg-violet-50/50 w-fit px-3 py-1.5 rounded-2xl border border-violet-100">
                                                ${totalAmount.toFixed(2)}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5 transition-all opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleView(bill)}
                                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                                                    title={lang === "en" ? "View" : "មើល"}
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/bills/edit/${bill.id}`)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                                    title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                >
                                                    <FaEdit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                                    title={lang === "en" ? "Delete" : "លុប"}
                                                >
                                                    <FaTrash size={15} />
                                                </button>
                                                <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                                                <button
                                                    onClick={() => handlePrint(bill)}
                                                    className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl transition-all active:scale-90"
                                                    title={lang === "en" ? "Print" : "បោះពុម្ព"}
                                                >
                                                    <FaPrint size={15} />
                                                </button>
                                            </div>
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
                <div className="flex items-center justify-center gap-3 py-6 border-t border-gray-50">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-3 rounded-2xl transition-all ${currentPage === 1
                            ? "text-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-100 active:scale-90"
                            }`}
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${currentPage === page
                                    ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-3 rounded-2xl transition-all ${currentPage === totalPages
                            ? "text-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-violet-50 hover:text-violet-600 border border-gray-100 active:scale-90"
                            }`}
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            )}

            {/* View Modal */}
            {viewModalOpen && selectedBill && (
                <BillViewModal bill={selectedBill} onClose={closeViewModal} />
            )}
        </div>
    );
};

export default BillsList;