"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.initializeBot = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const systemSetting_1 = __importDefault(require("../models/systemSetting"));
const logger_1 = __importDefault(require("./logger"));
let botInstance = null;
let currentToken = null;
const initializeBot = async () => {
    try {
        const settings = await systemSetting_1.default.getSettings();
        const token = settings?.telegramBotToken;
        if (!token) {
            if (botInstance) {
                logger_1.default.info('Removing Telegram bot as token was cleared.');
                botInstance.stopPolling();
                botInstance = null;
                currentToken = null;
            }
            return;
        }
        // Check if token changed or bot not started
        if (botInstance && currentToken === token) {
            return botInstance;
        }
        // If something old exists with a different token, stop it
        if (botInstance) {
            logger_1.default.info('Restarting Telegram bot helper with new token...');
            botInstance.stopPolling();
        }
        botInstance = new node_telegram_bot_api_1.default(token, { polling: true });
        currentToken = token;
        // Handle polling errors to prevent console spam and stop bot if token is invalid
        botInstance.on('polling_error', (error) => {
            logger_1.default.error(`Telegram Polling Error: ${error.message}`);
            if (error.code === 'ETELEGRAM' && error.message.includes('404')) {
                logger_1.default.error('Invalid Telegram Bot Token detected (404 Not Found). Stopping polling.');
                if (botInstance) {
                    botInstance.stopPolling();
                    botInstance = null;
                    currentToken = null;
                }
            }
        });
        botInstance.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            if (text === '/start' || text === '/myid') {
                // Fetch fresh settings for language preference
                const currentSettings = await systemSetting_1.default.getSettings();
                const lang = currentSettings?.telegramLanguage === 'km' ? 'km' : 'en';
                let reply = '';
                if (lang === 'km') {
                    reply = `👋 សួស្តី! នេះគឺជាលេខសម្គាល់ Telegram របស់អ្នក៖\n\n🆔 <code>${chatId}</code>\n\nសូមចម្លងលេខនេះ ហើយផ្ញើវាទៅកាន់ម្ចាស់ផ្ទះជួលរបស់អ្នក ដើម្បីទទួលបានវិក្កយបត្រតាមរយៈ Telegram។`;
                }
                else {
                    reply = `👋 Hello! Here is your Telegram Chat ID:\n\n🆔 <code>${chatId}</code>\n\nPlease copy this number and give it to your landlord to receive your bills directly via Telegram.`;
                }
                if (botInstance) {
                    botInstance.sendMessage(chatId, reply, { parse_mode: 'HTML' });
                }
            }
        });
        logger_1.default.info('Telegram Bot Helper (polling) started successfully.');
        return botInstance;
    }
    catch (error) {
        logger_1.default.error('Failed to initialize Telegram Bot Helper:', error.message);
    }
};
exports.initializeBot = initializeBot;
const sendMessage = async (message, chatId = null) => {
    try {
        const settings = await systemSetting_1.default.getSettings();
        const token = settings?.telegramBotToken;
        const targetChatId = chatId || settings?.telegramChatId;
        if (!token || !targetChatId) {
            logger_1.default.warn('Telegram token or target chat ID not set. Cannot send message.');
            return false;
        }
        const tempBot = new node_telegram_bot_api_1.default(token, { polling: false });
        await tempBot.sendMessage(targetChatId, message, { parse_mode: 'Markdown' });
        return true;
    }
    catch (error) {
        logger_1.default.error('Failed to send Telegram message:', error.message);
        return false;
    }
};
exports.sendMessage = sendMessage;
