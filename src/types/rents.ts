export type RentalStatus =
    | "In-Active"
    | "Non-Active"
    | "Past";
    
export interface ClientImageCard {
    front?: string; 
    back?: string; 
}
export interface Rental {
    id: number;
    ClientName: string;
    image: string;
    roomNumber: string;
    status: RentalStatus;
    rentAmount: number;
    startDate?: string;
    endDate?: string;
    notes?: string;

    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    clientIDCard?: string;
    clientImageCard?: ClientImageCard;
    emergencyContactName?: string;
    emergencyContactPhone?: string;

}