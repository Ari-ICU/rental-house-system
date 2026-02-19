const Bill = require('../models/bill');

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
    return await Bill.create(billData);
};

const updateBill = async (id, billData) => {
    try {
        const bill = await Bill.update(id, billData);
        if (bill === null) {
            throw new Error('No valid fields to update');
        }
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
