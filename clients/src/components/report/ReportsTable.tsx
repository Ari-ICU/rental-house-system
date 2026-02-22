"use client";


import { useLang } from "@/context/LangContext";
import { Report } from "@/types/report";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaFileExport, FaEye, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CustomDropdown from "@/common/CustomDropdown";
import { formatKhmerDate } from "@/utils/dateFormatter";

interface ReportsTableProps {
    reports: Report[];
    itemsPerPageOptions?: number[];
    onEdit?: (report: Report) => void;
    onDelete?: (report: Report) => void;
    onExport?: (report: Report) => void;
    onView?: (report: Report) => void;
}

const statusColors: Record<Report["status"], string> = {
    Completed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "In-Review": "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    Pending: "bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400",
    Generating: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Archived: "bg-gray-100 dark:bg-gray-500/10 text-gray-800 dark:text-gray-400"
};

const ReportsTable: React.FC<ReportsTableProps> = ({
    reports = [],
    itemsPerPageOptions = [5, 10, 20],
    onEdit,
    onDelete,
    onExport,
    onView,
}) => {
    const { lang } = useLang();
    const [localReports, setLocalReports] = useState<Report[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
    const [statusFilter, setStatusFilter] = useState<Report["status"] | "All">("All");

    useEffect(() => {
        setLocalReports(reports);
    }, [reports]);

    const filteredReports =
        statusFilter === "All" ? localReports : localReports.filter((r) => r.status === statusFilter);

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDelete = (report: Report) => {
        const confirmMsg = lang === 'km'
            ? "តើអ្នកប្រាកដថាចង់លុបរបាយការណ៍នេះមែនទេ?"
            : "Are you sure you want to delete this report?";
        if (confirm(confirmMsg)) {
            setLocalReports((prev) => prev.filter((r) => r.id !== report.id));
            onDelete?.(report);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Filters Section */}
            <div className="flex flex-wrap items-center justify-between gap-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                            {lang === 'km' ? 'ត្រងតាមស្ថានភាព' : 'Filter by Status'}
                        </label>
                        <CustomDropdown
                            options={[
                                { value: "All", label: lang === 'km' ? 'ស្ថានភាពទាំងអស់' : 'All Statuses' },
                                { value: "Pending", label: lang === 'km' ? 'រង់ចាំ' : 'Pending' },
                                { value: "Generating", label: lang === 'km' ? 'កំពុងបង្កើត' : 'Generating' },
                                { value: "In-Review", label: lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review' },
                                { value: "Completed", label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed' },
                                { value: "Archived", label: lang === 'km' ? 'បានទុក' : 'Archived' }
                            ]}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val as Report["status"] | "All");
                                setCurrentPage(1);
                            }}
                            searchable={true}
                            className="w-full !rounded-xl !border-gray-100 !shadow-sm hover:!border-blue-400 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                            {lang === 'km' ? 'ចំនួនក្នុងមួយទំព័រ' : 'Items per Page'}
                        </label>
                        <CustomDropdown
                            options={itemsPerPageOptions.map(opt => ({
                                value: String(opt),
                                label: lang === 'km' ? `${opt} ជួរ` : `${opt} rows`
                            }))}
                            value={String(itemsPerPage)}
                            onChange={(val) => {
                                setItemsPerPage(parseInt(val));
                                setCurrentPage(1);
                            }}
                            searchable={true}
                            className="w-full !rounded-xl !border-gray-100 !shadow-sm hover:!border-blue-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden mx-4">
                <div className="overflow-x-auto w-full min-h-[400px]">
                    <table className="min-w-[900px] w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                {[
                                    lang === 'km' ? "ឈ្មោះរបាយការណ៍" : "Report Name",
                                    lang === 'km' ? "ប្រភេទ" : "Category",
                                    lang === 'km' ? "ថ្ងៃបង្កើត" : "Generated At",
                                    lang === 'km' ? "ស្ថានភាព" : "Current Status",
                                    lang === 'km' ? "សកម្មភាព" : "Actions"
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className="px-8 py-5 text-left text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {currentReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full text-gray-400 dark:text-gray-600">
                                                <FaChevronRight size={32} className="rotate-90 opacity-20" />
                                            </div>
                                            <span className="text-gray-400 dark:text-gray-500 font-medium">
                                                {lang === 'km' ? 'មិនមានរបាយការណ៍ដែលអ្នកស្វែងរកទេ' : 'No reports matching your criteria'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentReports.map((report) => {

                                    return (
                                        <tr
                                            key={report.id}
                                            className="group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors duration-200"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[15px] font-bold text-gray-900 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.name}</span>
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium font-mono uppercase tracking-tighter">ID: #{report.id.toString().padStart(4, '0')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                                                    {report.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">{formatKhmerDate(report.generatedAt as unknown as string, lang)}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(report.generatedAt).toLocaleTimeString()}</span>
                                                        {report.startDate && report.endDate && (
                                                            <span className="text-[10px] text-blue-500 font-bold mt-1">
                                                                {lang === 'km' ? 'រយៈពេល: ' : 'Period: '}
                                                                {formatKhmerDate(report.startDate, lang)} - {formatKhmerDate(report.endDate, lang)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium leading-tight ${statusColors[report.status]}`}
                                                >
                                                    {report.status === 'Completed' ? (lang === 'km' ? 'បានបញ្ចប់' : 'Completed') :
                                                        report.status === 'In-Review' ? (lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review') :
                                                            report.status === 'Generating' ? (lang === 'km' ? 'កំពុងបង្កើត' : 'Generating') :
                                                                report.status === 'Pending' ? (lang === 'km' ? 'រង់ចាំ' : 'Pending') :
                                                                    (lang === 'km' ? 'បានទុក' : 'Archived')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => onView?.(report)}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title={lang === 'km' ? 'មើលលម្អិត' : 'View Details'}
                                                    >
                                                        <FaEye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit?.(report)}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title="Edit Report"
                                                    >
                                                        <FaEdit size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => onExport?.(report)}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title="Export Data"
                                                    >
                                                        <FaFileExport size={14} />
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(report)}
                                                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                                        title="Delete Report"
                                                    >
                                                        <FaTrash size={13} />
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
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 mt-2 px-8">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-100 dark:border-slate-700">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === 1
                                ? "bg-gray-50 dark:bg-slate-900 text-gray-300 dark:text-slate-600 border-gray-100 dark:border-slate-800 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm active:scale-95"
                                }`}
                        >
                            <FaChevronLeft size={12} />
                            {lang === 'km' ? 'ថយក្រោយ' : 'Previous'}
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === totalPages
                                ? "bg-gray-50 dark:bg-slate-900 text-gray-300 dark:text-slate-600 border-gray-100 dark:border-slate-800 cursor-not-allowed"
                                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 shadow-sm active:scale-95"
                                }`}
                        >
                            {lang === 'km' ? 'បន្ទាប់' : 'Next'}
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsTable;
