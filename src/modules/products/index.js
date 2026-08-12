const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');
const { validate } = require('../../utils/validation');
const { createSchema, updateSchema } = require('./validation');
const controller = require('./controller');

router.use(auth);

router.get('/', controller.getAll);
router.get('/barcode/:barcode', controller.getByBarcode);
router.get('/:id', controller.getById);
router.post('/', authorize('admin'), validate(createSchema), controller.create);
router.put('/:id', authorize('admin'), validate(updateSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
