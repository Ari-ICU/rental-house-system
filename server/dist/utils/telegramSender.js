"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDocument = exports.sendMessage = void 0;
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const sendMessage = async (botToken, chatId, text) => {
    if (!botToken || !chatId) {
        console.log('Telegram bot is not configured in settings.');
        return;
    }
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
            }),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error('Failed to send Telegram message:', data);
        }
        else {
            console.log('Telegram message successfully sent.');
        }
    }
    catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};
exports.sendMessage = sendMessage;
const sendDocument = async (botToken, chatId, documentBuffer, filename, caption = '') => {
    if (!botToken || !chatId) {
        console.log('Telegram bot/chatId is missing for sending document.');
        return;
    }
    try {
        const tempBot = new node_telegram_bot_api_1.default(botToken, { polling: false });
        await tempBot.sendDocument(chatId, documentBuffer, {
            caption: caption,
            parse_mode: 'HTML'
        }, {
            filename: filename,
            contentType: 'application/pdf'
        });
        console.log('Document sent successfully.');
    }
    catch (error) {
        console.error('Error sending document via TelegramBot:', error.message);
    }
};
exports.sendDocument = sendDocument;
