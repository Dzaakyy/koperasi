const express = require('express');
const router = express.Router();
const Controller = require('./controller');
const { loginSchema } = require('./validation');
const { validate } = require('../../utils/validation');

router.post('/login', validate(loginSchema), Controller.login);
router.post('/logout', Controller.logout);

module.exports = router;
