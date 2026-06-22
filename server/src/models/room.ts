import prisma from '../config/prisma';

const Room = {
    getAll: async () => {
        return prisma.room.findMany({
            orderBy: { roomNumber: 'asc' }
        });
    },

    findById: async (id: number) => {
        return prisma.room.findUnique({
            where: { id }
        });
    },

    findByRoomNumber: async (roomNumber: string) => {
        return prisma.room.findUnique({
            where: { roomNumber }
        });
    },

    create: async (data: { roomNumber: string; rentAmount: number; notes?: string }) => {
        return prisma.room.create({
            data: {
                roomNumber: data.roomNumber,
                rentAmount: data.rentAmount,
                notes: data.notes
            }
        });
    },

    update: async (id: number, data: { roomNumber?: string; rentAmount?: number; notes?: string }) => {
        return prisma.room.update({
            where: { id },
            data: {
                roomNumber: data.roomNumber,
                rentAmount: data.rentAmount,
                notes: data.notes
            }
        });
    },

    delete: async (id: number) => {
        return prisma.room.delete({
            where: { id }
        });
    }
};

export default Room;
