"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReportsHeader from "@/components/report/ReportsHeader";
import ReportsTable from "@/components/report/ReportsTable";
import { Report } from "@/types/report";
import * as reportService from "@/services/reportService";
import { getAllRentals } from "@/services/rentalService";
import { getAllBills } from "@/services/billService";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { useLang } from "@/context/LangContext";

const ReportsPage: React.FC = () => {
    const router = useRouter();
    const { lang } = useLang();

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
                const allBills = await getAllBills();

                // Filter bills by report start/end date
                const bills = allBills.filter(b => {
                    // Assuming month string like "2026-02" or similar, fallback to createdAt if not easily parsed. Let's just use createdAt or month if we know its format.
                    // For safety, let's use the createdAt date since we don't have a specific formal standard format guaranteed for `month` text in Bills type here.
                    const billDate = new Date(b.createdAt || new Date());
                    if (report.startDate && billDate < new Date(report.startDate)) return false;

                    // We need to adjust endDate to include the whole day (23:59:59) for an inclusive check
                    if (report.endDate) {
                        const endBoundary = new Date(report.endDate);
                        endBoundary.setHours(23, 59, 59, 999);
                        if (billDate > endBoundary) return false;
                    }
                    return true;
                });

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
                csvContent += `Start Date:,${report.startDate ? formatKhmerDate(report.startDate as unknown as string, lang) : 'N/A'}\n`;
                csvContent += `End Date:,${report.endDate ? formatKhmerDate(report.endDate as unknown as string, lang) : 'N/A'}\n`;
                csvContent += `Generated At:,${formatKhmerDate(report.generatedAt as unknown as string, lang)}\n\n`;

                csvContent += [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
                filePrefix = "revenue_report";

            } else if (report.type === "Occupancy" || report.type === "Rentals") {
                // Fetch rentals for occupancy report
                const allRentals = await getAllRentals();

                // Filter rentals by report start/end date
                const rentals = allRentals.filter(r => {
                    // if room has no startDate recorded, we'll use createdAt
                    const rentalDate = r.startDate ? new Date(r.startDate) : new Date(r.createdAt || new Date());
                    if (report.startDate && rentalDate < new Date(report.startDate)) return false;

                    if (report.endDate) {
                        const endBoundary = new Date(report.endDate);
                        endBoundary.setHours(23, 59, 59, 999);
                        if (rentalDate > endBoundary) return false;
                    }
                    return true;
                });

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
                csvContent += `Start Date:,${report.startDate ? formatKhmerDate(report.startDate as unknown as string, lang) : 'N/A'}\n`;
                csvContent += `End Date:,${report.endDate ? formatKhmerDate(report.endDate as unknown as string, lang) : 'N/A'}\n`;
                csvContent += `Generated At:,${formatKhmerDate(report.generatedAt as unknown as string, lang)}\n\n`;

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
                    report.startDate ? formatKhmerDate(report.startDate as unknown as string, lang) : 'N/A',
                    report.endDate ? formatKhmerDate(report.endDate as unknown as string, lang) : 'N/A',
                    formatKhmerDate(report.generatedAt as unknown as string, lang)
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
