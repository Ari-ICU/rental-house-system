const { verifyToken } = require('../utils/auth');
const apiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return apiResponse.error(res, 'Not authorized, no token', 401);
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return apiResponse.error(res, 'Not authorized, token failed', 401);
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return apiResponse.error(res, `User role ${req.user.role} is not authorized to access this route`, 403);
        }
        next();
    };
};

module.exports = { protect, authorize };
