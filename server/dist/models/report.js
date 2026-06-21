"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const Report = {
    findAll: async () => {
        return await prisma_1.default.report.findMany({
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
        return await prisma_1.default.report.findUnique({
            where: {
                id: parsedId,
            },
        });
    },
    create: async (reportData) => {
        const { name, type, status, generatedAt, startDate, endDate } = reportData;
        return await prisma_1.default.report.create({
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
    update: async (id, reportData) => {
        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            return null;
        }
        const allowedFields = ['name', 'type', 'status', 'generatedAt', 'startDate', 'endDate'];
        const dataToUpdate = {};
        for (const key of allowedFields) {
            if (reportData[key] !== undefined) {
                if (['generatedAt', 'startDate', 'endDate'].includes(key)) {
                    dataToUpdate[key] = reportData[key] ? new Date(reportData[key]) : null;
                }
                else {
                    dataToUpdate[key] = reportData[key];
                }
            }
        }
        if (Object.keys(dataToUpdate).length === 0) {
            return null;
        }
        return await prisma_1.default.report.update({
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
            const deleted = await prisma_1.default.report.delete({
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
exports.default = Report;
