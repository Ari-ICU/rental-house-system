'use client';

import { Rental } from "@/types/rents";
import { useLang } from "@/context/LangContext";
import { useRouter } from "next/navigation";
import { formatKhmerDate } from "@/utils/dateFormatter";

interface RecentRentalsTableProps {
    rentals: Rental[];
}

const statusColors: Record<string, string> = {
    "Active": "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "Reserved": "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "Completed": "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400",
    "Maintenance": "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const RecentRentalsTable = ({ rentals }: RecentRentalsTableProps) => {
    const { lang } = useLang();
    const router = useRouter();

    const handleRowClick = (rental: Rental) => {
        router.push(`/dashboard/rentals/${rental.id}`);
    };

    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-lg w-full overflow-hidden">
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-3 font-medium">
                                {lang === "en" ? "Client Name" : "អតិថិជន"}
                            </th>
                            <th className="px-6 py-3 font-medium">
                                {lang === "en" ? "Room" : "បន្ទប់"}
                            </th>
                            <th className="px-6 py-3 font-medium">
                                {lang === "en" ? "Start Date" : "កាលបរិច្ឆេទចាប់ផ្តើម"}
                            </th>
                            <th className="px-6 py-3 font-medium">
                                {lang === "en" ? "Status" : "ស្ថានភាព"}
                            </th>
                            <th className="px-6 py-3 font-medium text-right">
                                {lang === "en" ? "Rent Amount" : "តម្លៃជួល"}
                            </th>
                            <th className="px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {rentals.map((rental) => (
                            <tr
                                key={rental.id}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 cursor-pointer"
                                onClick={() => handleRowClick(rental)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-medium text-xs">
                                            {rental.ClientName ? rental.ClientName.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-slate-100">{rental.ClientName || "N/A"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {rental.roomNumber}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                    {formatKhmerDate(rental.startDate, lang) || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusColors[rental.status] || "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
                                            }`}
                                    >
                                        {lang === "en"
                                            ? rental.status
                                            : rental.status === "Active"
                                                ? "កំពុងជួល"
                                                : rental.status === "Reserved"
                                                    ? "កក់ទុក"
                                                    : rental.status === "Completed"
                                                        ? "បានបញ្ចប់"
                                                        : rental.status === "Maintenance"
                                                            ? "កំពុងជួសជុល"
                                                            : rental.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-900 dark:text-slate-100">
                                    ${rental.rentAmount?.toLocaleString() || "0"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
