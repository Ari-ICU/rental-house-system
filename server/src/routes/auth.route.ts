import express from 'express';
import authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// router.post('/register', authController.register); // Disabled for security (admin only)
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
