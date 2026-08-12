const express = require('express');
const router = express.Router();
const controller = require('./controller');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.get('/sales', auth, authorize('admin'), controller.getSalesReport);
router.get('/stocks', auth, authorize('admin'), controller.getStockReport);
router.get('/profit', auth, authorize('admin'), controller.getProfitReport);

module.exports = router;
