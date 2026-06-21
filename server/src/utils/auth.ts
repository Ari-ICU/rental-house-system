import jwt from 'jsonwebtoken';

export const generateToken = (userId: number | string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123', {
        expiresIn: '30d',
    });
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123');
};
