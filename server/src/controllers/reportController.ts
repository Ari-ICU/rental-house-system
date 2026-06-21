import { Request, Response } from 'express';
import * as reportService from '../service/report.service';
import {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} from '../utils/apiResponse';

export const getReports = async (req: Request, res: Response): Promise<any> => {
    try {
        const reports = await reportService.getAllReports();
        return successResponse(res, reports, 'Reports fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch reports', error);
    }
};

export const getReportById = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const report = await reportService.getReportById(id);
        return successResponse(res, report, 'Report fetched successfully');
    } catch (error: any) {
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to fetch report', error);
    }
};

export const createReport = async (req: Request, res: Response): Promise<any> => {
    try {
        const report = await reportService.createReport(req.body);
        return createdResponse(res, report, 'Report created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create report', error);
    }
};

export const updateReport = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        const updatedReport = await reportService.updateReport(id, req.body);
        return successResponse(res, updatedReport, 'Report updated successfully');
    } catch (error: any) {
        if (error.message === 'No valid fields to update') {
            return validationErrorResponse(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to update report', error);
    }
};

export const deleteReport = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id as string;
    try {
        await reportService.deleteReport(id);
        return successResponse(res, null, 'Report deleted successfully');
    } catch (error: any) {
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to delete report', error);
    }
};
