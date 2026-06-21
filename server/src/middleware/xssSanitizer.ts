import { Request, Response, NextFunction } from 'express';

const sanitize = (data: any): any => {
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
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitize(value);
        }
        return sanitized;
    }
    return data;
};

const xssSanitizer = (req: Request, res: Response, next: NextFunction): void => {
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

export default xssSanitizer;
