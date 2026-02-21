const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const User = {
    findByEmail: async (email) => {
        return await prisma.user.findUnique({
            where: { email },
        });
    },

    findById: async (id) => {
        return await prisma.user.findUnique({
            where: { id },
        });
    },

    create: async (data) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        return await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });
    },

    comparePassword: async (enteredPassword, hashedPassword) => {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    },
};

module.exports = User;
