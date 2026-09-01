const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');
const { validate } = require('../../utils/validation');
const { createSchema, updateSchema } = require('./validation');
const Controller = require('./controller');

router.use(auth);

router.get('/', Controller.getAll);
router.get('/barcode/:barcode', Controller.getByBarcode);
router.get('/:id', Controller.getById);
router.post('/', authorize('admin', 'super_admin'), validate(createSchema), Controller.create);
router.put('/:id', authorize('admin', 'super_admin'), validate(updateSchema), Controller.update);
router.delete('/:id', authorize('admin', 'super_admin'), Controller.remove);

module.exports = router;
