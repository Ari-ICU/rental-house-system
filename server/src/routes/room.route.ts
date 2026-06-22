import express from 'express';
import * as roomController from '../controllers/roomController';
import { roomValidationRules, roomUpdateValidationRules, validate } from '../validator/room.validator';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // Protect all room routes

router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomValidationRules(), validate, roomController.createRoom);
router.put('/:id', roomUpdateValidationRules(), validate, roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

export default router;
