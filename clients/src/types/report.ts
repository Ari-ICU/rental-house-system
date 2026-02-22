import { Bill } from "./bill";
import { Rental } from "./rents";

export interface Report {
    id: number;
    name: string;
    type: string;
    reportBill?: Bill;
    reportRents?: Rental;
    generatedAt: string;
    startDate?: string;
    endDate?: string;
    status: "Pending" | "Generating" | "In-Review" | "Completed" | "Archived";
}