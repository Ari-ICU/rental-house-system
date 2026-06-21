import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/apiResponse';

const validate = (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => err.msg);
        return validationErrorResponse(res, extractedErrors);
    }
    next();
};

export default validate;
