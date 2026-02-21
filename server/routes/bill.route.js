const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { billValidationRules, validate } = require('../validator/bill.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', billController.getBills);
router.get('/:id', billController.getBillById);
router.post('/', billValidationRules(), validate, billController.createBill);
router.put('/:id', billValidationRules(), validate, billController.updateBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
