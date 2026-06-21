import express from 'express';
import * as rentalController from '../controllers/rentalController';
import { rentalValidationRules, rentalUpdateValidationRules, validate } from '../validator/rental.validator';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // Protect all rental routes

router.get('/', rentalController.getRentals);
router.get('/export', rentalController.exportRentals);
router.get('/:id', rentalController.getRentalById);
router.post('/', rentalValidationRules(), validate, rentalController.createRental);
router.put('/:id', rentalUpdateValidationRules(), validate, rentalController.updateRental);
router.delete('/:id', rentalController.deleteRental);

export default router;
