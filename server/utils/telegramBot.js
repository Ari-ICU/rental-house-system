const TelegramBot = require('node-telegram-bot-api');
const SystemSetting = require('../models/systemSetting');
const logger = require('./logger');

let botInstance = null;

const initializeBot = async () => {
    try {
        const settings = await SystemSetting.getSettings();
        const token = settings.telegramBotToken;

        if (!token) {
            logger.info('Telegram Bot Token not found in settings. Bot helper is disabled.');
            return;
        }

        // Avoid multiple instances
        if (botInstance) return botInstance;

        botInstance = new TelegramBot(token, { polling: true });

        botInstance.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (text === '/start' || text === '/myid') {
                const lang = settings.telegramLanguage === 'km' ? 'km' : 'en';

                let reply = '';
                if (lang === 'km') {
                    reply = `👋 សួស្តី! នេះគឺជាលេខសម្គាល់ Telegram របស់អ្នក៖\n\n🆔 <code>${chatId}</code>\n\nសូមចម្លងលេខនេះ ហើយផ្ញើវាទៅកាន់ម្ចាស់ផ្ទះជួលរបស់អ្នក ដើម្បីទទួលបានវិក្កយបត្រតាមរយៈ Telegram។`;
                } else {
                    reply = `👋 Hello! Here is your Telegram Chat ID:\n\n🆔 <code>${chatId}</code>\n\nPlease copy this number and give it to your landlord to receive your bills directly via Telegram.`;
                }

                botInstance.sendMessage(chatId, reply, { parse_mode: 'HTML' });
            }
        });

        logger.info('Telegram Bot Helper (polling) started successfully.');
        return botInstance;
    } catch (error) {
        logger.error('Failed to initialize Telegram Bot Helper:', error.message);
    }
};

module.exports = {
    initializeBot,
};
