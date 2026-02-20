// types/bills.ts
import { Rental } from './rents';

export interface Bill {
    id: number;
    rental: Rental;
    month: string;
    rentAmount?: number;
    electricityAmount: number;
    waterAmount: number;
    electricityStatus: 'Paid' | 'Unpaid';
    waterStatus: 'Paid' | 'Unpaid';
    notes: string;
    createdAt?: string;
    updatedAt?: string;
}
