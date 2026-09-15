const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { createSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.post('/', auth, authorize('kasir'), validate(createSchema), Controller.create);
router.get('/', auth, authorize('admin', 'kasir' ,'super_admin'), Controller.getAll);
router.get('/:id', auth, authorize('admin', 'kasir' ,'super_admin'), Controller.getById);

module.exports = router;
