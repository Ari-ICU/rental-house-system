"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User = {
    findByEmail: async (email) => {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    },
    findById: async (id) => {
        return prisma_1.default.user.findUnique({
            where: { id },
        });
    },
    create: async (data) => {
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(data.password, salt);
        return await prisma_1.default.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    },
    comparePassword: async (enteredPassword, hashedPassword) => {
        return await bcryptjs_1.default.compare(enteredPassword, hashedPassword);
    },
};
exports.default = User;
