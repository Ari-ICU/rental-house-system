"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReportsHeader from "@/components/report/ReportsHeader";
import ReportsTable from "@/components/report/ReportsTable";
import { Report } from "@/types/report";
import * as reportService from "@/services/reportService";

const ReportsPage: React.FC = () => {
    const router = useRouter();

    const [allReports, setAllReports] = useState<Report[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const data = await reportService.getAllReports();
            setAllReports(data);
            setReports(data);
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleSearch = (query: string) => {
        const filtered = allReports.filter(
            (r) =>
                r.name.toLowerCase().includes(query.toLowerCase()) ||
                r.type.toLowerCase().includes(query.toLowerCase()) ||
                r.status.toLowerCase().includes(query.toLowerCase())
        );
        setReports(filtered);
    };

    const handleEdit = async (report: Report) => {
        try {
            await reportService.updateReport(report.id, {
                name: report.name,
                type: report.type,
                status: report.status,
            });
            await fetchReports();
        } catch (error) {
            console.error("Failed to update report:", error);
        }
    };

    const handleDelete = async (report: Report) => {
        try {
            await reportService.deleteReport(report.id);
            await fetchReports();
        } catch (error) {
            console.error("Failed to delete report:", error);
        }
    };

    const handleExport = (report: Report) => {
        const headers = ["ID", "Name", "Type", "Status", "Start Date", "End Date", "Generated At"];
        const row = [
            report.id,
            `"${report.name.replace(/"/g, '""')}"`,
            `"${report.type.replace(/"/g, '""')}"`,
            report.status,
            report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A',
            report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A',
            new Date(report.generatedAt).toLocaleString()
        ];

        const csvContent = [headers.join(","), row.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `report_${report.id}_${report.name.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (report: Report) => {
        router.push(`/dashboard/reports/${report.id}`);
    };

    const handleCreateReport = () => router.push(`/dashboard/reports/create`);



    return (
        <div className="min-h-screen">
            <ReportsHeader onSearch={handleSearch} onGenerate={handleCreateReport} />
            <main className="container mx-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <ReportsTable
                        reports={reports}
                        itemsPerPageOptions={[10, 20]}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onExport={handleExport}
                    />
                )}
            </main>
        </div>
    );
};

export default ReportsPage;
