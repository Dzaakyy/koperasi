const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { createSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.post('/', auth, authorize('kasir'), validate(createSchema), controller.create);
router.get('/', auth, authorize('admin'), controller.getAll);
router.get('/:id', auth, controller.getById);

module.exports = router;
