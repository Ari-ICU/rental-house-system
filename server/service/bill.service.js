const Bill = require('../models/bill');
const telegramSender = require('../utils/telegramSender');

const SystemSetting = require('../models/systemSetting');

const triggerUnpaidAlertIfNeeded = async (bill, isNew = false) => {
    if (!bill) return;
    const unpaidElectricity = bill.electricityStatus === 'Unpaid';
    const unpaidWater = bill.waterStatus === 'Unpaid';

    if (unpaidElectricity || unpaidWater) {
        const settings = await SystemSetting.getSettings();
        if (!settings.telegramBotToken || !settings.telegramChatId) {
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
            } else {
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

        } else {
            message = `🚨 <b>Rental Alert: Unpaid Utilities</b>\n\n`;
            if (isNew) {
                message += `A new bill was generated with outstanding charges.\n`;
            } else {
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

        // Fire and forget
        telegramSender.sendMessage(settings.telegramBotToken, settings.telegramChatId, message).catch(console.error);
    }
};

const getAllBills = async () => {
    return await Bill.findAll();
};

const getBillById = async (id) => {
    const bill = await Bill.findById(id);
    if (!bill) {
        throw new Error('Bill not found');
    }
    return bill;
};

const createBill = async (billData) => {
    const bill = await Bill.create(billData);
    await triggerUnpaidAlertIfNeeded(bill, true);
    return bill;
};

const updateBill = async (id, billData) => {
    try {
        const bill = await Bill.update(id, billData);
        if (bill === null) {
            throw new Error('No valid fields to update');
        }
        await triggerUnpaidAlertIfNeeded(bill, false);
        return bill;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Bill not found');
        }
        throw error;
    }
};

const deleteBill = async (id) => {
    const deleted = await Bill.delete(id);
    if (!deleted) {
        throw new Error('Bill not found');
    }
    return deleted;
};

module.exports = {
    getAllBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill
};
