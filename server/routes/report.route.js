const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);
router.post('/', reportController.createReport);
router.put('/:id', reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
