const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { rentalValidationRules, validate } = require('../validator/rental.validator');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // Protect all rental routes

router.get('/', rentalController.getRentals);
router.get('/export', rentalController.exportRentals);
router.get('/:id', rentalController.getRentalById);
router.post('/', rentalValidationRules(), validate, rentalController.createRental);
router.put('/:id', rentalValidationRules(), validate, rentalController.updateRental);
router.delete('/:id', rentalController.deleteRental);

module.exports = router;
