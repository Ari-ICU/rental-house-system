import { Request, Response } from 'express';
import SystemSetting from '../models/systemSetting';
import { successResponse, errorResponse } from '../utils/apiResponse';
import * as telegramBot from '../utils/telegramBot';

export const getSettings = async (req: Request, res: Response): Promise<any> => {
    try {
        const settings = await SystemSetting.getSettings();
        return successResponse(res, settings, 'Settings fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch settings', error);
    }
};

export const updateSettings = async (req: Request, res: Response): Promise<any> => {
    try {
        const updatedSettings = await SystemSetting.updateSettings(req.body);

        // Refresh Telegram Bot if settings changed
        telegramBot.initializeBot();

        return successResponse(res, updatedSettings, 'Settings updated successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to update settings', error);
    }
};
