'use client';

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BillsList from "@/components/bills/BillsList";
import { bills as billsData } from "@/data/bills";
import { Bill } from "@/types/bill";
import BillHeader from "@/components/bills/BillHeader";
import { formatKhmerDate } from "@/utils/dateFormatter";
import { printMultipleBills } from "@/components/bills/printMultipleBills";
import { useLang } from "@/context/LangContext";

const BillsPage: React.FC = () => {
    const { lang } = useLang();
    const router = useRouter();

    const [bills, setBills] = useState<Bill[]>(billsData);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBills = useMemo(() => {
        if (!searchQuery.trim()) return bills;

        const lowerQuery = searchQuery.toLowerCase().replace(/\s+/g, " ").trim();

        return billsData.filter((b) => {
            const clientName = (b.rental?.ClientName || "").toLowerCase().replace(/\s+/g, " ").trim();
            const electricityStatus = b.electricityStatus.toLowerCase();
            const waterStatus = b.waterStatus.toLowerCase();

            const monthEn = b.month
                ? new Date(b.month)
                    .toLocaleDateString("en-US", { year: "numeric", month: "long" })
                    .toLowerCase()
                    .trim()
                : "";

            const monthKm = b.month
                ? formatKhmerDate(b.month, "km").toLowerCase().trim()
                : "";

            return (
                clientName.includes(lowerQuery) ||
                electricityStatus.includes(lowerQuery) ||
                waterStatus.includes(lowerQuery) ||
                monthEn.includes(lowerQuery) ||
                monthKm.includes(lowerQuery)
            );
        });
    }, [searchQuery, bills]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleAdd = () => {
        router.push("/dashboard/bills/create"); // Navigate to create page
    };

    const handlePrintAll = () => {
        if (!filteredBills.length) {
            alert(lang === "km" ? "មិនមានវិក័យប័ត្រណាមួយសម្រាប់បោះពុម្ព!" : "No bills to print!");
            return;
        }
        printMultipleBills(filteredBills, lang, "/signature.png");
    };

    return (
        <div className="min-h-screen ">
            <BillHeader
                onAdd={handleAdd}
                onSearch={handleSearch}
                onPrint={handlePrintAll}
            />
            <main className="">
                {filteredBills.length > 0 ? (
                    <BillsList bills={filteredBills} />
                ) : (
                    <p className="text-center text-gray-500 mt-10">
                        {lang === "km" ? "មិនមានវិក័យប័ត្រណាមួយសំរាប់បង្ហាញ" : "No bills found"}
                    </p>
                )}
            </main>
        </div>
    );
};

export default BillsPage;
