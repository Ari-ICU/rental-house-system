const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/initiate/:billId', paymentController.initiatePayment);
router.post('/webhook', paymentController.paymentWebhook);
router.post('/simulate', paymentController.simulatePaymentSuccess);

module.exports = router;
