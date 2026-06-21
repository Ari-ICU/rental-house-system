"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulatePaymentSuccess = exports.paymentWebhook = exports.initiatePayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const apiResponse_1 = require("../utils/apiResponse");
const systemSetting_1 = __importDefault(require("../models/systemSetting"));
const telegramSender = __importStar(require("../utils/telegramSender"));
const bakong_khqr_1 = require("bakong-khqr");
// In a real ABA Payway integration, you compute HMAC hash
const getHash = (str, key) => {
    const hmac = crypto_1.default.createHmac('sha512', key);
    hmac.update(str);
    return hmac.digest('base64');
};
const initiatePayment = async (req, res) => {
    try {
        const billId = req.params.billId;
        const bill = await prisma_1.default.bill.findUnique({
            where: { id: parseInt(billId) },
            include: { rental: true }
        });
        if (!bill)
            return (0, apiResponse_1.errorResponse)(res, 'Bill not found');
        const settings = await systemSetting_1.default.getSettings();
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
            return (0, apiResponse_1.errorResponse)(res, 'Bill is already fully paid.');
        }
        const transactionId = `BILL_${bill.id}_${Date.now()}`;
        let qrString = null;
        if (settings && settings.paymentBakongAccountId) {
            try {
                const reqData = new bakong_khqr_1.IndividualInfo(settings.paymentBakongAccountId, amountToPay, 'USD', `Room ${bill.rental?.roomNumber || 'Unknown'}`, 'Phnom Penh');
                const khqr = new bakong_khqr_1.BakongKHQR();
                const result = khqr.generateIndividual(reqData);
                if (result && result.data && result.data.qr) {
                    qrString = result.data.qr;
                }
            }
            catch (e) {
                console.error("Failed to generate KHQR string:", e);
            }
        }
        // Return KHQR intent Data
        return (0, apiResponse_1.successResponse)(res, {
            billId: bill.id,
            amount: amountToPay,
            transactionId,
            description: `Payment for Room ${bill.rental?.roomNumber || 'Unknown'} - ${bill.month}`,
            bakongAccountId: settings?.paymentBakongAccountId || null,
            paywayMerchantId: settings?.paywayMerchantId || null,
            qrString,
        }, 'Payment intent generated successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to initiate payment', error);
    }
};
exports.initiatePayment = initiatePayment;
const paymentWebhook = async (req, res) => {
    try {
        const { req_time, merchant_id, tran_id, amount, status } = req.body;
        // If status is 0 or successful (simulated or real)
        if (status === 0 || status === 'APPROVED') {
            const parts = tran_id.split('_');
            if (parts.length < 2)
                return res.status(400).json({ error: 'Invalid tran_id' });
            const billId = parseInt(parts[1]);
            const bill = await prisma_1.default.bill.findUnique({
                where: { id: billId },
                include: { rental: true }
            });
            if (!bill)
                return res.status(404).json({ error: 'Bill not found' });
            const updates = {};
            if (bill.electricityStatus === 'Unpaid')
                updates.electricityStatus = 'Paid';
            if (bill.waterStatus === 'Unpaid')
                updates.waterStatus = 'Paid';
            if (Object.keys(updates).length > 0) {
                await prisma_1.default.bill.update({
                    where: { id: billId },
                    data: updates
                });
                // Notify via Telegram
                const settings = await systemSetting_1.default.getSettings();
                if (settings && settings.telegramBotToken && settings.telegramChatId) {
                    const lang = settings.telegramLanguage || 'en';
                    let tgMsg = '';
                    if (lang === 'km') {
                        tgMsg = `✅ <b>ការបង់ប្រាក់ទទួលបានជោគជ័យ</b>\n\nវិក្កយបត្រសម្រាប់បន្ទប់ <b>${bill.rental?.roomNumber || 'Unknown'}</b> ត្រូវបានបង់ប្រាក់រួចរាល់ ($${amount})។ ស្ថានភាពអគ្គិសនី/ទឹកត្រូវបានកែប្រែទៅជា "បានបង់" ដោយស្វ័យប្រវត្តិ។`;
                    }
                    else {
                        tgMsg = `✅ <b>Payment Received Successfully</b>\n\nBill for Room <b>${bill.rental?.roomNumber || 'Unknown'}</b> has been paid ($${amount}). Electricity/Water statuses are automatically updated to "Paid".`;
                    }
                    telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, tgMsg).catch(console.error);
                    // Also notify the tenant directly if they have a telegramChatId
                    if (bill.rental?.telegramChatId) {
                        let tenantSuccessMsg = '';
                        if (lang === 'km') {
                            tenantSuccessMsg = `✅ <b>ការបង់ប្រាក់ទទួលបានជោគជ័យ!</b>\n\nសូមអរគុណ ${bill.rental.ClientName}! ការបង់ប្រាក់ចំនួន <b>$${amount}</b> សម្រាប់ខែ <b>${bill.month}</b> ត្រូវបានទទួលរួចរាល់ហើយ។`;
                        }
                        else {
                            tenantSuccessMsg = `✅ <b>Payment Successful!</b>\n\nThank you ${bill.rental.ClientName}! Your payment of <b>$${amount}</b> for <b>${bill.month}</b> has been received.`;
                        }
                        telegramSender.sendMessage(settings.telegramBotToken, bill.rental.telegramChatId, tenantSuccessMsg).catch(console.error);
                    }
                }
            }
        }
        return res.status(200).json({ status: 0, description: 'Success' });
    }
    catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ status: 1, description: 'Internal Error' });
    }
};
exports.paymentWebhook = paymentWebhook;
const simulatePaymentSuccess = async (req, res) => {
    try {
        const { billId, amount } = req.body;
        const tran_id = `BILL_${billId}_SIMULATION`;
        // Internally trigger the webhook logic
        req.body = { req_time: Date.now(), merchant_id: 'SIMULATION', tran_id, amount, status: 0 };
        return await (0, exports.paymentWebhook)(req, res);
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Simulation failed', error);
    }
};
exports.simulatePaymentSuccess = simulatePaymentSuccess;
