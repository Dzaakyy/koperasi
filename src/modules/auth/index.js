const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { loginSchema } = require('./validation');
const { validate } = require('../../utils/validation');

router.post('/login', validate(loginSchema), controller.login);

module.exports = router;
