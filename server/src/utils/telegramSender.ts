import TelegramBot from 'node-telegram-bot-api';

export const sendMessage = async (botToken: string | null | undefined, chatId: string | null | undefined, text: string): Promise<void> => {
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

        const data: any = await response.json();
        if (!data.ok) {
            console.error('Failed to send Telegram message:', data);
        } else {
            console.log('Telegram message successfully sent.');
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

export const sendDocument = async (
    botToken: string | null | undefined,
    chatId: string | null | undefined,
    documentBuffer: Buffer,
    filename: string,
    caption = ''
): Promise<void> => {
    if (!botToken || !chatId) {
        console.log('Telegram bot/chatId is missing for sending document.');
        return;
    }
    try {
        const tempBot = new TelegramBot(botToken, { polling: false });
        await tempBot.sendDocument(chatId, documentBuffer, {
            caption: caption,
            parse_mode: 'HTML'
        }, {
            filename: filename,
            contentType: 'application/pdf'
        });
        console.log('Document sent successfully.');
    } catch (error: any) {
        console.error('Error sending document via TelegramBot:', error.message);
    }
};
