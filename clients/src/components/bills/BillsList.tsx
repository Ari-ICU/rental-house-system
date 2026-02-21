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
    Paid: "bg-emerald-50 text-emerald-700",
    Unpaid: "bg-rose-50 text-rose-700",
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
    const [exchangeRate, setExchangeRate] = useState(4100);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.data?.exchangeRate) {
                        setExchangeRate(Number(data.data.exchangeRate));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

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
        printBill(bill, lang, exchangeRate, '/signature.png');
    };

    return (
        <div className="flex flex-col w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 px-6 pt-5 pb-3">
                <div className="text-sm text-slate-500 font-medium pb-2">
                    {lang === 'en'
                        ? `Showing ${currentBills.length} of ${filteredBills.length} records`
                        : `បង្ហាញ ${currentBills.length} ក្នុងចំណោម ${filteredBills.length} កំណត់ត្រា`}
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500">
                            {lang === "en" ? "Status" : "ស្ថានភាព"}
                        </label>
                        <CustomDropdown
                            options={allStatuses.map((status) => ({
                                value: status,
                                label: lang === "en" ? status : status === "Paid" ? "បានបង់" : status === "Unpaid" ? "មិនទាន់បង់" : "ទាំងអស់"
                            }))}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val as 'Paid' | 'Unpaid' | 'All');
                                setCurrentPage(1);
                            }}
                            className="w-40"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500">
                            {lang === "en" ? "Rows per page" : "ចំនួនក្នុងមួយទំព័រ"}
                        </label>
                        <CustomDropdown
                            options={itemsPerPageOptions.map((opt) => ({
                                value: String(opt),
                                label: `${opt}`
                            }))}
                            value={String(itemsPerPage)}
                            onChange={(val) => {
                                setItemsPerPage(parseInt(val));
                                setCurrentPage(1);
                            }}
                            className="w-24"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto w-full">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-medium">
                        <tr>
                            {[
                                lang === "en" ? "ID" : "ល.រ",
                                lang === "en" ? "Client & Room" : "អតិថិជន & បន្ទប់",
                                lang === "en" ? "Bill Month" : "វិក្កយបត្រខែ",
                                lang === "en" ? "Room Price" : "តម្លៃបន្ទប់",
                                lang === "en" ? "Electricity" : "អគ្គិសនី",
                                lang === "en" ? "Water" : "ទឹក",
                                lang === "en" ? "Total Due" : "សរុបត្រូវបង់",
                                lang === "en" ? "Actions" : "សកម្មភាព",
                            ].map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-6 py-3 font-medium text-[13px]"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentBills.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-20 text-slate-500 bg-slate-50/50">
                                    {lang === "en" ? "No matches found." : "រកមិនឃើញលទ្ធផលដែលត្រូវគ្នា។"}
                                </td>
                            </tr>
                        ) : (
                            currentBills.map((bill) => {
                                const activeRentAmount = bill.rentAmount ?? bill.rental?.rentAmount ?? 0;
                                const totalAmount = activeRentAmount + (bill.electricityAmount || 0) + (bill.waterAmount || 0);
                                return (
                                    <tr
                                        key={bill.id}
                                        className="hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 tabular-nums">
                                            #{bill.id}
                                        </td>
                                        {/* Client & Room */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900 leading-tight">
                                                    {bill.rental?.ClientName || 'N/A'}
                                                </span>
                                                <span className="text-xs text-slate-500 mt-1">
                                                    Room: {bill.rental?.roomNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Month */}
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                            {formatKhmerDate(bill.month, lang)}
                                        </td>

                                        {/* Room Price */}
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                            ${(bill.rentAmount ?? bill.rental?.rentAmount ?? 0).toFixed(2)}
                                        </td>

                                        {/* Electricity Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium leading-tight ${statusColors[bill.electricityStatus] || "bg-slate-100 text-slate-700"}`}>
                                                    {lang === "en" ? bill.electricityStatus : bill.electricityStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    ${bill.electricityAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Water Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium leading-tight ${statusColors[bill.waterStatus] || "bg-slate-100 text-slate-700"}`}>
                                                    {lang === "en" ? bill.waterStatus : bill.waterStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    ${bill.waterAmount?.toFixed(2) || '0.00'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Total Due */}
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                                            ${totalAmount.toFixed(2)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleView(bill)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                                    title={lang === "en" ? "View" : "មើល"}
                                                >
                                                    <FaEye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/bills/edit/${bill.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                                    title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                                                    title={lang === "en" ? "Delete" : "លុប"}
                                                >
                                                    <FaTrash size={13} />
                                                </button>
                                                <div className="w-[1px] h-3 bg-slate-300 mx-1"></div>
                                                <button
                                                    onClick={() => handlePrint(bill)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                                                    title={lang === "en" ? "Print" : "បោះពុម្ព"}
                                                >
                                                    <FaPrint size={13} />
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
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded border text-sm font-medium transition-colors ${currentPage === 1
                            ? "border-slate-200 text-slate-300 cursor-not-allowed bg-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50 bg-white shadow-sm"
                            }`}
                    >
                        {lang === 'en' ? 'Previous' : 'មុន'}
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === page
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-transparent text-slate-600 hover:bg-slate-200"
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
                            ? "border-slate-200 text-slate-300 cursor-not-allowed bg-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50 bg-white shadow-sm"
                            }`}
                    >
                        {lang === 'en' ? 'Next' : 'បន្ទាប់'}
                    </button>
                </div>
            )}

            {/* View Modal */}
            {viewModalOpen && selectedBill && (
                <BillViewModal bill={selectedBill} onClose={closeViewModal} exchangeRate={exchangeRate} />
            )}
        </div>
    );
};

export default BillsList;