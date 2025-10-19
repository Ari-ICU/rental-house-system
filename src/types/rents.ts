export type RentalStatus =
    | "In-Active"
    | "Non-Active"
    | "Past";

export interface Rental {
    id: number;
    ClientName: string;
    roomNumber: string;
    status: RentalStatus;
    rentAmount: number;
    startDate?: string;
    endDate?: string; 
    notes?: string;
}