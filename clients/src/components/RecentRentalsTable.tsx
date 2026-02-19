'use client';

import { Rental } from "@/types/rents";
import { useLang } from "@/context/LangContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecentRentalsTableProps {
    rentals: Rental[];
}

const statusColors: Record<string, string> = {
    "In-Active": "bg-blue-50 text-blue-700 border border-blue-100",
    "Non-Active": "bg-gray-100 text-gray-600 border border-gray-200",
    "Past": "bg-green-50 text-green-700 border border-green-100",
};

const RecentRentalsTable = ({ rentals }: RecentRentalsTableProps) => {
    const { lang } = useLang();
    const router = useRouter();

    const handleRowClick = (rental: Rental) => {
        router.push(`/dashboard/rentals/${rental.id}`);
    };

    return (
        <div className="overflow-hidden bg-white shadow-sm border border-gray-100 rounded-2xl">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {lang === "en" ? "Client Name" : "អតិថិជន"}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {lang === "en" ? "Room" : "បន្ទប់"}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {lang === "en" ? "Start Date" : "កាលបរិច្ឆេទចាប់ផ្តើម"}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {lang === "en" ? "Status" : "ស្ថានភាព"}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {lang === "en" ? "Rent Amount" : "តម្លៃជួល"}
                            </th>
                            <th className="px-6 py-4 relative">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {rentals.map((rental) => (
                            <tr
                                key={rental.id}
                                className="group hover:bg-purple-50/30 transition-colors duration-200 cursor-pointer"
                                onClick={() => handleRowClick(rental)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                            {rental.ClientName ? rental.ClientName.charAt(0) : "?"}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{rental.ClientName || "N/A"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                        {rental.roomNumber}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {rental.startDate || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[rental.status] || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${rental.status === 'In-Active' ? 'bg-blue-400' :
                                            rental.status === 'Past' ? 'bg-green-400' :
                                                'bg-gray-400'
                                            }`}></span>
                                        {lang === "en"
                                            ? rental.status
                                            : rental.status === "Past"
                                                ? "បញ្ចប់"
                                                : rental.status === "In-Active"
                                                    ? "សកម្ម"
                                                    : rental.status === "Non-Active"
                                                        ? "មិនសកម្ម"
                                                        : rental.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    ${rental.rentAmount?.toLocaleString() || "0"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-400 group-hover:text-purple-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentRentalsTable;
