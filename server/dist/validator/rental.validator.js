"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalValidationRules = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
const rentalValidationRules = () => {
    return [
        (0, express_validator_1.body)('ClientName')
            .notEmpty()
            .withMessage('ClientName is required')
            .isString()
            .withMessage('ClientName must be a string'),
        (0, express_validator_1.body)('roomNumber')
            .notEmpty()
            .withMessage('roomNumber is required')
            .isString()
            .withMessage('roomNumber must be a string'),
        (0, express_validator_1.body)('status')
            .notEmpty()
            .withMessage('status is required')
            .isString()
            .withMessage('status must be a string'),
        (0, express_validator_1.body)('rentAmount')
            .notEmpty()
            .withMessage('rentAmount is required')
            .isNumeric()
            .withMessage('rentAmount must be a number'),
        (0, express_validator_1.body)('startDate')
            .optional()
            .isString()
            .withMessage('startDate must be a string (e.g., ISO date)'),
        (0, express_validator_1.body)('endDate')
            .optional()
            .isString()
            .withMessage('endDate must be a string'),
        (0, express_validator_1.body)('clientEmail')
            .optional()
            .isEmail()
            .withMessage('clientEmail must be a valid email address'),
        (0, express_validator_1.body)('clientPhone')
            .optional()
            .isString()
            .withMessage('clientPhone must be a string')
    ];
};
exports.rentalValidationRules = rentalValidationRules;
