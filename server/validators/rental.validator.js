const { body } = require('express-validator');

const createRentalValidator = [
    body('ClientName')
        .notEmpty().withMessage('Client name is required')
        .isString().withMessage('Client name must be a string')
        .trim(),
    body('roomNumber')
        .notEmpty().withMessage('Room number is required')
        .isString().withMessage('Room number must be a string')
        .trim(),
    body('rentAmount')
        .notEmpty().withMessage('Rent amount is required')
        .isNumeric().withMessage('Rent amount must be a number'),
    body('status')
        .optional()
        .isIn(['Active', 'Reserved', 'Completed', 'Maintenance'])
        .withMessage('Invalid status'),
    body('clientPhone')
        .optional()
        .isString().withMessage('Phone must be a string'),
    body('clientEmail')
        .optional()
        .isEmail().withMessage('Invalid email format'),
];

module.exports = {
    createRentalValidator,
};
