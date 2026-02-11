const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

// GET /api/v1/admin/dashboard/stats
router.get('/stats', dashboardController.getStats);

module.exports = router;
