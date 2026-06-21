"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => err.msg);
        return (0, apiResponse_1.validationErrorResponse)(res, extractedErrors);
    }
    next();
};
exports.default = validate;
