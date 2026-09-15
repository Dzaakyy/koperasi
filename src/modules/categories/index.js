const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { createSchema, updateSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.get('/', auth, authorize('admin', 'kasir', 'super_admin'), Controller.getAll);
router.get('/:id', auth, authorize('admin', 'kasir', 'super_admin'), Controller.getById);
router.post('/', auth, authorize('admin', 'super_admin'), validate(createSchema), Controller.create);
router.put('/:id', auth, authorize('admin', 'super_admin'), validate(updateSchema), Controller.update);
router.delete('/:id', auth, authorize('admin', 'super_admin'), Controller.remove);

module.exports = router;
