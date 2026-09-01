const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { createSchema, updateSchema, changePasswordSchema } = require('./validation');
const { validate } = require('../../utils/validation');
const auth = require('../../middleware/auth');
const authorize = require('../../middleware/authorization');

router.use(auth);


router.get('/', authorize('admin', 'super_admin'), Controller.getAll);
router.get('/:id', authorize('admin', 'super_admin'), Controller.getById);
router.post('/', authorize('super_admin'),validate(createSchema), Controller.create);
router.put('/:id', authorize('super_admin'), validate(updateSchema), Controller.update);
router.patch('/:id/password',authorize('super_admin'), validate(changePasswordSchema), Controller.changePassword);
router.delete('/:id',authorize('super_admin'), Controller.remove);

module.exports = router;
