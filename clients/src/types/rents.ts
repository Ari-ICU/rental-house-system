export type RentalStatus =
    | "Active"
    | "Reserved"
    | "Completed"
    | "Maintenance";

export interface ClientImageCard {
    front?: string;
    back?: string;
}

export interface Rental {
    id: number;
    ClientName: string;
    image?: string;
    roomNumber: string;
    status: RentalStatus;
    rentAmount: number;
    depositAmount?: number;
    startDate?: string;
    endDate?: string;
    notes?: string;

    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    nationality?: string;
    gender?: string;
    occupation?: string;
    idCardType?: string;
    memberCount?: number;
    clientIDCard?: string;
    clientImageCard?: ClientImageCard;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    telegramChatId?: string;

    // Extra fields
    startElectricityReading?: number;
    startWaterReading?: number;
    depositStatus?: string;
    paymentDueDay?: number;
    contractAgreement?: string;

    bills?: import("./bill").Bill[];
    createdAt?: string;
    updatedAt?: string;
}