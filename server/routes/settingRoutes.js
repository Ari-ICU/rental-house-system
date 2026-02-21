const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

module.exports = router;
