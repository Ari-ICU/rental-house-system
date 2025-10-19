'use client';

import React from "react";
import { FaTimes } from "react-icons/fa";
import { Bill } from "@/types/bill";
import { useLang } from "@/context/LangContext";

interface BillViewModalProps {
    bill: Bill | null;
    onClose: () => void;
}

const statusColors: Record<"Paid" | "Unpaid", string> = {
    Paid: "bg-green-100 text-green-800",
    Unpaid: "bg-red-100 text-red-800",
};

export default function BillViewModal({ bill, onClose }: BillViewModalProps) {
    const { lang } = useLang();
    if (!bill) return null;

    const translateStatus = (status: "Paid" | "Unpaid") => {
        if (lang === "en") return status;
        return status === "Paid" ? "បានបង់" : "មិនទាន់បង់";
    };

    return (
        <div className="fixed inset-0 bg-black p-6 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                    title={lang === "en" ? "Close" : "បិទ"}
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    {lang === "en" ? "Bill Details" : "ព័ត៌មានវិក្កយបត្រ"}
                </h2>

                {/* Details */}
                <div className="space-y-3 text-sm">
                    <p>
                        <strong>{lang === "en" ? "Client:" : "អតិថិជន:"}</strong>{" "}
                        {bill.rental?.ClientName || "N/A"}
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Month:" : "ខែ:"}</strong> {bill.month}
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Room Price:" : "តម្លៃបន្ទប់:"}</strong> {bill.rental?.rentAmount}/mo
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Electricity Amount:" : "ចំណាយអគ្គិសនី:"}</strong>{" "}
                        ${bill.electricityAmount}
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Electricity Status:" : "ស្ថានភាពអគ្គិសនី:"}</strong>{" "}
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bill.electricityStatus]}`}
                        >
                            {translateStatus(bill.electricityStatus)}
                        </span>
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Water Amount:" : "ចំណាយទឹក:"}</strong>{" "}
                        ${bill.waterAmount}
                    </p>
                    <p>
                        <strong>{lang === "en" ? "Water Status:" : "ស្ថានភាពទឹក:"}</strong>{" "}
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[bill.waterStatus]}`}
                        >
                            {translateStatus(bill.waterStatus)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
