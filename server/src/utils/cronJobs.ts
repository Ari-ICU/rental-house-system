import cron from 'node-cron';
import prisma from '../config/prisma';
import logger from './logger';
import * as telegramSender from './telegramSender';
import SystemSetting from '../models/systemSetting';
import { generateBillPdfBuffer } from './pdfGenerator';

export const runMonthlyBillingCycle = async (): Promise<void> => {
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

                // Auto-send the newly created unpaid bills to tenants
                const newlyGeneratedBills = await prisma.bill.findMany({
                    where: { month: currentMonthString },
                    include: { rental: true }
                });
                for (const bill of newlyGeneratedBills) {
                    if (bill.rental && bill.rental.telegramChatId) {
                        try {
                            const pdfBuffer = await generateBillPdfBuffer(bill, settings);
                            const fileName = `Invoice_Room_${bill.rental.roomNumber}_${bill.month}.pdf`;
                            let caption = '';
                            if (lang === 'km') {
                                caption = `📄 <b>វិក្កយបត្រប្រចាំខែថ្មី: ${bill.month}</b>\nបន្ទប់: ${bill.rental.roomNumber}\n\nសូមមើលឯកសារភ្ជាប់សម្រាប់ព័ត៌មានលម្អិត។`;
                            } else {
                                caption = `📄 <b>New Monthly Invoice: ${bill.month}</b>\nRoom: ${bill.rental.roomNumber}\n\nPlease find the attached PDF invoice for your details.`;
                            }
                            await telegramSender.sendDocument(settings.telegramBotToken, bill.rental.telegramChatId, pdfBuffer, fileName, caption);
                        } catch (err: any) {
                            logger.error(`Failed to send new cycle bill PDF to room ${bill.rental.roomNumber}:`, err.message);
                        }
                    }
                }
            }
        }

    } catch (error: any) {
        logger.error('Error in automated billing cron check:', error.message);
    }
};

export const checkRentalEndDates = async (): Promise<void> => {
    try {
        const activeRentals = await prisma.rental.findMany({
            where: {
                status: { in: ['Active', 'Reserved'] },
                endDate: { not: null }
            }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let updatedCount = 0;

        for (const rental of activeRentals) {
            if (!rental.endDate) continue;
            const endDate = new Date(rental.endDate);

            // Validate the parsed date to avoid NaN errors
            if (isNaN(endDate.getTime())) continue;

            endDate.setHours(0, 0, 0, 0);

            if (endDate < today) {
                await prisma.rental.update({
                    where: { id: rental.id },
                    data: { status: 'Completed' }
                });
                updatedCount++;
                logger.info(`Auto-updated rental ID ${rental.id} (Room ${rental.roomNumber}) to 'Completed' because end date (${rental.endDate}) has passed.`);
            }
        }

        if (updatedCount > 0) {
            logger.info(`Automatically marked ${updatedCount} rentals as Completed due to end date passing.`);
        }
    } catch (error: any) {
        logger.error('Error in checkRentalEndDates cron check:', error.message);
    }
};

export const sendPaymentReminders = async (): Promise<void> => {
    try {
        logger.info('Running automated payment reminders check...');
        const settings = await SystemSetting.getSettings();
        if (!settings || !settings.telegramBotToken) return;

        const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';

        // Find all bills where electricityStatus == 'Unpaid' or waterStatus == 'Unpaid'
        const unpaidBills = await prisma.bill.findMany({
            where: {
                OR: [
                    { electricityStatus: 'Unpaid' },
                    { waterStatus: 'Unpaid' }
                ]
            },
            include: {
                rental: true
            }
        });

        let reminderCount = 0;
        for (const bill of unpaidBills) {
            if (bill.rental && bill.rental.telegramChatId) {
                const rentAmount = parseFloat(bill.rentAmount as any) || (parseFloat(bill.rental.rentAmount as any) || 0);
                const elecAmount = bill.electricityStatus === 'Unpaid' ? parseFloat(bill.electricityAmount as any) || 0 : 0;
                const waterAmount = bill.waterStatus === 'Unpaid' ? parseFloat(bill.waterAmount as any) || 0 : 0;
                const amountToPay = rentAmount + elecAmount + waterAmount;

                if (amountToPay > 0) {
                    let message = '';
                    if (lang === 'km') {
                        message = `🔔 <b>ការរំលឹកការទូទាត់ប្រាក់ឈ្នួលផ្ទះ</b>\n\nសួស្តី ${bill.rental.ClientName} (បន្ទប់ ${bill.rental.roomNumber}),\nនេះគឺជាការរំលឹកប្រកបដោយភាពរាក់ទាក់ថា អ្នកមានការទូទាត់ដែលមិនទាន់បានបង់សម្រាប់ខែ <b>${bill.month}</b>។\n\nចំនួនទឹកប្រាក់សរុបដែលត្រូវបង់: <b>$${amountToPay.toFixed(2)}</b>\n\nសូមធ្វើការទូទាត់ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន។ សូមអរគុណ!`;
                    } else {
                        message = `🔔 <b>Rent Payment Reminder</b>\n\nHello ${bill.rental.ClientName} (Room ${bill.rental.roomNumber}),\nThis is a friendly reminder that you have an outstanding balance for the month of <b>${bill.month}</b>.\n\nTotal Amount Due: <b>$${amountToPay.toFixed(2)}</b>\n\nPlease proceed with the payment at your earliest convenience. Thank you!`;
                    }

                    await telegramSender.sendMessage(settings.telegramBotToken, bill.rental.telegramChatId, message);
                    reminderCount++;
                }
            }
        }
        if (reminderCount > 0) {
            logger.info(`Sent payment reminders to ${reminderCount} tenants with unpaid bills.`);
        }
    } catch (error: any) {
        logger.error('Error in sendPaymentReminders cron check:', error.message);
    }
};

export const initializeCronJobs = (): void => {
    // Run immediately on boot
    checkRentalEndDates();
    runMonthlyBillingCycle();

    // Schedule to run exactly at 00:00 AM every day to check for expired rentals
    cron.schedule('0 0 * * *', () => {
        checkRentalEndDates();
    });

    // Schedule to run exactly at 00:00 AM on the 1st day of EVERY month automatically
    cron.schedule('0 0 1 * *', () => {
        runMonthlyBillingCycle();
    });

    // Schedule to run at 10:00 AM every 3 days for payment reminders
    cron.schedule('0 10 */3 * *', () => {
        sendPaymentReminders();
    });
};
