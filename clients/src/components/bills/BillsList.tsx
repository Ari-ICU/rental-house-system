'use client';

import React, { useState, useEffect } from "react";
import { Eye, Edit3, Trash2, Printer, Download } from "lucide-react";
import { Bill } from "@/types/bill";
import { formatKhmerDate } from "@/utils/dateFormatter";
import BillViewModal from "@/components/bills/BillViewModal";
import { useLang } from "@/context/LangContext";
import { printBill } from "@/components/bills/printBill";
import { deleteBill, downloadBillPdf } from "@/services/billService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/common/CustomDropdown";

interface BillsListProps {
    bills: Bill[];
    itemsPerPageOptions?: number[];
    onRefresh?: () => void;
}

const statusColors: Record<"Paid" | "Unpaid", string> = {
    Paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50",
    Unpaid: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50",
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
                const res = await fetch('/api/settings');
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

    const handleDownloadPdf = async (bill: Bill) => {
        const toastId = toast.loading(lang === 'en' ? 'Generating PDF...' : 'កំពុងបង្កើតឯកសារ PDF...');
        try {
            const blob = await downloadBillPdf(bill.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice_Room_${bill.rental?.roomNumber || 'Unknown'}_${bill.month}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(lang === 'en' ? 'PDF downloaded' : 'ការទាញយកជោគជ័យ', { id: toastId });
        } catch {
            toast.error(lang === 'en' ? 'Failed to download PDF' : 'ការទាញយក PDF បរាជ័យ', { id: toastId });
        }
    };

    return (
        <div className="flex flex-col w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 px-6 pt-5 pb-3">
                <div className="text-xs text-slate-450 dark:text-slate-400 font-bold pb-2 uppercase tracking-wide">
                    {lang === 'en'
                        ? `Showing ${currentBills.length} of ${filteredBills.length} records`
                        : `បង្ហាញ ${currentBills.length} ក្នុងចំណោម ${filteredBills.length} កំណត់ត្រា`}
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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

            {/* Desktop Table View */}
            <div className="hidden md:block relative overflow-x-auto w-full">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800/85 text-slate-500 dark:text-slate-450 font-bold text-xs uppercase tracking-wider">
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
                                    className="px-6 py-3.5 font-bold"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                        {currentBills.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
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
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                                            #{bill.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                                    {bill.rental?.ClientName || 'N/A'}
                                                </span>
                                                <span className="text-xs text-slate-450 dark:text-slate-500 mt-1 font-semibold">
                                                    Room: {bill.rental?.roomNumber || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-650 dark:text-slate-350 font-semibold">
                                            {formatKhmerDate(bill.month, lang)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            ${(activeRentAmount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {bill.electricityAmount && bill.electricityAmount > 0 ? (
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${statusColors[bill.electricityStatus] || "bg-slate-100 text-slate-700"}`}>
                                                        {lang === "en" ? bill.electricityStatus : bill.electricityStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                    </span>
                                                    <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                                                        ${bill.electricityAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {bill.waterAmount && bill.waterAmount > 0 ? (
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold leading-tight ${statusColors[bill.waterStatus] || "bg-slate-100 text-slate-700"}`}>
                                                        {lang === "en" ? bill.waterStatus : bill.waterStatus === "Paid" ? "បានបង់" : "មិនបង់"}
                                                    </span>
                                                    <span className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
                                                        ${bill.waterAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            ${totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleView(bill)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title={lang === "en" ? "View" : "មើល"}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/bills/edit/${bill.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title={lang === "en" ? "Edit" : "កែប្រែ"}
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bill.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title={lang === "en" ? "Delete" : "លុប"}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                                                <button
                                                    onClick={() => handlePrint(bill)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title={lang === "en" ? "Print" : "បោះពុម្ព"}
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPdf(bill)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                    title={lang === "en" ? "Download PDF" : "ទាញយក PDF"}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
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

            {/* Mobile Responsive Cards View */}
            <div className="block md:hidden px-6 pb-6 space-y-4">
                {currentBills.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        {lang === "en" ? "No matches found." : "រកមិនឃើញលទ្ធផលដែលត្រូវគ្នា។"}
                    </div>
                ) : (
                    currentBills.map((bill) => {
                        const activeRentAmount = bill.rentAmount ?? bill.rental?.rentAmount ?? 0;
                        const totalAmount = activeRentAmount + (bill.electricityAmount || 0) + (bill.waterAmount || 0);
                        const isOverdue = bill.electricityStatus === 'Unpaid' || bill.waterStatus === 'Unpaid';
                        
                        return (
                            <div key={bill.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-3.5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400">#{bill.id}</span>
                                    <span className="text-xs font-bold text-slate-500">{formatKhmerDate(bill.month, lang)}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{bill.rental?.ClientName || 'N/A'}</h4>
                                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5 font-semibold">Room: {bill.rental?.roomNumber || 'N/A'}</p>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-extrabold tracking-wide">
                                    <div>
                                        <p>{lang === 'en' ? 'Rent' : 'តម្លៃបន្ទប់'}</p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">${activeRentAmount.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p>{lang === 'en' ? 'Electric' : 'អគ្គិសនី'}</p>
                                        <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-1">${(bill.electricityAmount || 0).toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p>{lang === 'en' ? 'Water' : 'ទឹក'}</p>
                                        <p className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-1">${(bill.waterAmount || 0).toFixed(1)}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{lang === 'en' ? 'Total Due' : 'សរុបត្រូវបង់'}</p>
                                        <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">${totalAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleView(bill)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 rounded-xl transition-colors cursor-pointer"><Eye className="w-4 h-4" /></button>
                                        <button onClick={() => router.push(`/dashboard/bills/edit/${bill.id}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 rounded-xl transition-colors cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(bill.id)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-rose-500 rounded-xl transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                        <button onClick={() => handlePrint(bill)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-indigo-650 rounded-xl transition-colors cursor-pointer"><Printer className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className={`flex items-center px-4 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${currentPage === 1
                            ? "border-slate-200 dark:border-slate-700 text-slate-350 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-850"
                            : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                            }`}
                    >
                        {lang === 'en' ? 'Previous' : 'មុន'}
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${currentPage === page
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-transparent text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`flex items-center px-4 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${currentPage === totalPages
                            ? "border-slate-200 dark:border-slate-700 text-slate-355 dark:text-slate-600 cursor-not-allowed bg-white dark:bg-slate-850"
                            : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 shadow-sm"
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