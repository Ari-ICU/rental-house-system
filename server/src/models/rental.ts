import prisma from '../config/prisma';

const convertDecimalToNumber = (rental: any) => {
    if (!rental) return null;
    return {
        ...rental,
        rentAmount: Number(rental.rentAmount),
        depositAmount: Number(rental.depositAmount || 0),
        memberCount: Number(rental.memberCount || 1),
        clientImageCard: {
            front: rental.clientImageCardFront || '',
            back: rental.clientImageCardBack || ''
        },
        bills: rental.bills ? rental.bills.map((bill: any) => ({
            ...bill,
            electricityAmount: Number(bill.electricityAmount),
            waterAmount: Number(bill.waterAmount)
        })) : undefined
    };
};

const Rental = {
    findAll: async (options: any = {}) => {
        const { search, skip, take } = options;

        const where = search ? {
            OR: [
                { ClientName: { contains: search, mode: 'insensitive' } },
                { roomNumber: { contains: search, mode: 'insensitive' } },
                { clientPhone: { contains: search, mode: 'insensitive' } },
            ]
        } as any : {};

        const [rentals, total] = await Promise.all([
            prisma.rental.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: skip ? parseInt(skip) : undefined,
                take: take ? parseInt(take) : undefined,
            }),
            prisma.rental.count({ where })
        ]);

        return {
            data: rentals.map(convertDecimalToNumber),
            total
        };
    },

    findById: async (id: number | string) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return null;
        }
        const rental = await prisma.rental.findUnique({
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

    create: async (rentalData: any) => {
        const {
            ClientName, roomNumber, status, rentAmount, depositAmount, startDate, endDate, notes,
            clientPhone, clientEmail, clientAddress, nationality, gender, occupation, idCardType,
            memberCount, clientIDCard, clientImageCardFront, clientImageCardBack,
            emergencyContactName, emergencyContactPhone, image
        } = rentalData;

        const newRental = await prisma.rental.create({
            data: {
                ClientName, roomNumber, status, rentAmount, depositAmount, startDate, endDate, notes,
                clientPhone, clientEmail, clientAddress, nationality, gender, occupation, idCardType,
                memberCount, clientIDCard, clientImageCardFront, clientImageCardBack,
                emergencyContactName, emergencyContactPhone, image
            },
        });
        return convertDecimalToNumber(newRental);
    },

    update: async (id: number | string, rentalData: any) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return null;
        }

        const allowedFields = [
            'ClientName', 'roomNumber', 'status', 'rentAmount', 'depositAmount', 'startDate', 'endDate', 'notes',
            'clientPhone', 'clientEmail', 'clientAddress', 'nationality', 'gender', 'occupation', 'idCardType',
            'memberCount', 'clientIDCard', 'clientImageCardFront', 'clientImageCardBack',
            'emergencyContactName', 'emergencyContactPhone', 'image'
        ];

        const dataToUpdate: any = {};
        for (const key of allowedFields) {
            if (rentalData[key] !== undefined) {
                dataToUpdate[key] = rentalData[key];
            }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }

        const updated = await prisma.rental.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
        });
        return convertDecimalToNumber(updated);
    },

    delete: async (id: number | string) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return false;
        }

        try {
            const deleted = await prisma.rental.delete({
                where: {
                    id: parsedId,
                },
            });
            return !!deleted;
        } catch (error: any) {
            if (error.code === 'P2025') {
                return false;
            }
            throw error;
        }
    }
};

export default Rental;
