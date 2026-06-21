"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const convertDecimalToNumber = (bill) => {
    if (!bill)
        return null;
    return {
        ...bill,
        rentAmount: bill.rentAmount ? Number(bill.rentAmount) : null,
        electricityAmount: Number(bill.electricityAmount),
        waterAmount: Number(bill.waterAmount),
        prevElectricityReading: Number(bill.prevElectricityReading || 0),
        currElectricityReading: Number(bill.currElectricityReading || 0),
        prevWaterReading: Number(bill.prevWaterReading || 0),
        currWaterReading: Number(bill.currWaterReading || 0),
        rental: bill.rental ? {
            ...bill.rental,
            rentAmount: Number(bill.rental.rentAmount)
        } : undefined
    };
};
const Bill = {
    findAll: async () => {
        const bills = await prisma_1.default.bill.findMany({
            include: {
                rental: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return bills.map(convertDecimalToNumber);
    },
    findById: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const bill = await prisma_1.default.bill.findUnique({
            where: {
                id: parsedId,
            },
            include: {
                rental: true,
            },
        });
        return convertDecimalToNumber(bill);
    },
    create: async (billData) => {
        const { rentalId, month, rentAmount, electricityAmount, waterAmount, electricityStatus, waterStatus, notes, prevElectricityReading, currElectricityReading, prevWaterReading, currWaterReading } = billData;
        let finalRentAmount = rentAmount;
        if (finalRentAmount === undefined || finalRentAmount === null) {
            const rental = await prisma_1.default.rental.findUnique({
                where: { id: parseInt(rentalId) }
            });
            finalRentAmount = rental ? rental.rentAmount : null;
        }
        const newBill = await prisma_1.default.bill.create({
            data: {
                rentalId: parseInt(rentalId),
                month,
                rentAmount: finalRentAmount !== null ? Number(finalRentAmount) : null,
                electricityAmount,
                waterAmount,
                electricityStatus,
                waterStatus,
                notes,
                prevElectricityReading: Number(prevElectricityReading || 0),
                currElectricityReading: Number(currElectricityReading || 0),
                prevWaterReading: Number(prevWaterReading || 0),
                currWaterReading: Number(currWaterReading || 0),
            },
            include: {
                rental: true,
            },
        });
        return convertDecimalToNumber(newBill);
    },
    update: async (id, billData) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const allowedFields = [
            'rentalId', 'month', 'rentAmount', 'electricityAmount', 'waterAmount',
            'electricityStatus', 'waterStatus', 'notes',
            'prevElectricityReading', 'currElectricityReading', 'prevWaterReading', 'currWaterReading'
        ];
        const dataToUpdate = {};
        for (const key of allowedFields) {
            if (billData[key] !== undefined) {
                if (key === 'rentalId') {
                    dataToUpdate[key] = parseInt(billData[key]);
                }
                else {
                    dataToUpdate[key] = billData[key];
                }
            }
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }
        const updated = await prisma_1.default.bill.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
            include: {
                rental: true,
            },
        });
        return convertDecimalToNumber(updated);
    },
    delete: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return false;
        }
        try {
            const deleted = await prisma_1.default.bill.delete({
                where: {
                    id: parsedId,
                },
            });
            return !!deleted;
        }
        catch (error) {
            if (error.code === 'P2025') {
                return false;
            }
            throw error;
        }
    }
};
exports.default = Bill;
