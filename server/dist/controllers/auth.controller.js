"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../models/user"));
const auth_1 = require("../utils/auth");
const apiResponse_1 = require("../utils/apiResponse");
const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            const userExists = await user_1.default.findByEmail(email);
            if (userExists) {
                return (0, apiResponse_1.validationErrorResponse)(res, 'User already exists');
            }
            const user = await user_1.default.create({
                name,
                email,
                password,
                role: role || 'USER',
            });
            const token = (0, auth_1.generateToken)(user.id);
            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });
            return (0, apiResponse_1.successResponse)(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            }, 'User registered successfully');
        }
        catch (error) {
            console.error('Register error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Server error during registration');
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await user_1.default.findByEmail(email);
            if (!user) {
                return (0, apiResponse_1.unauthorizedResponse)(res, 'Invalid credentials');
            }
            const isMatch = await user_1.default.comparePassword(password, user.password);
            if (!isMatch) {
                return (0, apiResponse_1.unauthorizedResponse)(res, 'Invalid credentials');
            }
            const token = (0, auth_1.generateToken)(user.id);
            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });
            return (0, apiResponse_1.successResponse)(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            }, 'Logged in successfully');
        }
        catch (error) {
            console.error('Login error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Server error during login');
        }
    },
    logout: (req, res) => {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        return (0, apiResponse_1.successResponse)(res, null, 'Logged out successfully');
    },
    getMe: async (req, res) => {
        try {
            if (!req.user) {
                return (0, apiResponse_1.unauthorizedResponse)(res, 'Not authorized');
            }
            const user = await user_1.default.findById(req.user.id);
            if (!user) {
                return (0, apiResponse_1.errorResponse)(res, 'User not found', null);
            }
            return (0, apiResponse_1.successResponse)(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('GetMe error:', error);
            return (0, apiResponse_1.errorResponse)(res, 'Server error fetching user');
        }
    }
};
exports.default = authController;
