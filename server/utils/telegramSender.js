const sendMessage = async (text) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log('Telegram bot is not configured properly in .env variables.');
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
        } else {
            console.log('Telegram message successfully sent.');
        }
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

module.exports = {
    sendMessage,
};
