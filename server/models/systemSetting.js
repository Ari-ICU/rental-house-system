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
                    paymentBakongAccountId: '',
                    paywayMerchantId: '',
                    paywayApiKey: '',
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
                paymentBakongAccountId: data.paymentBakongAccountId !== undefined ? data.paymentBakongAccountId : settings.paymentBakongAccountId,
                paywayMerchantId: data.paywayMerchantId !== undefined ? data.paywayMerchantId : settings.paywayMerchantId,
                paywayApiKey: data.paywayApiKey !== undefined ? data.paywayApiKey : settings.paywayApiKey,
            },
        });
        return updated;
    },
};

module.exports = SystemSetting;
