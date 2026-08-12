const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');
const { validate } = require('../../utils/validation');
const { addStockSchema } = require('./validation');
const controller = require('./controller');

router.use(auth);
router.use(authorize('admin'));

router.post('/', validate(addStockSchema), controller.addStock);
router.get('/histories', controller.getHistories);

module.exports = router;
