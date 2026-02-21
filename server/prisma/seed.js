const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create Default Admin User
    const adminEmail = 'admin@rentflow.com';
    const adminPassword = 'admin123';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'System Administrator',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });
        console.log('✅ Default admin user created:');
        console.log(`   - Email: ${adminEmail}`);
        console.log(`   - Password: ${adminPassword}`);
    } else {
        console.log('🟡 Admin user already exists, skipping user creation.');
    }

    // 2. Initialize System Settings if empty
    const settingsCount = await prisma.systemSetting.count();
    if (settingsCount === 0) {
        await prisma.systemSetting.create({
            data: {
                electricityRate: 1000, // Example default
                waterRate: 1500,       // Example default
                exchangeRate: 4100,
                telegramLanguage: 'en',
            }
        });
        console.log('✅ Default system settings initialized.');
    } else {
        console.log('🟡 System settings already exist, skipping initialization.');
    }

    console.log('🏁 Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
