import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { unauthorizedResponse, forbiddenResponse } from '../utils/apiResponse';
import User from '../models/user';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return unauthorizedResponse(res, 'Not authorized, no token');
    }

    try {
        const decoded = verifyToken(token);

        // Fetch full user to include role and other data
        const user = await User.findById(decoded.id);

        if (!user) {
            return unauthorizedResponse(res, 'Not authorized, user not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return unauthorizedResponse(res, 'Not authorized, token failed');
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        if (!req.user || !roles.includes(req.user.role)) {
            return forbiddenResponse(res, `User role ${req.user?.role || 'Guest'} is not authorized to access this route`);
        }
        next();
    };
};
