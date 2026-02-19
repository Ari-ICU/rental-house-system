"use client";


import { useLang } from "@/context/LangContext";
import { Report } from "@/types/report";
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaFileExport, FaEye, FaSave, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CustomDropdown from "@/common/CustomDropdown";

interface ReportsTableProps {
    reports: Report[];
    itemsPerPageOptions?: number[];
    onEdit?: (report: Report) => void;
    onDelete?: (report: Report) => void;
    onExport?: (report: Report) => void;
    onView?: (report: Report) => void;
}

const statusColors: Record<Report["status"], string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    "In-Review": "bg-amber-50 text-amber-700 border-amber-100"
};

const allStatuses: Report["status"][] = ["Completed", "In-Review"];

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
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Report | null>(null);

    useEffect(() => {
        setLocalReports(reports);
    }, [reports]);

    const filteredReports =
        statusFilter === "All" ? localReports : localReports.filter((r) => r.status === statusFilter);

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const currentReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleEditStart = (report: Report) => {
        setEditingId(report.id);
        setEditForm({ ...report });
    };

    const handleSave = () => {
        if (editForm && editingId !== null) {
            setLocalReports((prev) => prev.map((r) => (r.id === editingId ? editForm : r)));
            onEdit?.(editForm);
        }
        setEditingId(null);
        setEditForm(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm(null);
    };

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
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                            {lang === 'km' ? 'ត្រងតាមស្ថានភាព' : 'Filter by Status'}
                        </label>
                        <CustomDropdown
                            options={[
                                { value: "All", label: lang === 'km' ? 'ស្ថានភាពទាំងអស់' : 'All Statuses' },
                                { value: "Completed", label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed' },
                                { value: "In-Review", label: lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review' }
                            ]}
                            value={statusFilter}
                            onChange={(val) => {
                                setStatusFilter(val as Report["status"] | "All");
                                setCurrentPage(1);
                            }}
                            className="w-full !rounded-xl !border-gray-100 !shadow-sm hover:!border-blue-400 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1.5 min-w-[160px]">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
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
                            className="w-full !rounded-xl !border-gray-100 !shadow-sm hover:!border-blue-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden mx-4">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
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
                        <tbody className="divide-y divide-gray-50">
                            {currentReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 p-4 rounded-full text-gray-400">
                                                <FaChevronRight size={32} className="rotate-90 opacity-20" />
                                            </div>
                                            <span className="text-gray-400 font-medium">
                                                {lang === 'km' ? 'មិនមានរបាយការណ៍ដែលអ្នកស្វែងរកទេ' : 'No reports matching your criteria'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentReports.map((report) => {
                                    const isEditing = editingId === report.id;
                                    const currentEditForm = isEditing ? editForm : null;

                                    return (
                                        <tr
                                            key={report.id}
                                            className="group hover:bg-blue-50/30 transition-colors duration-200"
                                        >
                                            <td className="px-8 py-6">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={currentEditForm?.name || ""}
                                                        onChange={(e) =>
                                                            setEditForm((prev) =>
                                                                prev ? { ...prev, name: e.target.value } : prev
                                                            )
                                                        }
                                                        className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm font-medium"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{report.name}</span>
                                                        <span className="text-[11px] text-gray-400 font-medium font-mono uppercase tracking-tighter">ID: #{report.id.toString().padStart(4, '0')}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={currentEditForm?.type || ""}
                                                        onChange={(e) =>
                                                            setEditForm((prev) =>
                                                                prev ? { ...prev, type: e.target.value } : prev
                                                            )
                                                        }
                                                        className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-600 bg-gray-100/50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        {report.type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium text-gray-800">{new Date(report.generatedAt).toLocaleDateString()}</span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-400">{new Date(report.generatedAt).toLocaleTimeString()}</span>
                                                        {report.startDate && report.endDate && (
                                                            <span className="text-[10px] text-blue-500 font-bold mt-1">
                                                                {lang === 'km' ? 'រយៈពេល: ' : 'Period: '}
                                                                {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {isEditing ? (
                                                    <CustomDropdown
                                                        options={[
                                                            { value: "Completed", label: lang === 'km' ? 'បានបញ្ចប់' : 'Completed' },
                                                            { value: "In-Review", label: lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review' }
                                                        ]}
                                                        value={currentEditForm?.status || ""}
                                                        onChange={(val) =>
                                                            setEditForm((prev) =>
                                                                prev ? { ...prev, status: val as Report["status"] } : prev
                                                            )
                                                        }
                                                        className="w-full !rounded-xl !border-blue-200"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[report.status]}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        {report.status === 'Completed'
                                                            ? (lang === 'km' ? 'បានបញ្ចប់' : 'Completed')
                                                            : (lang === 'km' ? 'កំពុងពិនិត្យ' : 'In-Review')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                onClick={handleSave}
                                                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-90"
                                                                title="Save Changes"
                                                            >
                                                                <FaSave size={14} />
                                                            </button>
                                                            <button
                                                                onClick={handleCancel}
                                                                className="bg-gray-400 hover:bg-gray-500 text-white p-2.5 rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-90"
                                                                title={lang === 'km' ? 'បោះបង់' : 'Cancel'}
                                                            >
                                                                <FaTimes size={14} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => onView?.(report)}
                                                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2.5 rounded-xl transition-all active:scale-90"
                                                                title={lang === 'km' ? 'មើលលម្អិត' : 'View Details'}
                                                            >
                                                                <FaEye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditStart(report)}
                                                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition-all active:scale-90"
                                                                title="Edit Report"
                                                            >
                                                                <FaEdit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => onExport?.(report)}
                                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2.5 rounded-xl transition-all active:scale-90"
                                                                title="Export Data"
                                                            >
                                                                <FaFileExport size={16} />
                                                            </button>
                                                            <div className="w-px h-6 bg-gray-100 mx-1"></div>
                                                            <button
                                                                onClick={() => handleDelete(report)}
                                                                className="bg-rose-50 hover:bg-rose-100 text-rose-500 p-2.5 rounded-xl transition-all active:scale-90"
                                                                title="Delete Report"
                                                            >
                                                                <FaTrash size={16} />
                                                            </button>
                                                        </>
                                                    )}
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
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === 1
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm active:scale-95"
                                }`}
                        >
                            <FaChevronLeft size={12} />
                            {lang === 'km' ? 'ថយក្រោយ' : 'Previous'}
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${currentPage === totalPages
                                ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm active:scale-95"
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
