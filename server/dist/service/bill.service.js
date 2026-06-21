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
exports.deleteBill = exports.updateBill = exports.createBill = exports.getBillById = exports.getAllBills = void 0;
const bill_1 = __importDefault(require("../models/bill"));
const telegramSender = __importStar(require("../utils/telegramSender"));
const systemSetting_1 = __importDefault(require("../models/systemSetting"));
const pdfGenerator_1 = require("../utils/pdfGenerator");
const triggerUnpaidAlertIfNeeded = async (bill, isNew = false) => {
    if (!bill)
        return;
    const unpaidElectricity = bill.electricityStatus === 'Unpaid';
    const unpaidWater = bill.waterStatus === 'Unpaid';
    if (unpaidElectricity || unpaidWater) {
        const settings = await systemSetting_1.default.getSettings();
        if (!settings || !settings.telegramBotToken || !settings.telegramChatId) {
            return; // Not configured
        }
        const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';
        const clientName = bill.rental?.ClientName || (lang === 'km' ? 'មិនស្គាល់អតិថិជន' : 'Unknown Client');
        const roomStr = bill.rental?.roomNumber || (lang === 'km' ? 'មិនស្គាល់បន្ទប់' : 'Unknown Room');
        let message = '';
        if (lang === 'km') {
            message = `🚨 <b>ការដាស់តឿន៖ ការប្រើប្រាស់មិនទាន់បង់ប្រាក់</b>\n\n`;
            if (isNew) {
                message += `វិក្កយបត្រថ្មីមួយត្រូវបានបង្កើតដោយមានការគិតប្រាក់មិនទាន់បានបង់។\n`;
            }
            else {
                message += `វិក្កយបត្រត្រូវបានកែប្រែ ហើយស្ថានភាពទឹក/ភ្លើងមិនទាន់បានបង់។\n`;
            }
            message += `\n👤 <b>អតិថិជន:</b> ${clientName}`;
            message += `\n🚪 <b>បន្ទប់:</b> ${roomStr}`;
            message += `\n📅 <b>វិក្កយបត្រខែ:</b> ${bill.month}`;
            if (unpaidElectricity) {
                message += `\n⚡ <b>អគ្គិសនី:</b> មិនទាន់បង់ ($${bill.electricityAmount || 0})`;
            }
            if (unpaidWater) {
                message += `\n💧 <b>ទឹកស្អាត:</b> មិនទាន់បង់ ($${bill.waterAmount || 0})`;
            }
            message += `\n\nសូមតាមដានជាមួយអតិថិជន។`;
        }
        else {
            message = `🚨 <b>Rental Alert: Unpaid Utilities</b>\n\n`;
            if (isNew) {
                message += `A new bill was generated with outstanding charges.\n`;
            }
            else {
                message += `A bill has been updated and utilities are marked as unpaid.\n`;
            }
            message += `\n👤 <b>Client:</b> ${clientName}`;
            message += `\n🚪 <b>Room:</b> ${roomStr}`;
            message += `\n📅 <b>Billing Month:</b> ${bill.month}`;
            if (unpaidElectricity) {
                message += `\n⚡ <b>Electricity:</b> Unpaid ($${bill.electricityAmount || 0})`;
            }
            if (unpaidWater) {
                message += `\n💧 <b>Water:</b> Unpaid ($${bill.waterAmount || 0})`;
            }
            message += `\n\nPlease follow up with the customer.`;
        }
        // Send to Admin Group
        telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, message).catch(console.error);
        // Send to individual tenant if they have a telegramChatId
        if (bill.rental?.telegramChatId) {
            let tenantMessage = '';
            if (lang === 'km') {
                tenantMessage = `📢 <b>សួស្តី ${clientName}!</b>\n\nនេះគឺជាការរំលឹកអំពីវិក្កយបត្រសម្រាប់ខែ <b>${bill.month}</b> បន្ទប់ <b>${roomStr}</b> ។\n`;
                if (unpaidElectricity)
                    tenantMessage += `\n⚡ <b>អគ្គិសនី:</b> មិនទាន់បង់ ($${bill.electricityAmount || 0})`;
                if (unpaidWater)
                    tenantMessage += `\n💧 <b>ទឹកស្អាត:</b> មិនទាន់បង់ ($${bill.waterAmount || 0})`;
                tenantMessage += `\n\nសូមធ្វើការទូទាត់ឱ្យបានឆាប់តាមដែលអាចធ្វើទៅបាន។ សូមអរគុណ!`;
            }
            else {
                tenantMessage = `📢 <b>Hello ${clientName}!</b>\n\nThis is a reminder for your bill of <b>${bill.month}</b> for Room <b>${roomStr}</b>.\n`;
                if (unpaidElectricity)
                    tenantMessage += `\n⚡ <b>Electricity:</b> Unpaid ($${bill.electricityAmount || 0})`;
                if (unpaidWater)
                    tenantMessage += `\n💧 <b>Water:</b> Unpaid ($${bill.waterAmount || 0})`;
                tenantMessage += `\n\nPlease proceed with the payment at your earliest convenience. Thank you!`;
            }
            telegramSender.sendMessage(settings.telegramBotToken, bill.rental.telegramChatId, tenantMessage).catch(console.error);
        }
    }
};
const autoSendInvoiceToTenant = async (bill) => {
    try {
        if (!bill || !bill.rental || !bill.rental.telegramChatId)
            return;
        const settings = await systemSetting_1.default.getSettings();
        if (!settings || !settings.telegramBotToken)
            return;
        console.log(`Generating PDF invoice for bill ${bill.id} to send to ${bill.rental.ClientName}...`);
        const pdfBuffer = await (0, pdfGenerator_1.generateBillPdfBuffer)(bill, settings);
        const fileName = `Invoice_Room_${bill.rental.roomNumber}_${bill.month}.pdf`;
        const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';
        let caption = '';
        if (lang === 'km') {
            caption = `📄 <b>វិក្កយបត្រប្រចាំខែ: ${bill.month}</b>\nបន្ទប់: ${bill.rental.roomNumber}\n\nសូមមើលឯកសារភ្ជាប់សម្រាប់ព័ត៌មានលម្អិត។`;
        }
        else {
            caption = `📄 <b>Monthly Invoice: ${bill.month}</b>\nRoom: ${bill.rental.roomNumber}\n\nPlease find the attached PDF invoice for your details.`;
        }
        await telegramSender.sendDocument(settings.telegramBotToken, bill.rental.telegramChatId, pdfBuffer, fileName, caption);
    }
    catch (error) {
        console.error('Failed to auto-send invoice to tenant:', error);
    }
};
const getAllBills = async () => {
    return await bill_1.default.findAll();
};
exports.getAllBills = getAllBills;
const getBillById = async (id) => {
    const bill = await bill_1.default.findById(id);
    if (!bill) {
        throw new Error('Bill not found');
    }
    return bill;
};
exports.getBillById = getBillById;
const createBill = async (billData) => {
    const bill = await bill_1.default.create(billData);
    await triggerUnpaidAlertIfNeeded(bill, true);
    await autoSendInvoiceToTenant(bill);
    return bill;
};
exports.createBill = createBill;
const updateBill = async (id, billData) => {
    try {
        const bill = await bill_1.default.update(id, billData);
        if (bill === null) {
            throw new Error('No valid fields to update');
        }
        await triggerUnpaidAlertIfNeeded(bill, false);
        await autoSendInvoiceToTenant(bill);
        return bill;
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Bill not found');
        }
        throw error;
    }
};
exports.updateBill = updateBill;
const deleteBill = async (id) => {
    const deleted = await bill_1.default.delete(id);
    if (!deleted) {
        throw new Error('Bill not found');
    }
    return deleted;
};
exports.deleteBill = deleteBill;
