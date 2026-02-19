const Report = require('../models/report');

const getAllReports = async () => {
    return await Report.findAll();
};

const getReportById = async (id) => {
    const report = await Report.findById(id);
    if (!report) {
        throw new Error('Report not found');
    }
    return report;
};

const createReport = async (reportData) => {
    return await Report.create(reportData);
};

const updateReport = async (id, reportData) => {
    try {
        const report = await Report.update(id, reportData);
        if (report === null) {
            throw new Error('No valid fields to update');
        }
        return report;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Report not found');
        }
        throw error;
    }
};

const deleteReport = async (id) => {
    const deleted = await Report.delete(id);
    if (!deleted) {
        throw new Error('Report not found');
    }
    return deleted;
};

module.exports = {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport
};
