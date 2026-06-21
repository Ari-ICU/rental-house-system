import { Request, Response } from 'express';
import * as billService from '../service/bill.service';
import { generateBillPdfBuffer } from '../utils/pdfGenerator';
import SystemSetting from '../models/systemSetting';
import {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} from '../utils/apiResponse';

export const getBills = async (req: Request, res: Response): Promise<any> => {
    try {
        const bills = await billService.getAllBills();
        return successResponse(res, bills, 'Bills fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch bills', error);
    }
};

export const getBillById = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const bill = await billService.getBillById(id);
        return successResponse(res, bill, 'Bill fetched successfully');
    } catch (error: any) {
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to fetch bill', error);
    }
};

export const createBill = async (req: Request, res: Response): Promise<any> => {
    try {
        const bill = await billService.createBill(req.body);
        return createdResponse(res, bill, 'Bill created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create bill', error);
    }
};

export const updateBill = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const updatedBill = await billService.updateBill(id, req.body);
        return successResponse(res, updatedBill, 'Bill updated successfully');
    } catch (error: any) {
        if (error.message === 'No valid fields to update') {
            return validationErrorResponse(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to update bill', error);
    }
};

export const deleteBill = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        await billService.deleteBill(id);
        return successResponse(res, null, 'Bill deleted successfully');
    } catch (error: any) {
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to delete bill', error);
    }
};

export const downloadBillPdf = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const bill = await billService.getBillById(id);
        const settings = await SystemSetting.getSettings();
        const pdfBuffer = await generateBillPdfBuffer(bill, settings);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_Room_${bill?.rental?.roomNumber || 'Unknown'}_${bill?.month}.pdf`);
        return res.send(pdfBuffer);
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        if (error.message === 'Bill not found') {
            return notFoundResponse(res, 'Bill not found');
        }
        return errorResponse(res, 'Failed to generate PDF', error);
    }
};
