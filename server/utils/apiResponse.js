/**
 * Unified API Response Utilities
 * ---------------------------------
 * All helpers follow the same envelope shape:
 * {
 *   success : boolean,
 *   message : string,
 *   data    : any | null,       // present on success
 *   errors  : any | null,       // present on failure
 *   meta    : object | null     // present on paginated responses
 * }
 */
const logger = require('./logger');

/**
 * 200 – Generic success
 * @param {import('express').Response} res
 * @param {any}    data
 * @param {string} message
 * @param {number} statusCode
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

/**
 * 201 – Resource created
 * @param {import('express').Response} res
 * @param {any}    data
 * @param {string} message
 */
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * 400 – Bad request / validation failure
 * @param {import('express').Response} res
 * @param {string|string[]} errors  – validation messages or array of messages
 * @param {string}          message
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

/**
 * 401 – Unauthorised
 * @param {import('express').Response} res
 * @param {string} message
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

/**
 * 403 – Forbidden
 * @param {import('express').Response} res
 * @param {string} message
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

/**
 * 404 – Not found
 * @param {import('express').Response} res
 * @param {string} message
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

/**
 * 409 – Conflict (e.g. duplicate record)
 * @param {import('express').Response} res
 * @param {string} message
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

/**
 * 500 – Internal server error
 * @param {import('express').Response} res
 * @param {string}  message
 * @param {Error}   [err]     – original error object (logged server-side only)
 */
const errorResponse = (res, message = 'Internal server error', err = null) => {
    if (err) {
        logger.error(message, err.message || err);
    }
    return res.status(500).json({
        success: false,
        message,
        data: null,
        errors: process.env.NODE_ENV === 'development' && err ? [err.message] : null,
        meta: null,
    });
};

/**
 * 200 – Paginated list response
 * @param {import('express').Response} res
 * @param {any[]}  data
 * @param {object} pagination  – { page, limit, total, totalPages }
 * @param {string} message
 */
const paginatedResponse = (res, data = [], pagination = {}, message = 'Success') => {
    const { page = 1, limit = 10, total = 0 } = pagination;
    const totalPages = pagination.totalPages ?? Math.ceil(total / limit);

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

module.exports = {
    successResponse,
    createdResponse,
    validationErrorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    errorResponse,
    paginatedResponse,
};
