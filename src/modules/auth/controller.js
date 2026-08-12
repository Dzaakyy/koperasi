const service = require('./service');
const apiResponse = require('../../utils/api');

async function login(req, res, next) {
  try {
    const result = await service.login(req.body.username, req.body.password);
    return apiResponse.success(res, 'Login berhasil', result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login
};
