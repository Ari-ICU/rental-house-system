import Report from '../models/report';

export const getAllReports = async (): Promise<any[]> => {
    return await Report.findAll();
};

export const getReportById = async (id: number | string): Promise<any> => {
    const report = await Report.findById(id);
    if (!report) {
        throw new Error('Report not found');
    }
    return report;
};

export const createReport = async (reportData: any): Promise<any> => {
    return await Report.create(reportData);
};

export const updateReport = async (id: number | string, reportData: any): Promise<any> => {
    try {
        const report = await Report.update(id, reportData);
        if (report === null) {
            throw new Error('No valid fields to update');
        }
        return report;
    } catch (error: any) {
        if (error.code === 'P2025') {
            throw new Error('Report not found');
        }
        throw error;
    }
};

export const deleteReport = async (id: number | string): Promise<any> => {
    const deleted = await Report.delete(id);
    if (!deleted) {
        throw new Error('Report not found');
    }
    return deleted;
};
