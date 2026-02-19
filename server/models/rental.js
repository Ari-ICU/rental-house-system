const prisma = require('../config/prisma');

const Rental = {
    findAll: async () => {
        return await prisma.rental.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    findById: async (id) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        return await prisma.rental.findUnique({
            where: {
                id: parsedId,
            },
        });
    },

    create: async (rentalData) => {
        // Only pick the fields defined in schema to avoid Prisma errors on unknown fields
        const {
            ClientName, roomNumber, status, rentAmount, startDate, endDate, notes,
            clientPhone, clientEmail, clientAddress, clientIDCard,
            clientImageCardFront, clientImageCardBack, emergencyContactName, emergencyContactPhone, image
        } = rentalData;

        return await prisma.rental.create({
            data: {
                ClientName, roomNumber, status, rentAmount, startDate, endDate, notes,
                clientPhone, clientEmail, clientAddress, clientIDCard,
                clientImageCardFront, clientImageCardBack, emergencyContactName, emergencyContactPhone, image
            },
        });
    },

    update: async (id, rentalData) => {
        // Prisma complains if we update with empty data or unknown fields.
        // Filter out undefined/null fields if needed, or rely on frontend sending valid partial update.
        // However, for update, we usually allow partial updates.

        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }

        // Whitelist allowed fields
        const allowedFields = [
            'ClientName', 'roomNumber', 'status', 'rentAmount', 'startDate', 'endDate', 'notes',
            'clientPhone', 'clientEmail', 'clientAddress', 'clientIDCard',
            'clientImageCardFront', 'clientImageCardBack', 'emergencyContactName', 'emergencyContactPhone', 'image'
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

        return await prisma.rental.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
        });
    },

    delete: async (id) => {
        const parsedId = parseInt(id);
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
        } catch (error) {
            if (error.code === 'P2025') { // Record to delete does not exist
                return false;
            }
            throw error;
        }
    }
};

module.exports = Rental;
