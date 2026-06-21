"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const convertDecimalToNumber = (rental) => {
    if (!rental)
        return null;
    return {
        ...rental,
        rentAmount: Number(rental.rentAmount),
        depositAmount: Number(rental.depositAmount || 0),
        memberCount: Number(rental.memberCount || 1),
        clientImageCard: {
            front: rental.clientImageCardFront || '',
            back: rental.clientImageCardBack || ''
        },
        bills: rental.bills ? rental.bills.map((bill) => ({
            ...bill,
            electricityAmount: Number(bill.electricityAmount),
            waterAmount: Number(bill.waterAmount)
        })) : undefined
    };
};
const Rental = {
    findAll: async (options = {}) => {
        const { search, skip, take } = options;
        const where = search ? {
            OR: [
                { ClientName: { contains: search, mode: 'insensitive' } },
                { roomNumber: { contains: search, mode: 'insensitive' } },
                { clientPhone: { contains: search, mode: 'insensitive' } },
            ]
        } : {};
        const [rentals, total] = await Promise.all([
            prisma_1.default.rental.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip ? parseInt(skip) : undefined,
                take: take ? parseInt(take) : undefined,
            }),
            prisma_1.default.rental.count({ where })
        ]);
        return {
            data: rentals.map(convertDecimalToNumber),
            total
        };
    },
    findById: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const rental = await prisma_1.default.rental.findUnique({
            where: {
                id: parsedId,
            },
            include: {
                bills: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        return convertDecimalToNumber(rental);
    },
    create: async (rentalData) => {
        const { ClientName, roomNumber, status, rentAmount, depositAmount, startDate, endDate, notes, clientPhone, clientEmail, clientAddress, nationality, gender, occupation, idCardType, memberCount, clientIDCard, clientImageCardFront, clientImageCardBack, emergencyContactName, emergencyContactPhone, image } = rentalData;
        const newRental = await prisma_1.default.rental.create({
            data: {
                ClientName, roomNumber, status, rentAmount, depositAmount, startDate, endDate, notes,
                clientPhone, clientEmail, clientAddress, nationality, gender, occupation, idCardType,
                memberCount, clientIDCard, clientImageCardFront, clientImageCardBack,
                emergencyContactName, emergencyContactPhone, image
            },
        });
        return convertDecimalToNumber(newRental);
    },
    update: async (id, rentalData) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const allowedFields = [
            'ClientName', 'roomNumber', 'status', 'rentAmount', 'depositAmount', 'startDate', 'endDate', 'notes',
            'clientPhone', 'clientEmail', 'clientAddress', 'nationality', 'gender', 'occupation', 'idCardType',
            'memberCount', 'clientIDCard', 'clientImageCardFront', 'clientImageCardBack',
            'emergencyContactName', 'emergencyContactPhone', 'image'
        ];
        const dataToUpdate = {};
        for (const key of allowedFields) {
            if (rentalData[key] !== undefined) {
                dataToUpdate[key] = rentalData[key];
            }
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }
        const updated = await prisma_1.default.rental.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
        });
        return convertDecimalToNumber(updated);
    },
    delete: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return false;
        }
        try {
            const deleted = await prisma_1.default.rental.delete({
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
exports.default = Rental;
