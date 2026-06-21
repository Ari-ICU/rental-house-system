import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load env vars
dotenv.config();

const requiredEnvVars = ['DATABASE_URL'];

const validateConfig = (): void => {
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
        logger.error(`🚨 Missing required environment variables: ${missing.join(', ')}`);
        logger.warn('The application may not function correctly.');
    }
};

validateConfig();

interface Config {
    env: string;
    port: number | string;
    dbUrl: string | undefined;
    allowedOrigins: string[];
    telegram: {
        token: string | undefined;
        chatId: string | undefined;
    };
}

const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    dbUrl: process.env.DATABASE_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:4000'],
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
    }
};

export default config;
