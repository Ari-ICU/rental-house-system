/**
 * ─────────────────────────────────────────────
 *  logger.js  –  Zero-dependency colored logger
 *  Uses ANSI escape codes (works in Docker/TTY)
 * ─────────────────────────────────────────────
 */

// ── ANSI color palette ───────────────────────────────────────────────────────
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

const FG = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
};

const BG = {
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const colorize = (color, text) => `${color}${text}${RESET}`;
const bold = (text) => `${BOLD}${text}${RESET}`;
const dim = (text) => `${DIM}${text}${RESET}`;
const timestamp = () => colorize(FG.gray, `[${new Date().toISOString()}]`);

// ── Log-level icons ──────────────────────────────────────────────────────────
const ICONS = {
    info: colorize(FG.cyan, '◉  INFO'),
    success: colorize(FG.green, '✔  SUCCESS'),
    warn: colorize(FG.yellow, '⚠  WARN'),
    error: colorize(FG.red, '✖  ERROR'),
    debug: colorize(FG.magenta, '⬡  DEBUG'),
    http: colorize(FG.blue, '➜  HTTP'),
    db: colorize(FG.cyan, '⛁  DB'),
    server: colorize(FG.green, `${BOLD}🚀 SERVER`),
};

// ── Core logger ──────────────────────────────────────────────────────────────
const log = (level, message, ...args) => {
    const icon = ICONS[level] ?? level.toUpperCase();
    const parts = [`${timestamp()} ${icon} ${dim('›')} ${message}`];
    if (args.length) parts.push(...args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a));
    // Errors go to stderr; everything else to stdout
    if (level === 'error') {
        console.error(parts.join(' '));
    } else {
        console.log(parts.join(' '));
    }
};

// ── Public API ───────────────────────────────────────────────────────────────
const logger = {
    /** Generic informational message */
    info: (msg, ...a) => log('info', msg, ...a),

    /** Positive outcome – operation succeeded */
    success: (msg, ...a) => log('success', msg, ...a),

    /** Something unexpected but non-fatal */
    warn: (msg, ...a) => log('warn', msg, ...a),

    /** Errors and exceptions */
    error: (msg, ...a) => log('error', msg, ...a),

    /** Verbose / development-only details */
    debug: (msg, ...a) => {
        if (process.env.NODE_ENV !== 'production') log('debug', msg, ...a);
    },

    /** Incoming HTTP requests */
    http: (msg, ...a) => log('http', msg, ...a),

    /** Database operations */
    db: (msg, ...a) => log('db', msg, ...a),

    /** Server lifecycle events */
    server: (msg, ...a) => log('server', msg, ...a),

    // ── Raw color helpers (for inline use) ───────────────────────────────────
    colors: { FG, BG, RESET, BOLD, DIM },
    colorize,
    bold,
    dim,
};

module.exports = logger;
