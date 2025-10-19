'use client';

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import RentalHeader from "@/components/rentals/RentalHeader";
import RentalList from "@/components/rentals/RentalList";
import { Rental, RentalStatus } from "@/types/rents";
import { allRentals } from "@/data/rents";
import { formatKhmerDate } from "@/utils/dateFormatter";

const statusMap: { [key: string]: RentalStatus } = {
    "in-active": "In-Active",
    "non-active": "Non-Active",
    past: "Past",
};

const RentalPage: React.FC = () => {
    const params = useParams();
    const statusParam = params.status;
    const statusKey =
        typeof statusParam === "string" ? statusParam.toLowerCase() : "";

    const status: RentalStatus | undefined = statusMap[statusKey];
    const [rentals, setRentals] = useState<Rental[]>([]);

    useEffect(() => {
        if (status) {
            setRentals(allRentals.filter((r) => r.status === status));
        } else {
            setRentals(allRentals);
        }
    }, [status]);

    const handleSearch = (query: string) => {
        // Normalize query: lowercase, replace slashes with dash, trim, collapse multiple spaces
        const normalizedQuery = query
            .toLowerCase()
            .replace(/\//g, "-")
            .replace(/\s+/g, " ")
            .trim();

        const filtered = allRentals.filter((r) => {
            // Filter by status if applicable
            if (status && r.status !== status) return false;

            const tenantName = r.ClientName.toLowerCase().replace(/\s+/g, " ").trim();
            const roomNumber = r.roomNumber.toLowerCase().replace(/\s+/g, " ").trim();
            const startDate = r.startDate?.toLowerCase().replace(/\s+/g, " ").trim() || "";
            const endDate = r.endDate?.toLowerCase().replace(/\s+/g, " ").trim() || "";


            const khStartDate = r.startDate
                ? formatKhmerDate(r.startDate, "km").toLowerCase().replace(/\s+/g, " ").trim()
                : "";
            const khEndDate = r.endDate
                ? formatKhmerDate(r.endDate, "km").toLowerCase().replace(/\s+/g, " ").trim()
                : "";

            return (
                tenantName.includes(normalizedQuery) ||
                roomNumber.includes(normalizedQuery) ||
                startDate.includes(normalizedQuery) ||
                endDate.includes(normalizedQuery) ||
                khStartDate.includes(normalizedQuery) ||
                khEndDate.includes(normalizedQuery)
            );

        });

        setRentals(filtered);
    };


    const handleAdd = () => {
        alert("Add Rental clicked!");
    };

    return (
        <div className="min-h-screen">
            <RentalHeader onSearch={handleSearch} onAdd={handleAdd} />
            <RentalList rentals={rentals} />
        </div>
    );
};

export default RentalPage;
