const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { createSchema, updateSchema, changePasswordSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.use(auth);
router.use(authorize('admin'));

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createSchema), controller.create);
router.put('/:id', validate(updateSchema), controller.update);
router.patch('/:id/password', validate(changePasswordSchema), controller.changePassword);
router.delete('/:id', controller.remove);

module.exports = router;
