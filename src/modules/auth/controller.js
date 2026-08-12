const service = require('./service');
const apiResponse = require('../../utils/api');

async function login(req, res, next) {
  try {
    const result = await service.login(req.body.username, req.body.password);
    
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    const responseData = { user: result.user };
    return apiResponse.success(res, 'Login berhasil', responseData);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie('token');
    return apiResponse.success(res, 'Logout berhasil');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout
};
