const cron = require('node-cron');
const prisma = require('../config/prisma');
const logger = require('./logger');
const telegramSender = require('./telegramSender');
const SystemSetting = require('../models/systemSetting');

const runMonthlyBillingCycle = async () => {
    try {
        logger.info('Running automated monthly billing check...');

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentMonthString = `${currentYear}-${currentMonth}`;

        // Find all active rentals
        const activeRentals = await prisma.rental.findMany({
            where: { status: 'Active' },
        });

        let newBillsCreated = 0;

        for (const rental of activeRentals) {
            // Check if a bill for THIS specific month already exists for THIS rental
            const existingBill = await prisma.bill.findFirst({
                where: {
                    rentalId: rental.id,
                    month: currentMonthString,
                }
            });

            // If it doesn't exist, we auto-create a fresh "Unpaid" slate for the new month
            if (!existingBill) {
                await prisma.bill.create({
                    data: {
                        rentalId: rental.id,
                        month: currentMonthString,
                        rentAmount: Number(rental.rentAmount),
                        electricityAmount: 0,
                        waterAmount: 0,
                        electricityStatus: 'Unpaid',
                        waterStatus: 'Unpaid',
                        notes: 'System Auto-Generated Bill for the new month.',
                    }
                });
                newBillsCreated++;
                logger.info(`Auto-generated new cycle bill for Room ${rental.roomNumber} - ${currentMonthString}`);
            }
        }

        if (newBillsCreated > 0) {
            logger.info(`Successfully generated ${newBillsCreated} new bills for the month of ${currentMonthString}.`);

            // Optionally alert the admin/group chat that a new month's bills were generated
            const settings = await SystemSetting.getSettings();
            if (settings && settings.telegramBotToken && settings.telegramChatId) {
                const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';
                let message = '';
                if (lang === 'km') {
                    message = `✅ <b>វដ្តវិក្កយបត្រថ្មីត្រូវបានបង្កើត</b>\n\nវិក្កយបត្រចំនួន <b>${newBillsCreated}</b> ថ្មីត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិសម្រាប់ខែ <b>${currentMonthString}</b> ជាមួយនឹងការកំណត់ដើម: អគ្គិសនី/ទឹក "មិនទាន់បង់"។\n\nសូមម្ចាស់ផ្ទះពិនិត្យ និងទៅបញ្ជូលបរិមាណម៉ែត្រទឹកភ្លើង។`;
                } else {
                    message = `✅ <b>New Billing Cycle Generated</b>\n\n<b>${newBillsCreated}</b> new bills were automatically generated for <b>${currentMonthString}</b>.\nStatus is defaulted to "Unpaid".\n\nPlease update the water and electricity meter readings for these active rooms.`;
                }
                telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, message).catch(console.error);
            }
        }

    } catch (error) {
        logger.error('Error in automated billing cron check:', error.message);
    }
};

const initializeCronJobs = () => {
    // Run immediately on boot to catch up (in case server was sleeping on the 1st of the month)
    runMonthlyBillingCycle();

    // Schedule to run exactly at 00:00 AM on the 1st day of EVERY month automatically
    cron.schedule('0 0 1 * *', () => {
        runMonthlyBillingCycle();
    });
};

module.exports = {
    initializeCronJobs,
};
