"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billValidationRules = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = [];
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
exports.validate = validate;
const billValidationRules = () => {
    return [
        (0, express_validator_1.body)('rentalId')
            .notEmpty()
            .withMessage('Rental ID is required')
            .isNumeric()
            .withMessage('Rental ID must be a number'),
        (0, express_validator_1.body)('month')
            .notEmpty()
            .withMessage('Month is required')
            .isString()
            .withMessage('Month must be a string'),
        (0, express_validator_1.body)('electricityAmount')
            .notEmpty()
            .withMessage('Electricity amount is required')
            .isNumeric()
            .withMessage('Electricity amount must be a number'),
        (0, express_validator_1.body)('waterAmount')
            .notEmpty()
            .withMessage('Water amount is required')
            .isNumeric()
            .withMessage('Water amount must be a number'),
        (0, express_validator_1.body)('electricityStatus')
            .notEmpty()
            .withMessage('Electricity status is required')
            .isIn(['Paid', 'Unpaid'])
            .withMessage('Electricity status must be Paid or Unpaid'),
        (0, express_validator_1.body)('waterStatus')
            .notEmpty()
            .withMessage('Water status is required')
            .isIn(['Paid', 'Unpaid'])
            .withMessage('Water status must be Paid or Unpaid'),
        (0, express_validator_1.body)('notes')
            .optional()
            .isString()
            .withMessage('Notes must be a string'),
    ];
};
exports.billValidationRules = billValidationRules;
