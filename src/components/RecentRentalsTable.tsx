'use client';

import { Rental } from "@/types/rents";
import { useLang } from "@/context/LangContext";
import { useState } from "react";
import RentalModal from "./rentals/RentalModal";

interface RecentRentalsTableProps {
    rentals: Rental[];
}

const statusColors: Record<string, string> = {
    Upcoming: "bg-blue-100 text-blue-800",
    Past: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
};

const RecentRentalsTable = ({ rentals }: RecentRentalsTableProps) => {
    const { lang } = useLang();
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleRowClick = (rental: Rental) => {
        setSelectedRental(rental);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedRental(null);
    };

    return (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-950 uppercase">
                            {lang === "en" ? "Client Name" : "អតិថិជន"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-950 uppercase">
                            {lang === "en" ? "Room" : "បន្ទប់"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-950 uppercase">
                            {lang === "en" ? "Start Date" : "កាលបរិច្ឆេទចាប់ផ្តើម"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-950 uppercase">
                            {lang === "en" ? "Status" : "ស្ថានភាព"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-950 uppercase">
                            {lang === "en" ? "Rent Amount" : "តម្លៃជួល"}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                    {rentals.map((rental) => (
                        <tr
                            key={rental.id}
                            className="hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => handleRowClick(rental)}
                        >
                            <td className="px-6 py-4">{rental.ClientName || "N/A"}</td>
                            <td className="px-6 py-4">{rental.roomNumber}</td>
                            <td className="px-6 py-4">{rental.startDate || "N/A"}</td>
                            <td className="px-6 py-4">
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        statusColors[rental.status] || "bg-gray-100 text-gray-800"
                                    }`}
                                >
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
                            <td className="px-6 py-4">${rental.rentAmount?.toLocaleString() || "0"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && selectedRental && (
                <RentalModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    rental={selectedRental}
                />
            )}
        </div>
    );
};

export default RecentRentalsTable;
