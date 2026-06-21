"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const auth_1 = require("../utils/auth");
const apiResponse_1 = require("../utils/apiResponse");
const user_1 = __importDefault(require("../models/user"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return (0, apiResponse_1.unauthorizedResponse)(res, 'Not authorized, no token');
    }
    try {
        const decoded = (0, auth_1.verifyToken)(token);
        // Fetch full user to include role and other data
        const user = await user_1.default.findById(decoded.id);
        if (!user) {
            return (0, apiResponse_1.unauthorizedResponse)(res, 'Not authorized, user not found');
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return (0, apiResponse_1.unauthorizedResponse)(res, 'Not authorized, token failed');
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return (0, apiResponse_1.forbiddenResponse)(res, `User role ${req.user?.role || 'Guest'} is not authorized to access this route`);
        }
        next();
    };
};
exports.authorize = authorize;
