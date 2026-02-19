const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const logger = require('./utils/logger');

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
app.use(helmet());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
});
app.use(limiter);

// ── Prevent HTTP param pollution ──────────────────────────────────────────────
app.use(hpp());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors());

// ── Routes ────────────────────────────────────────────────────────────────────
const rentalRoutes = require('./routes/rental.route');
const billRoutes = require('./routes/bill.route');
const reportRoutes = require('./routes/report.route');
app.use('/api/rentals', rentalRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);

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
app.listen(PORT, () => {
    logger.server(`Server is running on port ${logger.bold(String(PORT))}`);
    logger.info(`Environment : ${logger.colorize(logger.colors.FG.yellow, process.env.NODE_ENV || 'development')}`);
    logger.db(`Database    : ${logger.colorize(logger.colors.FG.cyan, process.env.DATABASE_URL ? 'Connected via env' : 'No DATABASE_URL set')}`);
});
