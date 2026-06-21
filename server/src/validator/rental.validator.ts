import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const rentalValidationRules = () => {
    return [
        body('ClientName')
            .notEmpty()
            .withMessage('ClientName is required')
            .isString()
            .withMessage('ClientName must be a string'),

        body('roomNumber')
            .notEmpty()
            .withMessage('roomNumber is required')
            .isString()
            .withMessage('roomNumber must be a string'),

        body('status')
            .notEmpty()
            .withMessage('status is required')
            .isString()
            .withMessage('status must be a string'),

        body('rentAmount')
            .notEmpty()
            .withMessage('rentAmount is required')
            .isNumeric()
            .withMessage('rentAmount must be a number'),

        body('startDate')
            .optional()
            .isString()
            .withMessage('startDate must be a string (e.g., ISO date)'),

        body('endDate')
            .optional()
            .isString()
            .withMessage('endDate must be a string'),

        body('clientEmail')
            .optional()
            .isEmail()
            .withMessage('clientEmail must be a valid email address'),

        body('clientPhone')
            .optional()
            .isString()
            .withMessage('clientPhone must be a string')
    ];
};
