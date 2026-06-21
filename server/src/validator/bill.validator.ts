import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors: string[] = [];
        errors.array().map(err => extractedErrors.push(err.msg));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            data: null,
            errors: extractedErrors,
            meta: null
        });
    }
    next();
};

export const billValidationRules = () => {
    return [
        body('rentalId')
            .notEmpty()
            .withMessage('Rental ID is required')
            .isNumeric()
            .withMessage('Rental ID must be a number'),

        body('month')
            .notEmpty()
            .withMessage('Month is required')
            .isString()
            .withMessage('Month must be a string'),

        body('electricityAmount')
            .notEmpty()
            .withMessage('Electricity amount is required')
            .isNumeric()
            .withMessage('Electricity amount must be a number'),

        body('waterAmount')
            .notEmpty()
            .withMessage('Water amount is required')
            .isNumeric()
            .withMessage('Water amount must be a number'),

        body('electricityStatus')
            .notEmpty()
            .withMessage('Electricity status is required')
            .isIn(['Paid', 'Unpaid'])
            .withMessage('Electricity status must be Paid or Unpaid'),

        body('waterStatus')
            .notEmpty()
            .withMessage('Water status is required')
            .isIn(['Paid', 'Unpaid'])
            .withMessage('Water status must be Paid or Unpaid'),

        body('notes')
            .optional()
            .isString()
            .withMessage('Notes must be a string'),
    ];
};
