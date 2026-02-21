const { verifyToken } = require('../utils/auth');
const { errorResponse, unauthorizedResponse, forbiddenResponse } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
    let token;

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
        const User = require('../models/user');
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

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return forbiddenResponse(res, `User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };
