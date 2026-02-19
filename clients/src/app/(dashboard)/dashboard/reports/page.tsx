"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReportsHeader from "@/components/report/ReportsHeader";
import ReportsTable from "@/components/report/ReportsTable";
import { Report } from "@/types/report";
import { reportsData } from "@/data/report";

const ReportsPage: React.FC = () => {
    const router = useRouter();

    // Use state to manage displayed reports
    const [reports, setReports] = useState<Report[]>(reportsData);

    // Search/filter function
    const handleSearch = (query: string) => {
        const filtered = reportsData.filter(
            (r) =>
                r.name.toLowerCase().includes(query.toLowerCase()) ||
                r.type.toLowerCase().includes(query.toLowerCase()) ||
                r.status.toLowerCase().includes(query.toLowerCase())
        );
        setReports(filtered);
    };

    // Optional actions for each report
    const handleEdit = (report: Report) => console.log("Edit report:", report);
    const handleDelete = (report: Report) =>
        setReports((prev) => prev.filter((r) => r.id !== report.id));
    const handleExport = (report: Report) => console.log("Export report:", report);

    // Navigate to view report details page
    const handleView = (report: Report) => {
        router.push(`/dashboard/reports/${report.id}`);
    };


    const handleCreateReport = () => router.push(`/dashboard/reports/create`);



    return (
        <div className="min-h-screen">
            <ReportsHeader onSearch={handleSearch} onGenerate={handleCreateReport} />
            <main className="container mx-auto">
                <ReportsTable
                    reports={reports}
                    itemsPerPageOptions={[10, 20]}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onExport={handleExport}
                />
            </main>
        </div>
    );
};

export default ReportsPage;
