const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');
const { validate } = require('../../utils/validation');
const { addStockSchema } = require('./validation');
const Controller = require('./controller');

router.use(auth);
router.use(authorize('admin'));

router.post('/', validate(addStockSchema), Controller.addStock);
router.get('/histories', Controller.getHistories);

module.exports = router;
