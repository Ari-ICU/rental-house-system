import prisma from '../config/prisma';

const Report = {
    findAll: async () => {
        return await prisma.report.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    findById: async (id: number | string) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return null;
        }
        return await prisma.report.findUnique({
            where: {
                id: parsedId,
            },
        });
    },

    create: async (reportData: any) => {
        const { name, type, status, generatedAt, startDate, endDate } = reportData;
        return await prisma.report.create({
            data: {
                name,
                type,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                generatedAt: generatedAt ? new Date(generatedAt) : new Date(),
            },
        });
    },

    update: async (id: number | string, reportData: any) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return null;
        }

        const allowedFields = ['name', 'type', 'status', 'generatedAt', 'startDate', 'endDate'];
        const dataToUpdate: any = {};
        for (const key of allowedFields) {
            if (reportData[key] !== undefined) {
                if (['generatedAt', 'startDate', 'endDate'].includes(key)) {
                    dataToUpdate[key] = reportData[key] ? new Date(reportData[key]) : null;
                } else {
                    dataToUpdate[key] = reportData[key];
                }
            }
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }

        return await prisma.report.update({
            where: {
                id: parsedId,
            },
            data: dataToUpdate,
        });
    },

    delete: async (id: number | string) => {
        const parsedId = parseInt(id as string);
        if (isNaN(parsedId)) {
            return false;
        }

        try {
            const deleted = await prisma.report.delete({
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

export default Report;
