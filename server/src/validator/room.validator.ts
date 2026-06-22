import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const roomValidationRules = () => {
    return [
        body('roomNumber')
            .notEmpty()
            .withMessage('roomNumber is required')
            .isString()
            .withMessage('roomNumber must be a string'),

        body('rentAmount')
            .notEmpty()
            .withMessage('rentAmount is required')
            .isNumeric()
            .withMessage('rentAmount must be a number')
    ];
};

export const roomUpdateValidationRules = () => {
    return [
        body('roomNumber')
            .optional()
            .isString()
            .withMessage('roomNumber must be a string'),

        body('rentAmount')
            .optional()
            .isNumeric()
            .withMessage('rentAmount must be a number')
    ];
};
