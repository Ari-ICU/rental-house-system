const crypto = require('crypto');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const SystemSetting = require('../models/systemSetting');
const billService = require('../service/bill.service');
const telegramSender = require('../utils/telegramSender');
const { BakongKHQR, IndividualInfo, MerchantInfo } = require('bakong-khqr');

// In a real ABA Payway integration, you compute HMAC hash
const getHash = (str, key) => {
    const hmac = crypto.createHmac('sha512', key);
    hmac.update(str);
    return hmac.digest('base64');
};

const initiatePayment = async (req, res) => {
    try {
        const { billId } = req.params;
        const bill = await prisma.bill.findUnique({
            where: { id: parseInt(billId) },
            include: { rental: true }
        });

        if (!bill) return errorResponse(res, 'Bill not found');

        const settings = await SystemSetting.getSettings();

        let amountToPay = 0;
        let payingFor = [];
        if (bill.electricityStatus === 'Unpaid') {
            amountToPay += Number(bill.electricityAmount);
            payingFor.push('Electricity');
        }
        if (bill.waterStatus === 'Unpaid') {
            amountToPay += Number(bill.waterAmount);
            payingFor.push('Water');
        }

        if (amountToPay === 0) {
            return errorResponse(res, 'Bill is already fully paid.');
        }

        const transactionId = `BILL_${bill.id}_${Date.now()}`;

        let qrString = null;
        if (settings.paymentBakongAccountId) {
            try {
                // Determine if account is merchant (starts with numeric or length checks, typically Bakong accounts like "@aclb")
                const isMerchant = settings.paymentBakongAccountId.length > 20; // Generic guess, but usually we just use IndividualInfo for standard @bank accounts.

                const reqData = new IndividualInfo(
                    settings.paymentBakongAccountId,
                    amountToPay,
                    'USD',
                    `Room ${bill.rental.roomNumber}`,
                    'Phnom Penh'
                );

                const khqr = new BakongKHQR();
                const result = khqr.generateIndividual(reqData);

                if (result && result.data && result.data.qr) {
                    qrString = result.data.qr;
                }
            } catch (e) {
                console.error("Failed to generate KHQR string:", e);
            }
        }

        // Return KHQR intent Data
        return successResponse(res, {
            billId: bill.id,
            amount: amountToPay,
            transactionId,
            description: `Payment for Room ${bill.rental.roomNumber} - ${bill.month}`,
            bakongAccountId: settings.paymentBakongAccountId || null,
            paywayMerchantId: settings.paywayMerchantId || null,
            qrString,
        }, 'Payment intent generated successfully');

    } catch (error) {
        return errorResponse(res, 'Failed to initiate payment', error);
    }
};

// Simulated webhook for testing OR real webhook receiver
const paymentWebhook = async (req, res) => {
    try {
        const { req_time, merchant_id, tran_id, amount, status } = req.body;

        // In production, verify the ABA Payway Hash signature here!

        // If status is 0 or successful (simulated or real)
        if (status === 0 || status === 'APPROVED') {
            // Extract Bill ID from tran_id (e.g., BILL_123_170...)
            const parts = tran_id.split('_');
            if (parts.length < 2) return res.status(400).json({ error: 'Invalid tran_id' });

            const billId = parseInt(parts[1]);

            const bill = await prisma.bill.findUnique({
                where: { id: billId },
                include: { rental: true }
            });

            if (!bill) return res.status(404).json({ error: 'Bill not found' });

            const updates = {};
            if (bill.electricityStatus === 'Unpaid') updates.electricityStatus = 'Paid';
            if (bill.waterStatus === 'Unpaid') updates.waterStatus = 'Paid';

            if (Object.keys(updates).length > 0) {
                await prisma.bill.update({
                    where: { id: billId },
                    data: updates
                });

                // Notify via Telegram
                const settings = await SystemSetting.getSettings();
                if (settings && settings.telegramBotToken && settings.telegramChatId) {
                    const lang = settings.telegramLanguage || 'en';
                    let tgMsg = '';
                    if (lang === 'km') {
                        tgMsg = `✅ <b>ការបង់ប្រាក់ទទួលបានជោគជ័យ</b>\n\nវិក្កយបត្រសម្រាប់បន្ទប់ <b>${bill.rental.roomNumber}</b> ត្រូវបានបង់ប្រាក់រួចរាល់ ($${amount})។ ស្ថានភាពអគ្គិសនី/ទឹកត្រូវបានកែប្រែទៅជា "បានបង់" ដោយស្វ័យប្រវត្តិ។`;
                    } else {
                        tgMsg = `✅ <b>Payment Received Successfully</b>\n\nBill for Room <b>${bill.rental.roomNumber}</b> has been paid ($${amount}). Electricity/Water statuses are automatically updated to "Paid".`;
                    }
                    telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, tgMsg).catch(console.error);

                    // Also notify the tenant directly if they have a telegramChatId
                    if (bill.rental?.telegramChatId) {
                        let tenantSuccessMsg = '';
                        if (lang === 'km') {
                            tenantSuccessMsg = `✅ <b>ការបង់ប្រាក់ទទួលបានជោគជ័យ!</b>\n\nសូមអរគុណ ${bill.rental.ClientName}! ការបង់ប្រាក់ចំនួន <b>$${amount}</b> សម្រាប់ខែ <b>${bill.month}</b> ត្រូវបានទទួលរួចរាល់ហើយ។`;
                        } else {
                            tenantSuccessMsg = `✅ <b>Payment Successful!</b>\n\nThank you ${bill.rental.ClientName}! Your payment of <b>$${amount}</b> for <b>${bill.month}</b> has been received.`;
                        }
                        telegramSender.sendMessage(settings.telegramBotToken, bill.rental.telegramChatId, tenantSuccessMsg).catch(console.error);
                    }
                }
            }
        }

        return res.status(200).json({ status: 0, description: 'Success' });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ status: 1, description: 'Internal Error' });
    }
};

// This is purely for demonstration so the user can natively test the flow without a real bank integration
const simulatePaymentSuccess = async (req, res) => {
    try {
        const { billId, amount } = req.body;
        const tran_id = `BILL_${billId}_SIMULATION`;

        // Internally trigger the webhook logic
        req.body = { req_time: Date.now(), merchant_id: 'SIMULATION', tran_id, amount, status: 0 };
        return await paymentWebhook(req, res);
    } catch (error) {
        return errorResponse(res, 'Simulation failed', error);
    }
};

module.exports = {
    initiatePayment,
    paymentWebhook,
    simulatePaymentSuccess,
};
