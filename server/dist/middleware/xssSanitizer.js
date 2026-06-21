"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize = (data) => {
    if (typeof data === 'string') {
        return data
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    if (Array.isArray(data)) {
        return data.map(v => sanitize(v));
    }
    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitize(value);
        }
        return sanitized;
    }
    return data;
};
const xssSanitizer = (req, res, next) => {
    if (req.body)
        req.body = sanitize(req.body);
    if (req.query)
        req.query = sanitize(req.query);
    if (req.params)
        req.params = sanitize(req.params);
    next();
};
exports.default = xssSanitizer;
