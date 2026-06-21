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
exports.downloadBillPdf = exports.deleteBill = exports.updateBill = exports.createBill = exports.getBillById = exports.getBills = void 0;
const billService = __importStar(require("../service/bill.service"));
const pdfGenerator_1 = require("../utils/pdfGenerator");
const systemSetting_1 = __importDefault(require("../models/systemSetting"));
const apiResponse_1 = require("../utils/apiResponse");
const getBills = async (req, res) => {
    try {
        const bills = await billService.getAllBills();
        return (0, apiResponse_1.successResponse)(res, bills, 'Bills fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch bills', error);
    }
};
exports.getBills = getBills;
const getBillById = async (req, res) => {
    const id = req.params.id;
    try {
        const bill = await billService.getBillById(id);
        return (0, apiResponse_1.successResponse)(res, bill, 'Bill fetched successfully');
    }
    catch (error) {
        if (error.message === 'Bill not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Bill not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch bill', error);
    }
};
exports.getBillById = getBillById;
const createBill = async (req, res) => {
    try {
        const bill = await billService.createBill(req.body);
        return (0, apiResponse_1.createdResponse)(res, bill, 'Bill created successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to create bill', error);
    }
};
exports.createBill = createBill;
const updateBill = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedBill = await billService.updateBill(id, req.body);
        return (0, apiResponse_1.successResponse)(res, updatedBill, 'Bill updated successfully');
    }
    catch (error) {
        if (error.message === 'No valid fields to update') {
            return (0, apiResponse_1.validationErrorResponse)(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Bill not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Bill not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to update bill', error);
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res) => {
    const id = req.params.id;
    try {
        await billService.deleteBill(id);
        return (0, apiResponse_1.successResponse)(res, null, 'Bill deleted successfully');
    }
    catch (error) {
        if (error.message === 'Bill not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Bill not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to delete bill', error);
    }
};
exports.deleteBill = deleteBill;
const downloadBillPdf = async (req, res) => {
    const id = req.params.id;
    try {
        const bill = await billService.getBillById(id);
        const settings = await systemSetting_1.default.getSettings();
        const pdfBuffer = await (0, pdfGenerator_1.generateBillPdfBuffer)(bill, settings);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_Room_${bill?.rental?.roomNumber || 'Unknown'}_${bill?.month}.pdf`);
        return res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        if (error.message === 'Bill not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Bill not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to generate PDF', error);
    }
};
exports.downloadBillPdf = downloadBillPdf;
