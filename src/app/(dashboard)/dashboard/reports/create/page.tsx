"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const CreateReportPage: React.FC = () => {
    const router = useRouter();

    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newReport = { name, type, status };
        console.log("New report created:", newReport);

        // Navigate back to reports list after creation
        router.push("/dashboard/reports");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-start p-6">
            <div className="w-full max-w-lg bg-white rounded shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Create New Report</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <label className="mb-1 font-semibold">Report Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter report name"
                            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-semibold">Report Type</label>
                        <input
                            type="text"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            placeholder="Enter report type"
                            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-semibold">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            required
                        >
                            <option value="">Select status</option>
                            <option value="Completed">Completed</option>
                            <option value="In-Review">In-Review</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/reports")}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        >
                            Create Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReportPage;
