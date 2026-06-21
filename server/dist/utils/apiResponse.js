"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.errorResponse = exports.conflictResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.validationErrorResponse = exports.createdResponse = exports.successResponse = void 0;
const logger_1 = __importDefault(require("./logger"));
/**
 * 200 – Generic success
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        errors: null,
        meta: null,
    });
};
exports.successResponse = successResponse;
/**
 * 201 – Resource created
 */
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
    return (0, exports.successResponse)(res, data, message, 201);
};
exports.createdResponse = createdResponse;
/**
 * 400 – Bad request / validation failure
 */
const validationErrorResponse = (res, errors = [], message = 'Validation failed') => {
    return res.status(400).json({
        success: false,
        message,
        data: null,
        errors: Array.isArray(errors) ? errors : [errors],
        meta: null,
    });
};
exports.validationErrorResponse = validationErrorResponse;
/**
 * 401 – Unauthorised
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return res.status(401).json({
        success: false,
        message,
        data: null,
        errors: null,
        meta: null,
    });
};
exports.unauthorizedResponse = unauthorizedResponse;
/**
 * 403 – Forbidden
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
    return res.status(403).json({
        success: false,
        message,
        data: null,
        errors: null,
        meta: null,
    });
};
exports.forbiddenResponse = forbiddenResponse;
/**
 * 404 – Not found
 */
const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        message,
        data: null,
        errors: null,
        meta: null,
    });
};
exports.notFoundResponse = notFoundResponse;
/**
 * 409 – Conflict (e.g. duplicate record)
 */
const conflictResponse = (res, message = 'Conflict') => {
    return res.status(409).json({
        success: false,
        message,
        data: null,
        errors: null,
        meta: null,
    });
};
exports.conflictResponse = conflictResponse;
/**
 * 500 – Internal server error
 */
const errorResponse = (res, message = 'Internal server error', err = null) => {
    if (err) {
        logger_1.default.error(message, err.message || err);
    }
    return res.status(500).json({
        success: false,
        message,
        data: null,
        errors: process.env.NODE_ENV === 'development' && err ? [err.message] : null,
        meta: null,
    });
};
exports.errorResponse = errorResponse;
/**
 * 200 – Paginated list response
 */
const paginatedResponse = (res, data = [], pagination = {}, message = 'Success') => {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const total = pagination.total ?? 0;
    const totalPages = pagination.totalPages ?? Math.ceil(Number(total) / Number(limit));
    return res.status(200).json({
        success: true,
        message,
        data,
        errors: null,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total: Number(total),
            totalPages: Number(totalPages),
        },
    });
};
exports.paginatedResponse = paginatedResponse;
