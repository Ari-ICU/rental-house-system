"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaFileExport, FaEye, FaSave, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export interface Report {
    id: number;
    name: string;
    type: string;
    generatedAt: string;
    status: "Completed" | "In-Review";
}

interface ReportsTableProps {
    reports: Report[];
    itemsPerPageOptions?: number[];
    onEdit?: (report: Report) => void;
    onDelete?: (report: Report) => void;
    onExport?: (report: Report) => void;
    onView?: (report: Report) => void;
}

const statusColors: Record<Report["status"], string> = {
    Completed: "bg-green-100 text-green-800",
    "In-Review": "bg-red-100 text-red-800"
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
        setEditForm(report);
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

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this report?")) {
            setLocalReports((prev) => prev.filter((r) => r.id !== id));
            onDelete?.(localReports.find((r) => r.id === id)!);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700">Filter by Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as Report["status"] | "All");
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        <option value="All">All</option>
                        {allStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <label className="text-sm font-medium text-gray-700">Items per Page</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(parseInt(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        {itemsPerPageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt} per page
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
                            {["Name", "Type", "Generated At", "Status", "Actions"].map((header, idx) => (
                                <th
                                    key={idx}
                                    className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentReports.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500">
                                    No reports found.
                                </td>
                            </tr>
                        ) : (
                            currentReports.map((report) => {
                                const isEditing = editingId === report.id;
                                const currentEditForm = isEditing ? editForm : null;

                                return (
                                    <tr
                                        key={report.id}
                                        className={`border-b border-gray-200 ${
                                            report.id % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={currentEditForm?.name || ""}
                                                    onChange={(e) =>
                                                        setEditForm((prev) =>
                                                            prev ? { ...prev, name: e.target.value } : prev
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                report.name
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={currentEditForm?.type || ""}
                                                    onChange={(e) =>
                                                        setEditForm((prev) =>
                                                            prev ? { ...prev, type: e.target.value } : prev
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                report.type
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{new Date(report.generatedAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            {isEditing ? (
                                                <select
                                                    value={currentEditForm?.status || ""}
                                                    onChange={(e) =>
                                                        setEditForm((prev) =>
                                                            prev ? { ...prev, status: e.target.value as Report["status"] } : prev
                                                        )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                >
                                                    {allStatuses.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        statusColors[report.status]
                                                    }`}
                                                >
                                                    {report.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                                    >
                                                        <FaSave size={12} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
                                                    >
                                                        <FaTimes size={12} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onView?.(report)}
                                                        className="bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 transition"
                                                    >
                                                        <FaEye size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditStart(report)}
                                                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                                                    >
                                                        <FaEdit size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => onExport?.(report)}
                                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                                                    >
                                                        <FaFileExport size={12} />
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
                        {currentPage} of {totalPages}
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
        </div>
    );
};

export default ReportsTable;
