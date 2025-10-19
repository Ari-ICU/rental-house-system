'use client';

import React, { useState } from "react";
import BillsList from "@/components/bills/BillsList";
import { bills as billsData } from "@/data/bills";
import { Bill } from "@/types/bill";
import BillHeader from "@/components/bills/BillHeader";
import { formatKhmerDate } from "@/utils/dateFormatter";

const BillsPage: React.FC = () => {
    // State to manage displayed bills
    const [bills, setBills] = useState<Bill[]>(billsData);

    const handleSearch = (query: string) => {
        // Normalize the query: lowercase, collapse multiple spaces, trim
        const lowerQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

        const filtered = billsData.filter((b) => {
            const clientName = (b.rental?.ClientName || "").toLowerCase().replace(/\s+/g, " ").trim();
            const electricityStatus = b.electricityStatus.toLowerCase();
            const waterStatus = b.waterStatus.toLowerCase();

            // English month
            const monthEn = b.month
                ? new Date(b.month)
                    .toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                    })
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim()
                : "";

            // Khmer month using your formatKhmerDate function
            const monthKm = b.month
                ? formatKhmerDate(b.month, "km").toLowerCase().replace(/\s+/g, " ").trim()
                : "";

            return (
                clientName.includes(lowerQuery) ||
                electricityStatus.includes(lowerQuery) ||
                waterStatus.includes(lowerQuery) ||
                monthEn.includes(lowerQuery) ||
                monthKm.includes(lowerQuery)
            );
        });

        setBills(filtered);
    };



    const handleAdd = () => {
        alert("Add Rental clicked!");
    };

    return (
        <div className="min-h-screen ">
            <BillHeader onAdd={handleAdd} onSearch={handleSearch} />

            <main>
                <BillsList
                    bills={bills}
                />
            </main>
        </div>
    );
};

export default BillsPage;
