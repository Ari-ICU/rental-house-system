import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

const User = {
    findByEmail: async (email: string) => {
        return prisma.user.findUnique({
            where: { email },
        });
    },

    findById: async (id: number) => {
        return prisma.user.findUnique({
            where: { id },
        });
    },

    create: async (data: any) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    },

    comparePassword: async (enteredPassword: string, hashedPassword: string) => {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    },
};

export default User;
