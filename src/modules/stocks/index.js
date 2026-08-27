const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');
const { validate } = require('../../utils/validation');
const { addStockSchema, reduceStockSchema } = require('./validation');
const Controller = require('./controller');

router.use(auth);
router.use(authorize('admin'));

router.post('/', validate(addStockSchema), Controller.addStock);
router.post('/reduce', validate(reduceStockSchema), Controller.reduceStock);
router.get('/histories', Controller.getHistories);

module.exports = router;
