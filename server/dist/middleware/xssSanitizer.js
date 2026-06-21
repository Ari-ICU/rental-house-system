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
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        const sanitized = sanitize(req.query);
        for (const key of Object.keys(req.query)) {
            delete req.query[key];
        }
        Object.assign(req.query, sanitized);
    }
    if (req.params) {
        const sanitized = sanitize(req.params);
        for (const key of Object.keys(req.params)) {
            delete req.params[key];
        }
        Object.assign(req.params, sanitized);
    }
    next();
};
exports.default = xssSanitizer;
