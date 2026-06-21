import express from 'express';
import * as paymentController from '../controllers/paymentController';

const router = express.Router();

router.get('/initiate/:billId', paymentController.initiatePayment);
router.post('/webhook', paymentController.paymentWebhook);
router.post('/simulate', paymentController.simulatePaymentSuccess);

export default router;
