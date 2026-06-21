"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../utils/logger"));
// Load env vars
dotenv_1.default.config();
const requiredEnvVars = ['DATABASE_URL'];
const validateConfig = () => {
    const missing = requiredEnvVars.filter(env => !process.env[env]);
    if (missing.length > 0) {
        logger_1.default.error(`🚨 Missing required environment variables: ${missing.join(', ')}`);
        logger_1.default.warn('The application may not function correctly.');
    }
};
validateConfig();
const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    dbUrl: process.env.DATABASE_URL,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:4000'],
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
    }
};
exports.default = config;
