"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReportsHeader from "@/components/report/ReportsHeader";
import ReportsTable from "@/components/report/ReportsTable";
import { Report } from "@/types/report";
import * as reportService from "@/services/reportService";
import { getAllRentals } from "@/services/rentalService";
import { getAllBills } from "@/services/billService";

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

    const handleExport = async (report: Report) => {
        try {
            let csvContent = "";
            let filePrefix = "report";

            // Helper to format strings with quotes to prevent CSV breaking
            const formatCsvStr = (str: string | undefined | null) => str ? `"${String(str).replace(/"/g, '""')}"` : '""';

            if (report.type === "Revenue" || report.type === "Financial") {
                // Fetch bills for revenue report
                const bills = await getAllBills();

                const headers = ["Bill ID", "Rental ID", "Month", "Electricity Amount", "Water Amount", "Electricity Status", "Water Status"];
                const rows = bills.map(b => [
                    b.id,
                    b.rental?.id,
                    formatCsvStr(b.month),
                    b.electricityAmount,
                    b.waterAmount,
                    formatCsvStr(b.electricityStatus),
                    formatCsvStr(b.waterStatus)
                ]);

                // Prepend report metadata summary at top
                csvContent += `Report Name:,${formatCsvStr(report.name)}\n`;
                csvContent += `Type:,${formatCsvStr(report.type)}\n`;
                csvContent += `Generated At:,${new Date(report.generatedAt).toLocaleString()}\n\n`;

                csvContent += [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                filePrefix = "revenue_report";

            } else if (report.type === "Occupancy" || report.type === "Rentals") {
                // Fetch rentals for occupancy report
                const rentals = await getAllRentals();

                const headers = ["Rental ID", "Client Name", "Room Number", "Status", "Rent Amount", "Start Date", "End Date", "Phone"];
                const rows = rentals.map(r => [
                    r.id,
                    formatCsvStr(r.ClientName),
                    formatCsvStr(r.roomNumber),
                    formatCsvStr(r.status),
                    r.rentAmount,
                    formatCsvStr(r.startDate),
                    formatCsvStr(r.endDate),
                    formatCsvStr(r.clientPhone)
                ]);

                csvContent += `Report Name:,${formatCsvStr(report.name)}\n`;
                csvContent += `Type:,${formatCsvStr(report.type)}\n`;
                csvContent += `Generated At:,${new Date(report.generatedAt).toLocaleString()}\n\n`;

                csvContent += [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                filePrefix = "occupancy_report";

            } else {
                // Default fallback to basic report details if type is unknown
                const headers = ["ID", "Name", "Type", "Status", "Start Date", "End Date", "Generated At"];
                const row = [
                    report.id,
                    formatCsvStr(report.name),
                    formatCsvStr(report.type),
                    report.status,
                    report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A',
                    report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A',
                    new Date(report.generatedAt).toLocaleString()
                ];
                csvContent = [headers.join(","), row.join(",")].join("\n");
            }

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `${filePrefix}_${report.id}_${report.name.replace(/\s+/g, '_')}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate report export:", error);
            alert("Failed to export report data. Please try again.");
        }
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
