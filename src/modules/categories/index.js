const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { createSchema, updateSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.use(auth);
router.use(authorize('admin'));

router.get('/', Controller.getAll);
router.get('/:id', Controller.getById);
router.post('/', validate(createSchema), Controller.create);
router.put('/:id', validate(updateSchema), Controller.update);
router.delete('/:id', Controller.remove);

module.exports = router;
