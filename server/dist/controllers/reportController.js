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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.updateReport = exports.createReport = exports.getReportById = exports.getReports = void 0;
const reportService = __importStar(require("../service/report.service"));
const apiResponse_1 = require("../utils/apiResponse");
const getReports = async (req, res) => {
    try {
        const reports = await reportService.getAllReports();
        return (0, apiResponse_1.successResponse)(res, reports, 'Reports fetched successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch reports', error);
    }
};
exports.getReports = getReports;
const getReportById = async (req, res) => {
    const id = req.params.id;
    try {
        const report = await reportService.getReportById(id);
        return (0, apiResponse_1.successResponse)(res, report, 'Report fetched successfully');
    }
    catch (error) {
        if (error.message === 'Report not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Report not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to fetch report', error);
    }
};
exports.getReportById = getReportById;
const createReport = async (req, res) => {
    try {
        const report = await reportService.createReport(req.body);
        return (0, apiResponse_1.createdResponse)(res, report, 'Report created successfully');
    }
    catch (error) {
        return (0, apiResponse_1.errorResponse)(res, 'Failed to create report', error);
    }
};
exports.createReport = createReport;
const updateReport = async (req, res) => {
    const id = req.params.id;
    try {
        const updatedReport = await reportService.updateReport(id, req.body);
        return (0, apiResponse_1.successResponse)(res, updatedReport, 'Report updated successfully');
    }
    catch (error) {
        if (error.message === 'No valid fields to update') {
            return (0, apiResponse_1.validationErrorResponse)(res, ['No valid fields provided to update']);
        }
        if (error.message === 'Report not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Report not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to update report', error);
    }
};
exports.updateReport = updateReport;
const deleteReport = async (req, res) => {
    const id = req.params.id;
    try {
        await reportService.deleteReport(id);
        return (0, apiResponse_1.successResponse)(res, null, 'Report deleted successfully');
    }
    catch (error) {
        if (error.message === 'Report not found') {
            return (0, apiResponse_1.notFoundResponse)(res, 'Report not found');
        }
        return (0, apiResponse_1.errorResponse)(res, 'Failed to delete report', error);
    }
};
exports.deleteReport = deleteReport;
