const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.get('/sales', auth, authorize('admin'), Controller.getSalesReport);
router.get('/stocks', auth, authorize('admin'), Controller.getStockReport);
router.get('/profit', auth, authorize('admin'), Controller.getProfitReport);

module.exports = router;
