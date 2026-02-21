const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123', {
        expiresIn: '30d',
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123');
};

module.exports = {
    generateToken,
    verifyToken,
};
