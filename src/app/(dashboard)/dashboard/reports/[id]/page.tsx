"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { reportsData } from "@/data/report";
import { Report } from "@/types/report";
import { FaArrowLeft } from "react-icons/fa";

const ReportViewPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const reportId = Number(params.id);

    // Find the report by ID from the mock data
    const report: Report | undefined = reportsData.find((r) => r.id === reportId);

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Report not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-6 text-blue-500 hover:text-blue-600"
            >
                <FaArrowLeft /> Back
            </button>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">{report.name}</h1>
                <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Type:</span> {report.type}
                </p>
                <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Generated At:</span>{" "}
                    {new Date(report.generatedAt).toLocaleString()}
                </p>
                <p className="text-gray-600 mb-4">
                    <span className="font-semibold">Status:</span> {report.status}
                </p>

                <hr className="my-4" />

                <div>
                    <h2 className="text-xl font-semibold mb-2">Report Details</h2>
                    <p className="text-gray-700">
                        {/* Replace this with actual report content if available */}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                        malesuada, nisl vel tincidunt facilisis, justo sapien placerat
                        magna, nec facilisis lectus libero sit amet nunc.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReportViewPage;
