const prisma = require('../config/prisma');

const SystemSetting = {
    getSettings: async () => {
        let settings = await prisma.systemSetting.findFirst();
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: {
                    telegramBotToken: '',
                    telegramChatId: '',
                    telegramLanguage: 'en',
                },
            });
        }
        return settings;
    },

    updateSettings: async (data) => {
        const settings = await SystemSetting.getSettings();
        const updated = await prisma.systemSetting.update({
            where: { id: settings.id },
            data: {
                telegramBotToken: data.telegramBotToken !== undefined ? data.telegramBotToken : settings.telegramBotToken,
                telegramChatId: data.telegramChatId !== undefined ? data.telegramChatId : settings.telegramChatId,
                telegramLanguage: data.telegramLanguage || settings.telegramLanguage,
            },
        });
        return updated;
    },
};

module.exports = SystemSetting;
