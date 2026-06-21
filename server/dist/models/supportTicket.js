"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const SupportTicket = {
    create: async (data) => {
        return await prisma_1.default.supportTicket.create({
            data,
        });
    },
    findAll: async () => {
        return await prisma_1.default.supportTicket.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    },
    findById: async (id) => {
        return await prisma_1.default.supportTicket.findUnique({
            where: { id: parseInt(id) },
        });
    },
    updateStatus: async (id, status) => {
        return await prisma_1.default.supportTicket.update({
            where: { id: parseInt(id) },
            data: { status },
        });
    },
    delete: async (id) => {
        return await prisma_1.default.supportTicket.delete({
            where: { id: parseInt(id) },
        });
    },
};
exports.default = SupportTicket;
