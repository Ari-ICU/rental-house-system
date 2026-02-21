const SystemSetting = require('../models/systemSetting');
const {
    successResponse,
    errorResponse,
} = require('../utils/apiResponse');

const telegramBot = require('../utils/telegramBot');

const getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.getSettings();
        return successResponse(res, settings, 'Settings fetched successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to fetch settings', error);
    }
};

const updateSettings = async (req, res) => {
    try {
        const updatedSettings = await SystemSetting.updateSettings(req.body);

        // Refresh Telegram Bot if settings changed
        telegramBot.initializeBot();

        return successResponse(res, updatedSettings, 'Settings updated successfully');
    } catch (error) {
        return errorResponse(res, 'Failed to update settings', error);
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
