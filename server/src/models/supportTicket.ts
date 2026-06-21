import prisma from '../config/prisma';

const SupportTicket = {
    create: async (data: any) => {
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

    findById: async (id: number | string) => {
        return await prisma.supportTicket.findUnique({
            where: { id: parseInt(id as string) },
        });
    },

    updateStatus: async (id: number | string, status: string) => {
        return await prisma.supportTicket.update({
            where: { id: parseInt(id as string) },
            data: { status },
        });
    },

    delete: async (id: number | string) => {
        return await prisma.supportTicket.delete({
            where: { id: parseInt(id as string) },
        });
    },
};

export default SupportTicket;
