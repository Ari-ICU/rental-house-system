import express from 'express';
import supportController from '../controllers/supportController';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public route for creating tickets
router.post('/', supportController.createTicket);

// Protected routes for managing tickets
router.get('/', protect, authorize('ADMIN'), supportController.getTickets);
router.patch('/:id/status', protect, authorize('ADMIN'), supportController.updateTicketStatus);
router.delete('/:id', protect, authorize('ADMIN'), supportController.deleteTicket);

export default router;
