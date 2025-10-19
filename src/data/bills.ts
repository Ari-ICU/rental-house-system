import { Bill } from "@/types/bill";
import { allRentals } from './rents';

export const bills: Bill[] = [
    { id: 1, rental: allRentals[0], month: '2025/10/03', electricityAmount: 75, waterAmount: 35, electricityStatus: 'Unpaid', waterStatus: 'Paid' },
    { id: 2, rental: allRentals[1], month: '2025/09/03', electricityAmount: 60, waterAmount: 30, electricityStatus: 'Paid', waterStatus: 'Paid' },
    { id: 3, rental: allRentals[2], month: '2025/08/03', electricityAmount: 80, waterAmount: 32, electricityStatus: 'Unpaid', waterStatus: 'Paid' },
    { id: 4, rental: allRentals[5], month: '2025/07/03', electricityAmount: 70, waterAmount: 28, electricityStatus: 'Paid', waterStatus: 'Paid' },
    { id: 5, rental: allRentals[7], month: '2025/06/03', electricityAmount: 65, waterAmount: 33, electricityStatus: 'Unpaid', waterStatus: 'Unpaid' },
];