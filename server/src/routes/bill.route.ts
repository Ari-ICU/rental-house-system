import express from 'express';
import * as billController from '../controllers/billController';
import { billValidationRules, validate } from '../validator/bill.validator';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', billController.getBills);
router.get('/:id/pdf', billController.downloadBillPdf);
router.get('/:id', billController.getBillById);
router.post('/', billValidationRules(), validate, billController.createBill);
router.put('/:id', billValidationRules(), validate, billController.updateBill);
router.delete('/:id', billController.deleteBill);

export default router;
