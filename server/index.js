const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xssSanitizer = require('./middleware/xssSanitizer');
const logger = require('./utils/logger');
const cronJobs = require('./utils/cronJobs');
const telegramBot = require('./utils/telegramBot');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Trust proxy ───────────────────────────────────────────────────────────────
// Required when running behind Docker/nginx so that express-rate-limit can
// correctly read the real client IP from the X-Forwarded-For header.
app.set('trust proxy', 1);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── Cookie parser ─────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── HTTP request logging (dev only) ──────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan((tokens, req, res) => {
        const method = logger.colorize(logger.colors.FG.cyan, tokens.method(req, res));
        const url = logger.colorize(logger.colors.FG.white, tokens.url(req, res));
        const status = Number(tokens.status(req, res));
        const statusColor = status >= 500
            ? logger.colors.FG.red
            : status >= 400
                ? logger.colors.FG.yellow
                : status >= 300
                    ? logger.colors.FG.cyan
                    : logger.colors.FG.green;
        const statusStr = logger.colorize(statusColor, status);
        const time = logger.colorize(logger.colors.FG.gray, `${tokens['response-time'](req, res)} ms`);
        return `${logger.colorize(logger.colors.FG.blue, '➜  HTTP')} ${logger.dim('›')} ${method} ${url} ${statusStr} ${time}`;
    }));
} else {
    // In production use concise combined format
    app.use(morgan('combined'));
}

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Disable if you're serving a frontend separately, or configure properly
    crossOriginEmbedderPolicy: false,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// More generous for standard routes, tighter for auth/payment if needed
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

// ── Security & Sanitization ──────────────────────────────────────────────────
app.use(xssSanitizer);
app.use(hpp());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:4000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ── Routes ────────────────────────────────────────────────────────────────────
const rentalRoutes = require('./routes/rental.route');
const billRoutes = require('./routes/bill.route');
const reportRoutes = require('./routes/report.route');
const settingRoutes = require('./routes/settingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/auth.route');

app.use('/api/auth', authRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/payments', paymentRoutes);

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
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err.message);
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
    logger.server(`Server is running on port ${logger.bold(String(PORT))}`);
    logger.info(`Environment : ${logger.colorize(logger.colors.FG.yellow, process.env.NODE_ENV || 'development')}`);
    logger.db(`Database    : ${logger.colorize(logger.colors.FG.cyan, process.env.DATABASE_URL ? 'Connected via env' : 'No DATABASE_URL set')}`);

    // Start hourly/monthly auto checks
    cronJobs.initializeCronJobs();

    // Start Telegram Bot listener (polling)
    telegramBot.initializeBot();
});

// ── Graceful Shutdown ──────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    server.close(() => {
        logger.info('HTTP server closed.');

        // Add DB disconnect logic if prisma is exported or accessible here
        // For now, let the process exit
        process.exit(0);
    });

    // If server takes too long to close, force it
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
