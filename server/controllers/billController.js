const billService = require('../service/bill.service');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} = require('../utils/apiResponse');

const getBills = async (req, res) => {
    try {
        const bills = await billService.getAllBills();
        return successResponse(res, bills, 'Bills fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch bills', error);
    }
};

const getBillById = async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await billService.getBillById(id);
        return successResponse(res, bill, 'Bill fetched successfully');
    } catch (error) {
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to fetch bill', error);
    }
};

const createBill = async (req, res) => {
    try {
        const bill = await billService.createBill(req.body);
        return createdResponse(res, bill, 'Bill created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create bill', error);
    }
};

const updateBill = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedBill = await billService.updateBill(id, req.body);
        return successResponse(res, updatedBill, 'Bill updated successfully');
    } catch (error) {
        if (error.message === 'No valid fields to update') {
            return validationErrorResponse(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to update bill', error);
    }
};

const deleteBill = async (req, res) => {
    const { id } = req.params;
    try {
        await billService.deleteBill(id);
        return successResponse(res, null, 'Bill deleted successfully');
    } catch (error) {
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to delete bill', error);
    }
};

module.exports = {
    getBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill,
};
