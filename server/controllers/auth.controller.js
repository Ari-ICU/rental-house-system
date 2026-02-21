const User = require('../models/user');
const { generateToken } = require('../utils/auth');
const apiResponse = require('../utils/apiResponse');

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            const userExists = await User.findByEmail(email);
            if (userExists) {
                return apiResponse.error(res, 'User already exists', 400);
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

            return apiResponse.success(res, {
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
            return apiResponse.error(res, 'Server error during registration');
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findByEmail(email);
            if (!user) {
                return apiResponse.error(res, 'Invalid credentials', 401);
            }

            const isMatch = await User.comparePassword(password, user.password);
            if (!isMatch) {
                return apiResponse.error(res, 'Invalid credentials', 401);
            }

            const token = generateToken(user.id);

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: 'lax'
            });

            return apiResponse.success(res, {
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
            return apiResponse.error(res, 'Server error during login');
        }
    },

    logout: (req, res) => {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        return apiResponse.success(res, null, 'Logged out successfully');
    },

    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return apiResponse.error(res, 'User not found', 404);
            }

            return apiResponse.success(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error('GetMe error:', error);
            return apiResponse.error(res, 'Server error fetching user');
        }
    }
};

module.exports = authController;
