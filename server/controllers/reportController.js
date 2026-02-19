const reportService = require('../service/report.service');
const {
    successResponse,
    createdResponse,
    notFoundResponse,
    validationErrorResponse,
    errorResponse,
} = require('../utils/apiResponse');

const getReports = async (req, res) => {
    try {
        const reports = await reportService.getAllReports();
        return successResponse(res, reports, 'Reports fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch reports', error);
    }
};

const getReportById = async (req, res) => {
    const { id } = req.params;
    try {
        const report = await reportService.getReportById(id);
        return successResponse(res, report, 'Report fetched successfully');
    } catch (error) {
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to fetch report', error);
    }
};

const createReport = async (req, res) => {
    try {
        const report = await reportService.createReport(req.body);
        return createdResponse(res, report, 'Report created successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to create report', error);
    }
};

const updateReport = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedReport = await reportService.updateReport(id, req.body);
        return successResponse(res, updatedReport, 'Report updated successfully');
    } catch (error) {
        if (error.message === 'No valid fields to update') {
            return validationErrorResponse(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to update report', error);
    }
};

const deleteReport = async (req, res) => {
    const { id } = req.params;
    try {
        await reportService.deleteReport(id);
        return successResponse(res, null, 'Report deleted successfully');
    } catch (error) {
        if (error.message === 'Report not found') {
            return notFoundResponse(res, 'Report not found');
        }
        return errorResponse(res, 'Failed to delete report', error);
    }
};

module.exports = {
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
};
