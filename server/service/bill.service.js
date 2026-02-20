const Bill = require('../models/bill');
const telegramSender = require('../utils/telegramSender');

const triggerUnpaidAlertIfNeeded = async (bill, isNew = false) => {
    if (!bill) return;
    const unpaidElectricity = bill.electricityStatus === 'Unpaid';
    const unpaidWater = bill.waterStatus === 'Unpaid';

    // Alert if either is unpaid
    if (unpaidElectricity || unpaidWater) {
        const clientName = bill.rental?.ClientName || 'Unknown Client';
        const roomStr = bill.rental?.roomNumber || 'Unknown Room';

        let message = `🚨 <b>Rental Alert: Unpaid Utilities</b>\n\n`;
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

        // Fire and forget
        telegramSender.sendMessage(message).catch(console.error);
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
