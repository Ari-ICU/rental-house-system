import { Rental } from "@/types/rents";

export const allRentals: Rental[] = [
    { id: 1, ClientName: "Xander Purple", roomNumber: "A001", status: "Past", rentAmount: 50, startDate: "2025-03-24", endDate: "2025-09-24", notes: "Paid in full." },
    { id: 2, ClientName: "Mia Brown", roomNumber: "A002", status: "In-Active", rentAmount: 50, startDate: "2024-03-31", endDate: '', notes: "Late payments in March." },
    { id: 3, ClientName: "Jack Princess", roomNumber: "A003", status: "Past", rentAmount: 50, startDate: "2024-04-22", endDate: "2024-10-22", notes: "Left early." },
    { id: 4, ClientName: '', roomNumber: "A004", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Property under maintenance." },
    { id: 5, ClientName: '', roomNumber: "A005", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Tenant moved abroad." },
    { id: 6, ClientName: "Eve Doe", roomNumber: "A006", status: "In-Active", rentAmount: 50, startDate: "2025-03-21", endDate: '', notes: "Rent partially paid." },
    { id: 7, ClientName: '', roomNumber: "A007", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Tenant requested extension." },
    { id: 8, ClientName: "Quinn Brown", roomNumber: "A008", status: "Past", rentAmount: 50, startDate: "2025-05-30", endDate: "2025-11-30", notes: "No issues reported." },
    { id: 9, ClientName: "Bob Brown", roomNumber: "A009", status: "In-Active", rentAmount: 50, startDate: "2025-11-07", endDate: '', notes: "Tenant delayed payments." },
    { id: 10, ClientName: "Yara Orange", roomNumber: "A010", status: "In-Active", rentAmount: 50, startDate: "2024-04-30", endDate: '', notes: "Tenant left keys late." },
    { id: 11, ClientName: "Olivia Duke", roomNumber: "A011", status: "Past", rentAmount: 50, startDate: "2025-03-21", endDate: "2025-09-21", notes: "Paid on time." },
    { id: 12, ClientName: "Leo Duchess", roomNumber: "A012", status: "Past", rentAmount: 50, startDate: "2024-10-30", endDate: "2025-04-30", notes: "Property inspected regularly." },
    { id: 13, ClientName: "David Silver", roomNumber: "A013", status: "Past", rentAmount: 50, startDate: "2025-01-21", endDate: "2025-07-21", notes: "Tenant requested maintenance." },
    { id: 14, ClientName: '', roomNumber: "A014", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Tenant unpaid." },
    { id: 15, ClientName: '', roomNumber: "A015", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Tenant moved out." },
    { id: 16, ClientName: '', roomNumber: "A016", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Paid partially." },
    { id: 17, ClientName: "Yara Duchess", roomNumber: "A017", status: "In-Active", rentAmount: 50, startDate: "2025-09-25", endDate: '', notes: "Tenant requested discount." },
    { id: 18, ClientName: "Jane Gray", roomNumber: "A018", status: "In-Active", rentAmount: 50, startDate: "2024-02-09", endDate: '', notes: "Tenant late." },
    { id: 19, ClientName: "Paul Purple", roomNumber: "A019", status: "Past", rentAmount: 50, startDate: "2024-05-01", endDate: "2024-11-01", notes: "All payments cleared." },
    { id: 20, ClientName: '', roomNumber: "A020", status: "Non-Active", rentAmount: 50, startDate: '', endDate: '', notes: "Tenant moved." },
];
