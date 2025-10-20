'use client';

import React, { useState } from "react";
import BillsList from "@/components/bills/BillsList";
import { bills as billsData } from "@/data/bills";
import { Bill } from "@/types/bill";
import BillHeader from "@/components/bills/BillHeader";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { printMultipleBills } from "@/components/bills/printMultipleBills";
import { useLang } from "@/context/LangContext"; // your global lang context

const BillsPage: React.FC = () => {
    const { lang } = useLang(); // get current global language

    // State to manage bills
    const [bills, setBills] = useState<Bill[]>(billsData);

    // Search function works for both English and Khmer
    const handleSearch = (query: string) => {
        const lowerQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

        const filtered = billsData.filter((b) => {
            const clientName = (b.rental?.ClientName || "").toLowerCase().replace(/\s+/g, " ").trim();
            const electricityStatus = b.electricityStatus.toLowerCase();
            const waterStatus = b.waterStatus.toLowerCase();

            const monthEn = b.month
                ? new Date(b.month)
                    .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" })
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim()
                : "";

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
        alert(lang === "km" ? "បានចុចបន្ថែមការជួល!" : "Add Rental clicked!");
    };

    const handlePrintAll = () => {
        if (bills.length === 0) {
            alert(lang === "km" ? "មិនមានវិក័យប័ត្រណាមួយសម្រាប់បោះពុម្ព!" : "No bills to print!");
            return;
        }
        printMultipleBills(bills, lang, '/signature.png');
    };

    return (
        <div className="min-h-screen">
            <BillHeader onAdd={handleAdd} onSearch={handleSearch} onPrint={handlePrintAll} />
            <main>
                <BillsList bills={bills} />
            </main>
        </div>
    );
};

export default BillsPage;
