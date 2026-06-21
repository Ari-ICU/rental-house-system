import express from 'express';
import * as settingController from '../controllers/settingController';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

export default router;
