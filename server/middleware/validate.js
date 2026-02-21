const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/apiResponse');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => err.msg);
        return validationErrorResponse(res, extractedErrors);
    }
    next();
};

module.exports = validate;
