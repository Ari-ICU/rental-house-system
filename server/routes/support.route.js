const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route for creating tickets
router.post('/', supportController.createTicket);

// Protected routes for managing tickets
router.get('/', protect, authorize('ADMIN'), supportController.getTickets);
router.patch('/:id/status', protect, authorize('ADMIN'), supportController.updateTicketStatus);
router.delete('/:id', protect, authorize('ADMIN'), supportController.deleteTicket);

module.exports = router;

