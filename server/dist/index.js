"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const hpp_1 = __importDefault(require("hpp"));
const xssSanitizer_1 = __importDefault(require("./middleware/xssSanitizer"));
const logger_1 = __importDefault(require("./utils/logger"));
const cronJobs = __importStar(require("./utils/cronJobs"));
const telegramBot = __importStar(require("./utils/telegramBot"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ── Trust proxy ───────────────────────────────────────────────────────────────
// Required when running behind Docker/nginx so that express-rate-limit can
// correctly read the real client IP from the X-Forwarded-For header.
app.set('trust proxy', 1);
// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// ── Cookie parser ─────────────────────────────────────────────────────────────
app.use((0, cookie_parser_1.default)());
// ── HTTP request logging (dev only) ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)((tokens, req, res) => {
        const method = logger_1.default.colorize(logger_1.default.colors.FG.cyan, tokens.method(req, res) || '');
        const url = logger_1.default.colorize(logger_1.default.colors.FG.white, tokens.url(req, res) || '');
        const status = Number(tokens.status(req, res));
        const statusColor = status >= 500
            ? logger_1.default.colors.FG.red
            : status >= 400
                ? logger_1.default.colors.FG.yellow
                : status >= 300
                    ? logger_1.default.colors.FG.cyan
                    : logger_1.default.colors.FG.green;
        const statusStr = logger_1.default.colorize(statusColor, status);
        const time = logger_1.default.colorize(logger_1.default.colors.FG.gray, `${tokens['response-time'](req, res)} ms`);
        return `${logger_1.default.colorize(logger_1.default.colors.FG.blue, '➜  HTTP')} ${logger_1.default.dim('›')} ${method} ${url} ${statusStr} ${time}`;
    }));
}
else {
    // In production use concise combined format
    app.use((0, morgan_1.default)('combined'));
}
// ── Security headers ──────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable if you're serving a frontend separately, or configure properly
    crossOriginEmbedderPolicy: false,
}));
// ── Rate limiting ─────────────────────────────────────────────────────────────
// More generous for standard routes, tighter for auth/payment if needed
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);
// ── Security & Sanitization ──────────────────────────────────────────────────
app.use(xssSanitizer_1.default);
app.use((0, hpp_1.default)());
// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:4000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// ── Routes ────────────────────────────────────────────────────────────────────
const rental_route_1 = __importDefault(require("./routes/rental.route"));
const bill_route_1 = __importDefault(require("./routes/bill.route"));
const report_route_1 = __importDefault(require("./routes/report.route"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const support_route_1 = __importDefault(require("./routes/support.route"));
const expense_route_1 = __importDefault(require("./routes/expense.route"));
const cameraRoutes_1 = __importDefault(require("./routes/cameraRoutes"));
app.use('/api/auth', auth_route_1.default);
app.use('/api/rentals', rental_route_1.default);
app.use('/api/bills', bill_route_1.default);
app.use('/api/reports', report_route_1.default);
app.use('/api/settings', settingRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/support', support_route_1.default);
app.use('/api/expenses', expense_route_1.default);
app.use('/api/cameras', cameraRoutes_1.default);
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy 🚀', uptime: process.uptime() });
});
// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});
// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    logger_1.default.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        data: null,
        errors: process.env.NODE_ENV === 'development' ? [err.message] : null,
        meta: null,
    });
});
// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    logger_1.default.server(`Server is running on port ${logger_1.default.bold(String(PORT))}`);
    logger_1.default.info(`Environment : ${logger_1.default.colorize(logger_1.default.colors.FG.yellow, process.env.NODE_ENV || 'development')}`);
    logger_1.default.db(`Database    : ${logger_1.default.colorize(logger_1.default.colors.FG.cyan, process.env.DATABASE_URL ? 'Connected via env' : 'No DATABASE_URL set')}`);
    // Start hourly/monthly auto checks
    cronJobs.initializeCronJobs();
    // Start Telegram Bot listener (polling)
    telegramBot.initializeBot();
});
// ── Graceful Shutdown ──────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    logger_1.default.warn(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger_1.default.info('HTTP server closed.');
        process.exit(0);
    });
    // If server takes too long to close, force it
    setTimeout(() => {
        logger_1.default.error('Could not close connections in time, forcefully shutting down.');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
