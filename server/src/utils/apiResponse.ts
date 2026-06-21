import { Response } from 'express';
import logger from './logger';

export interface ApiResponseEnvelope<T = any> {
    success: boolean;
    message: string;
    data: T | null;
    errors: string[] | null;
    meta: ApiResponsePaginationMeta | null;
}

export interface ApiResponsePaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * 200 – Generic success
 */
export const successResponse = <T>(res: Response, data: T | null = null, message = 'Success', statusCode = 200): Response => {
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
 */
export const createdResponse = <T>(res: Response, data: T | null = null, message = 'Resource created successfully'): Response => {
    return successResponse(res, data, message, 201);
};

/**
 * 400 – Bad request / validation failure
 */
export const validationErrorResponse = (res: Response, errors: string | string[] = [], message = 'Validation failed'): Response => {
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
 */
export const unauthorizedResponse = (res: Response, message = 'Unauthorized'): Response => {
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
 */
export const forbiddenResponse = (res: Response, message = 'Forbidden'): Response => {
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
 */
export const notFoundResponse = (res: Response, message = 'Resource not found'): Response => {
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
 */
export const conflictResponse = (res: Response, message = 'Conflict'): Response => {
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
 */
export const errorResponse = (res: Response, message = 'Internal server error', err: any = null): Response => {
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

export interface PaginationInput {
    page?: number | string;
    limit?: number | string;
    total?: number | string;
    totalPages?: number | string;
}

/**
 * 200 – Paginated list response
 */
export const paginatedResponse = <T>(res: Response, data: T[] = [], pagination: PaginationInput = {}, message = 'Success'): Response => {
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
