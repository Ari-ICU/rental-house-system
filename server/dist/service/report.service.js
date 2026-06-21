"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.updateReport = exports.createReport = exports.getReportById = exports.getAllReports = void 0;
const report_1 = __importDefault(require("../models/report"));
const getAllReports = async () => {
    return await report_1.default.findAll();
};
exports.getAllReports = getAllReports;
const getReportById = async (id) => {
    const report = await report_1.default.findById(id);
    if (!report) {
        throw new Error('Report not found');
    }
    return report;
};
exports.getReportById = getReportById;
const createReport = async (reportData) => {
    return await report_1.default.create(reportData);
};
exports.createReport = createReport;
const updateReport = async (id, reportData) => {
    try {
        const report = await report_1.default.update(id, reportData);
        if (report === null) {
            throw new Error('No valid fields to update');
        }
        return report;
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Report not found');
        }
        throw error;
    }
};
exports.updateReport = updateReport;
const deleteReport = async (id) => {
    const deleted = await report_1.default.delete(id);
    if (!deleted) {
        throw new Error('Report not found');
    }
    return deleted;
};
exports.deleteReport = deleteReport;
