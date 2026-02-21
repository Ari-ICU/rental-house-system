const prisma = require('../config/prisma');

const SupportTicket = {
    create: async (data) => {
        return await prisma.supportTicket.create({
            data,
        });
    },

    findAll: async () => {
        return await prisma.supportTicket.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    findById: async (id) => {
        return await prisma.supportTicket.findUnique({
            where: { id: parseInt(id) },
        });
    },

    updateStatus: async (id, status) => {
        return await prisma.supportTicket.update({
            where: { id: parseInt(id) },
            data: { status },
        });
    },

    delete: async (id) => {
        return await prisma.supportTicket.delete({
            where: { id: parseInt(id) },
        });
    },
};

module.exports = SupportTicket;
