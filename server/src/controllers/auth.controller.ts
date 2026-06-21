import { Request, Response } from 'express';
import User from '../models/user';
import { generateToken } from '../utils/auth';
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    validationErrorResponse
} from '../utils/apiResponse';

const authController = {
    register: async (req: Request, res: Response): Promise<any> => {
        try {
            const { name, email, password, role } = req.body;

            const userExists = await User.findByEmail(email);
            if (userExists) {
                return validationErrorResponse(res, 'User already exists');
            }

            const user = await User.create({
                name,
                email,
                password,
                role: role || 'USER',
            });

            const token = generateToken(user.id);

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });

            return successResponse(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            }, 'User registered successfully');
        } catch (error) {
            console.error('Register error:', error);
            return errorResponse(res, 'Server error during registration');
        }
    },

    login: async (req: Request, res: Response): Promise<any> => {
        try {
            const { email, password } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                return unauthorizedResponse(res, 'Invalid credentials');
            }

            const isMatch = await User.comparePassword(password, user.password);
            if (!isMatch) {
                return unauthorizedResponse(res, 'Invalid credentials');
            }

            const token = generateToken(user.id);

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });

            return successResponse(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            }, 'Logged in successfully');
        } catch (error) {
            console.error('Login error:', error);
            return errorResponse(res, 'Server error during login');
        }
    },

    logout: (req: Request, res: Response): any => {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        return successResponse(res, null, 'Logged out successfully');
    },

    getMe: async (req: Request, res: Response): Promise<any> => {
        try {
            if (!req.user) {
                return unauthorizedResponse(res, 'Not authorized');
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                return errorResponse(res, 'User not found', null);
            }

            return successResponse(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error('GetMe error:', error);
            return errorResponse(res, 'Server error fetching user');
        }
    }
};

export default authController;
