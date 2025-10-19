import { Report } from "@/types/report";

export const reportsData: Report[] = [
    {
        id: 1,
        name: "October Rental Income",
        type: "Monthly Income",
        generatedAt: "2025-10-18T10:00:00",
        status: "Completed",
    },
    {
        id: 2,
        name: "Weekly Occupancy Report",
        type: "Occupancy",
        generatedAt: "2025-10-16T09:45:00",
        status: "Completed",
    },
    {
        id: 3,
        name: "Tenant Feedback Summary",
        type: "Feedback",
        generatedAt: "2025-10-15T14:20:00",
        status: "In-Review",
    },
    {
        id: 4,
        name: "Maintenance Requests Q4",
        type: "Maintenance",
        generatedAt: "2025-10-12T11:30:00",
        status: "Completed",
    },
    {
        id: 5,
        name: "Rental Agreements Overview",
        type: "Contracts",
        generatedAt: "2025-10-10T15:00:00",
        status: "Completed",
    },
    // Add more house rental reports as needed
];
